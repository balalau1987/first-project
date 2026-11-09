---
name: max-bot-builder
description: Создание ботов для мессенджера MAX (max.ru) через MAX Bot API. Использовать, когда пользователь хочет бота для MAX, упоминает MasterBot, botapi.max.ru / platform-api*.max.ru, вебхуки или long polling MAX, кнопки и вложения в MAX, или подключение MAX-бота к сайту.
---

# MAX Bot Builder

Источник: официальная OpenAPI-спецификация MAX Bot API (`schema.yaml` рядом с этим файлом, из github.com/max-messenger/max-bot-api-client-go, лицензия Apache 2.0). При сомнении в полях и параметрах искать в `schema.yaml` (grep по `operationId`), а не угадывать.

## Основное
- Бота и токен создаёт **@MasterBot** в MAX (https://max.ru/MasterBot).
- Хост API: `https://platform-api2.max.ru` (так в официальном Go-клиенте; `botapi.max.ru` и `platform-api.max.ru` устарели). При ошибке подключения сверить хост на dev.max.ru.
- Авторизация: заголовок `Authorization: <TOKEN>`. Токен только в переменных окружения (`MAX_BOT_TOKEN`), никогда в коде и git.
- Формат: JSON, UTF-8. Время в миллисекундах Unix (`timestamp * 1000`).
- Ошибки: HTTP-код и `{"code": "...", "message": "..."}`. 429 означает превышение лимита: повторить с паузой.

## Методы
| Метод | Путь | Назначение |
|---|---|---|
| GET | `/me` | информация о боте |
| GET | `/updates` | long polling (до 50 событий; `marker`, `timeout`, `types`) |
| POST | `/subscriptions` | включить вебхук: `{"url": ..., "secret": ..., "update_types": [...]}` |
| GET / DELETE | `/subscriptions` | список / отключение вебхука |
| POST | `/messages?chat_id=…` или `?user_id=…` | отправить сообщение |
| PUT / DELETE | `/messages?message_id=…` | изменить / удалить |
| GET | `/messages` | история чата |
| POST | `/answers?callback_id=…` | ответ на нажатие callback-кнопки |
| POST | `/uploads?type=image\|video\|audio\|file` | получить URL для загрузки файла |
| GET | `/chats`, `/chats/{chatId}` | чаты бота |

## Получение событий
- **Long polling**: включён по умолчанию, удобен для разработки.
- **Webhook**: для продакшна. Вебхук и polling одновременно использовать **нельзя**.
  - Порт сервера: 80, 8080, 443, 8443 или 16384–32383, HTTPS.
  - Задать `secret` (5–256 символов `A-Za-z0-9_-`) и проверять заголовок `X-Max-Bot-Api-Secret` в каждом запросе.
  - Быстро отвечать `200 OK`. Любой другой ответ вызывает повторную доставку (каждые 30–60 с, до 8 часов), поэтому обработка должна быть идемпотентной.
  - По умолчанию не более 100 уведомлений в секунду.
- Типы событий (`update_type`): `message_created`, `message_callback`, `message_edited`, `message_removed`, `bot_started`, `bot_stopped`, `bot_added`, `bot_removed`, `user_added`, `user_removed`, `chat_title_changed`, `message_chat_created`, `dialog_cleared`, `dialog_muted`, `dialog_unmuted`, `dialog_removed`.

## Кнопки
Вложение `inline_keyboard`, в `payload.buttons` массив рядов:
```json
{"text": "Выберите", "attachments": [{"type": "inline_keyboard", "payload": {"buttons": [
  [{"type": "callback", "text": "Заказать", "payload": "order"}],
  [{"type": "link", "text": "Сайт", "url": "https://example.com"}]
]}}]}
```
Типы: `callback` (боту приходит событие `message_callback`), `link`, `request_contact`, `request_geo_location`, `chat`.

## Диплинки (связь с сайтом)
`https://max.ru/<BOT_USERNAME>/start/<PAYLOAD>`: payload до 128 символов приходит боту в событии `bot_started`. Подходит для кнопки «Написать в MAX» на сайте: в payload передавать источник или номер заказа.

## Форматирование
Поле `format`: `"markdown"` или `"html"`. Поддерживаются жирный, курсив, зачёркнутый, подчёркнутый, код и ссылки.

## Порядок работы
1. Минимальный бот на long polling: `/me`, затем цикл `/updates` с `marker` и ответ на `message_created`.
2. Логику держать отдельно от транспорта, чтобы один код обслуживал и MAX, и Telegram (см. скилл `telegram-bot-builder`).
3. Для продакшна перейти на вебхук с проверкой секрета.
