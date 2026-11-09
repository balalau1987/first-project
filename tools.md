# Скиллы и плагины для Claude

Каталог источников. Перед установкой скилла от сообщества — прочитать его файлы.

## Официальные (в приоритете)
- https://github.com/anthropics/skills — официальные скиллы Anthropic.
- Официальный каталог плагинов Claude Code (Anthropic).

## Подборки сообщества
- https://github.com/ComposioHQ/awesome-claude-skills — крупнейшая, по категориям.
- https://github.com/hesreallyhim/awesome-claude-code — скиллы, хуки, команды, агенты, плагины.
- https://github.com/travisvn/awesome-claude-skills — небольшая, хорошо отобранная.
- https://github.com/BehiSecc/awesome-claude-skills — 120+ скиллов, включая исследования и медиа.
- https://github.com/alirezarezvani/claude-skills — ~190 профессиональных скиллов.
- https://github.com/quemsah/awesome-claude-plugins — индекс 15 000+ плагинов.

## Как пользоваться
1. Найти нужный скилл в списках выше (сначала — в официальных).
2. Просмотреть его `SKILL.md` и скрипты.
3. Положить в `.claude/skills/<имя>/` этого репозитория — тогда Claude подхватит его автоматически.

## Установлено
Из anthropics/skills (коммит 2c5958e, лицензия Apache 2.0) в `.claude/skills/`: все 19 официальных скиллов (docx, xlsx, pdf, pptx, academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, frontend-design, internal-comms, mcp-builder, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing).

## Сайты и боты (установлено)
- `telegram-bot-builder`: davila7/claude-code-templates, MIT. Telegram Bot API, Node.js и Python.
- `max-bot-builder`: свой скилл по официальной спецификации MAX Bot API (max-messenger/max-bot-api-client-go, Apache 2.0).
- `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-deploy-to-vercel`: vercel-labs/agent-skills, MIT.
- Не установлен `web-design-guidelines` (Vercel): при каждом запуске загружает инструкции с внешнего адреса.
