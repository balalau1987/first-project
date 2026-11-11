"""HTML/CSS анимации и Lottie JSON шаблоны."""
import json
import os

HTML = """<!doctype html><html lang="ru"><meta charset="utf-8"><title>{name}</title>
<style>
body{{margin:0;height:100vh;display:grid;place-items:center;background:#1b1b1b;font-family:Arial,sans-serif;overflow:hidden}}
{css}
</style><body>{body}</body></html>"""

TEMPLATES = {
    "title": ("""
.t{color:#ffe500;font-size:84px;font-weight:900;text-align:center;animation:pop .8s cubic-bezier(.2,1.6,.4,1) both}
@keyframes pop{from{transform:scale(0) rotate(-10deg);opacity:0}to{transform:none;opacity:1}}""",
              '<div class="t">{title}</div>'),
    "mistake": ("""
.m{color:#fff;font-size:64px;background:#d32f2f;padding:30px 50px;border-radius:16px;animation:shake .5s 2,slide .6s both}
@keyframes slide{from{transform:translateX(-120%)}to{transform:none}}
@keyframes shake{25%{transform:translateX(-12px)}75%{transform:translateX(12px)}}""",
                '<div class="m">❌ {title}</div>'),
    "tip": ("""
.g{color:#fff;font-size:64px;background:#2e7d32;padding:30px 50px;border-radius:16px;animation:rise .7s both}
@keyframes rise{from{transform:translateY(100px);opacity:0}to{transform:none;opacity:1}}""",
            '<div class="g">✅ {title}</div>'),
}


def lottie_template(name, w=512, h=512, frames=60):
    """Минимальный валидный Lottie: пульсирующий круг."""
    return {
        "v": "5.7.0", "fr": 30, "ip": 0, "op": frames, "w": w, "h": h, "nm": name, "ddd": 0, "assets": [],
        "layers": [{
            "ddd": 0, "ind": 1, "ty": 4, "nm": "circle", "sr": 1, "ip": 0, "op": frames, "st": 0,
            "ks": {"o": {"a": 0, "k": 100}, "r": {"a": 0, "k": 0},
                   "p": {"a": 0, "k": [w / 2, h / 2, 0]}, "a": {"a": 0, "k": [0, 0, 0]},
                   "s": {"a": 1, "k": [
                       {"t": 0, "s": [60, 60, 100], "i": {"x": [.5], "y": [1]}, "o": {"x": [.5], "y": [0]}},
                       {"t": frames // 2, "s": [100, 100, 100], "i": {"x": [.5], "y": [1]}, "o": {"x": [.5], "y": [0]}},
                       {"t": frames, "s": [60, 60, 100]}]}},
            "shapes": [{"ty": "gr", "it": [
                {"ty": "el", "p": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [200, 200]}},
                {"ty": "fl", "c": {"a": 0, "k": [1, 0.9, 0, 1]}, "o": {"a": 0, "k": 100}},
                {"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]},
                 "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}}]}],
        }],
    }


def generate(out_dir, title="Вася Знает"):
    d = os.path.join(out_dir, "animations")
    os.makedirs(d, exist_ok=True)
    files = []
    for name, (css, body) in TEMPLATES.items():
        p = os.path.join(d, f"{name}.html")
        with open(p, "w", encoding="utf-8") as f:
            f.write(HTML.format(name=name, css=css, body=body.format(title=title)))
        files.append(p)
    p = os.path.join(d, "pulse.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(lottie_template("pulse"), f)
    files.append(p)
    return files
