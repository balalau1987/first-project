"""Скачивание аудио (yt-dlp) + транскрипция (Whisper, CUDA если есть)."""
import os


def get_device():
    """cuda, если реально работает, иначе cpu."""
    try:
        import torch
        if torch.cuda.is_available():
            torch.zeros(1).to("cuda")  # проверка: arch видеокарты поддерживается сборкой torch
            return "cuda"
    except Exception as e:
        print(f"   ⚠️ CUDA не работает: {str(e)[:120]}")
    print("🐢 Используется CPU (медленнее)")
    return "cpu"


def download_audio(url, out_dir):
    import yt_dlp
    os.makedirs(out_dir, exist_ok=True)
    opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(out_dir, "audio_%(id)s.%(ext)s"),
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3"}],
        "quiet": True,
        "noplaylist": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    vid = info["id"]
    return os.path.join(out_dir, f"audio_{vid}.mp3"), vid, info.get("title", vid)


def transcribe(audio_path, model_name="base", lang="ru"):
    """Возвращает список сегментов [{start, end, text}]."""
    import whisper
    device = get_device()
    print(f"🎙 Whisper '{model_name}' на {device}...")
    model = whisper.load_model(model_name, device=device)
    result = model.transcribe(audio_path, language=lang, fp16=(device == "cuda"))
    return [{"start": s["start"], "end": s["end"], "text": s["text"].strip()}
            for s in result["segments"]]


def fmt_time(t):
    m, s = divmod(int(t), 60)
    return f"{m:02d}:{s:02d}"


def save_transcript(segments, path):
    with open(path, "w", encoding="utf-8") as f:
        for s in segments:
            f.write(f"[{fmt_time(s['start'])} - {fmt_time(s['end'])}] {s['text']}\n")
    return path


def full_text(segments):
    return " ".join(s["text"] for s in segments)
