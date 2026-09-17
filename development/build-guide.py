from pathlib import Path

from guide_content import CHAPTERS, FAQ, GLOSSARY, ROUTES
from guide_manual import render_manual


target = Path(__file__).with_name("help-v7.html")
html = render_manual(CHAPTERS, ROUTES, GLOSSARY, FAQ, "it")
target.write_text(html, encoding="utf-8")
print(f"Italian guide generated: {len(html):,} characters, {len(CHAPTERS)} chapters")
