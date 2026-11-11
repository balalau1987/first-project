"""Анализ текста через локальную Ollama (llama3.2). Без внешних зависимостей."""
import json
import urllib.request
import urllib.error

URL = "http://localhost:11434"
MODEL = "llama3.2"


def ollama_running():
    try:
        urllib.request.urlopen(URL + "/api/tags", timeout=3)
        return True
    except Exception:
        return False


def ask(prompt, model=MODEL):
    if not ollama_running():
        raise RuntimeError("❌ Ollama не запущена. Запустите: ollama serve")
    req = urllib.request.Request(
        URL + "/api/generate",
        data=json.dumps({"model": model, "prompt": prompt, "stream": False}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read())["response"].strip()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Ollama вернула ошибку {e.code}. Модель скачана? ollama pull {model}")


def analyze(text):
    prompt = f"""Ты — редактор YouTube-канала про строительство. Ответь на русском.
Разбери транскрипт и выдай разделы:
1. КЛЮЧЕВЫЕ ТЕЗИСЫ (5-7 пунктов)
2. КРАТКОЕ РЕЗЮМЕ (3-4 предложения)
3. ВАРИАНТЫ ЗАГОЛОВКОВ (5 кликабельных штук)
4. ХЭШТЕГИ (10 штук)

ТРАНСКРИПТ:
{text[:12000]}"""
    return ask(prompt)
