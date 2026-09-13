from pathlib import Path
from html import escape


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
GUIDE_FRAGMENTS = {
    "it": ROOT / "development" / "help-v7.html",
    "en": ROOT / "development" / "help-v7-en.html",
}


def build_standalone_guide(language: str) -> Path:
    """Wrap one exact embedded guide fragment in a standalone localized page."""
    DOCS.mkdir(parents=True, exist_ok=True)
    fragment = GUIDE_FRAGMENTS[language].read_text(encoding="utf-8")
    if language == "it":
        title = "chicCanva · Guida completa"
        subtitle = "La stessa guida utente incorporata nell'app, disponibile anche come documento autonomo."
        back = "↑ Inizio"
        back_label = "Torna all'inizio"
        output = DOCS / "user-guide.html"
    else:
        title = "chicCanva · Complete guide"
        subtitle = "The same user guide embedded in the app, also available as a standalone document."
        back = "↑ Top"
        back_label = "Back to top"
        output = DOCS / "user-guide-en.html"
    css = r"""
:root{--ink:#18302c;--muted:#62736f;--paper:#fff;--wash:#f3f7f4;--accent:#27816f;--line:#d7e1dd;--warm:#fff7df}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--wash);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
header{background:#fff;border-bottom:1px solid var(--line);padding:24px clamp(20px,5vw,72px)}header h1{margin:0;font-size:clamp(28px,4vw,44px)}header p{margin:4px 0 0;color:var(--muted)}main{max-width:1380px;margin:auto;padding:28px clamp(14px,3vw,42px) 80px}.guide-intro{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:20px}.guide-callout,.guide-example{background:var(--warm);border-left:4px solid #e8b845;padding:12px 16px;border-radius:8px}.guide-shell{display:grid;grid-template-columns:minmax(230px,300px) minmax(0,1fr);gap:22px;align-items:start}.guide-toc{position:sticky;top:16px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px}.guide-toc summary{font-weight:800;cursor:pointer}.guide-toc nav{display:grid;gap:3px;margin-top:10px}.guide-toc a{color:var(--ink);text-decoration:none;padding:7px 9px;border-radius:8px}.guide-toc a:hover{background:#e6f2ee;color:#145f51}.guide-body{min-width:0}.guide-body>section{background:#fff;border:1px solid var(--line);border-radius:18px;padding:clamp(18px,3vw,34px);margin-bottom:18px;scroll-margin-top:18px}.guide-body h3{font-size:clamp(22px,3vw,31px);margin:0 0 12px}.guide-body h4{margin:24px 0 6px}.guide-body table{width:100%;border-collapse:collapse;display:block;overflow:auto}.guide-body th,.guide-body td{border:1px solid var(--line);padding:10px;text-align:left}.guide-body th{background:#edf6f2}.guide-body details{border-top:1px solid var(--line);padding:12px 0}.guide-body summary{cursor:pointer}kbd{background:#edf1ef;border:1px solid #bbc9c4;border-radius:5px;padding:2px 6px;font:inherit;font-size:.88em}.back{position:fixed;right:18px;bottom:18px;background:var(--accent);color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;box-shadow:0 5px 20px #1235}
@media(max-width:850px){.guide-shell{display:block}.guide-toc{position:static;max-height:none;margin-bottom:18px}.guide-toc:not([open]){padding-bottom:14px}}
@media print{body{background:#fff}.guide-toc,.back,header p{display:none}.guide-shell{display:block}.guide-body>section{border:0;break-inside:avoid;padding:0;margin:0 0 22px}}
"""
    html = f"""<!doctype html>
<html lang="{language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)}</title><style>{css}</style></head>
<body id="top"><header><h1>{escape(title)}</h1><p>{escape(subtitle)}</p></header>
<main>{fragment}</main><a class="back" href="#top" aria-label="{escape(back_label)}">{escape(back)}</a></body></html>"""
    output.write_text(html, encoding="utf-8")
    return output


if __name__ == "__main__":
    outputs = [build_standalone_guide(language) for language in GUIDE_FRAGMENTS]
    print("Documentation guides: " + ", ".join(f"{path.name} {path.stat().st_size} bytes" for path in outputs))
