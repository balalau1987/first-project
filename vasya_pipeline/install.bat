@echo off
chcp 65001 >nul
echo === Установка Вася Знает ===
REM RTX 3050 (Ampere): подходит CUDA 12.1 (cu121).
python -m pip install --upgrade pip
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
python -m pip install -U yt-dlp openai-whisper
where ffmpeg >nul 2>nul || echo [!] ffmpeg не найден: winget install Gyan.FFmpeg  (или https://ffmpeg.org/download.html)
where ollama >nul 2>nul || echo [!] Ollama не найдена: https://ollama.com , затем: ollama pull llama3.2
echo Готово. Проверка: python pipeline.py --step check
pause
