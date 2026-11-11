@echo off
chcp 65001 >nul
echo === Установка Вася Знает ===
REM Для RTX 50xx (Blackwell) нужен CUDA 12.8 (cu128). cu121 такие карты НЕ поддерживает.
python -m pip install --upgrade pip
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
python -m pip install -U yt-dlp openai-whisper
where ffmpeg >nul 2>nul || echo [!] ffmpeg не найден: winget install Gyan.FFmpeg  (или https://ffmpeg.org/download.html)
where ollama >nul 2>nul || echo [!] Ollama не найдена: https://ollama.com , затем: ollama pull llama3.2
echo Готово. Проверка: python pipeline.py --step check
pause
