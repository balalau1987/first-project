# Дядя Вася в HeyGen — как сгенерировать аватар

## 1. Внешность (HeyGen → Avatars → Create → Generate AI Avatar / Photo Avatar)
Промпт (лучше на английском, HeyGen понимает его точнее):

> Photorealistic Russian man, 50 years old, friendly tired face, short grey-brown hair,
> light stubble, small smile with squinted eyes, wearing orange construction safety helmet
> pushed slightly back, dark blue work jacket with reflective stripes over a checkered flannel shirt,
> standing on a construction site, blurred concrete and rebar in background, soft daylight,
> vertical 9:16 frame, chest-up shot, looking straight at camera.

Чтобы лицо было одинаковым во всех роликах:
- Сгенерировать 4–6 вариантов, выбрать одного и **сохранить его как аватар** — дальше всегда брать его.
- Позы/фоны менять через «Add Look» у того же аватара, а не генерировать нового.
- Сохранить картинку анфас в `vasya_pipeline/assets/vasya_face.png` (нужно для SadTalker/MuseTalk, чтобы потом обойтись без HeyGen).

## 2. Голос
- В HeyGen: русский мужской голос, низкий, спокойный, скорость 1.0–1.1.
- Или загрузить готовый mp3 из ElevenLabs (Audio → Upload) — голос будет одинаковый везде.

## 3. Настройки видео
- Формат 9:16 (1080×1920), длина до 60 сек.
- Текст сценария вставлять из блока «Текст для HeyGen» — паузы уже стоят (`...`).
- На бесплатном тарифе ~3 видео: тратить на лучшие сценарии, остальные — через SadTalker.
