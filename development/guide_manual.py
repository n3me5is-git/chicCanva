from __future__ import annotations

import base64
from html import escape
from pathlib import Path


def bi(it: str, en: str) -> dict[str, str]:
    return {"it": it, "en": en}


def tr(value, language: str):
    if isinstance(value, dict) and "it" in value and "en" in value:
        return value[language]
    return value


ICONS = {
    "select": '<path d="M5 4v15l4-4 3 6 3-1-3-6h6z"/>',
    "hand": '<path d="M8 11V6a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v3-1a2 2 0 0 1 4 0v5c0 5-3 7-7 7h-1c-3 0-5-2-7-5l-2-3a2 2 0 0 1 3-2z"/>',
    "zoom": '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6M7 10h6"/>',
    "copy": '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    "group": '<rect x="3" y="4" width="8" height="8" rx="1"/><rect x="13" y="12" width="8" height="8" rx="1"/><path d="M7 15h4m-2-2v4M13 7h4m-2-2v4"/>',
    "crop": '<path d="M7 2v15a3 3 0 0 0 3 3h12M2 7h15a3 3 0 0 1 3 3v12"/>',
    "shape": '<rect x="3" y="4" width="8" height="8" rx="1"/><circle cx="17" cy="16" r="4"/>',
    "image": '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    "spark": '<path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    "export": '<path d="M12 15V3m0 0L7 8m5-5 5 5M4 14v6h16v-6"/>',
    "undo": '<path d="M9 7 4 12l5 5M5 12h8a6 6 0 0 1 6 6"/>',
    "grid": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    "delete": '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
    "fit": '<path d="M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5"/>',
}


def icon(name: str, label: str = "") -> str:
    path = ICONS.get(name, ICONS["spark"])
    aria = f' aria-label="{escape(label)}" role="img"' if label else ' aria-hidden="true"'
    return f'<svg class="guide-icon" viewBox="0 0 24 24"{aria}>{path}</svg>'


# These marks mirror the live controls in v6-ui.html, enhancements.js and
# ai-annotations.html. Keep them in sync when a product control changes.
UI_MARKS = {
    "hand": "✋", "zoom_out": "−", "zoom_in": "+", "preview": "▦", "page": "+",
    "select": "▧", "rotate": "↻", "crop": "⌗", "grid": "#", "snap": "⊞",
    "group": "⊞", "ungroup": "⊟", "split": "✂", "front": "↑", "back": "↓",
    "annotation_select": "↖", "rect": "▭", "oval": "⬭", "point": "●",
    "fit": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "copy": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    "paste": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6M9 3h6v4H9z"/><rect x="5" y="5" width="14" height="16" rx="2"/></svg>',
    "paste_image": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6m-7 2H6v13h12V7h-2M9 3h6v4H9z"/><path d="m8 17 3-3 2 2 2-2 2 3M10 11h.01"/></svg>',
    "delete": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>',
    "export_region": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" stroke-dasharray="2 1"/><path d="M12 7v9M9 13l3 3 3-3"/></svg>',
}


def ui_mark(name: str) -> str:
    return UI_MARKS.get(name, "•")


def ui_control(mark: str, label: str, *, wide: bool = False) -> str:
    return f'<span class="guide-live-control{" guide-live-control-wide" if wide else ""}"><span class="guide-live-mark">{ui_mark(mark)}</span><span>{escape(label)}</span></span>'


def flow_for(topic_id: str, language: str) -> str:
    flows = {
        "testo": [("plain", bi("Testo", "Text")), ("plain", bi("Scrivi la frase", "Type the phrase")), ("plain", bi("Aggiungi testo", "Add text")), ("fit", bi("Adatta pagina", "Fit page"))],
        "emoji-clipart": [("plain", bi("Emoji / Clipart", "Emoji / Clipart")), ("plain", bi("Cerca", "Search")), ("plain", bi("Anteprima", "Preview")), ("plain", bi("Inserisci", "Insert"))],
        "forme": [("plain", bi("Forme", "Shapes")), ("rect", bi("Scegli forma", "Choose shape")), ("plain", bi("Trascina sul foglio", "Drag on page")), ("select", bi("Seleziona", "Select"))],
        "immagini": [("plain", bi("Immagini", "Images")), ("plain", bi("Carica immagine", "Upload image")), ("select", bi("Seleziona", "Select")), ("crop", bi("Crop", "Crop"))],
        "crop-qualita": [("select", bi("Seleziona immagine", "Select image")), ("plain", bi("Cambia qualità", "Change quality")), ("plain", bi("Risoluzione", "Resolution")), ("plain", bi("Sostituisci immagine", "Replace image"))],
        "rimozione-sfondo": [("select", bi("Seleziona immagine", "Select image")), ("plain", bi("Rimuovi sfondo", "Remove background")), ("plain", bi("Metodo", "Method")), ("copy", bi("Duplica senza sfondo", "Duplicate without background"))],
        "ai-prompt": [("plain", bi("AI", "AI")), ("plain", bi("Scegli modello", "Choose model")), ("plain", bi("Scrivi il prompt", "Write prompt")), ("plain", bi("Genera e inserisci", "Generate and insert"))],
        "ai-annotazioni": [("plain", bi("Immagine di riferimento", "Reference image")), ("rect", bi("Annota", "Annotate")), ("plain", bi("Scrivi commento", "Write comment")), ("plain", bi("Salva annotazioni", "Save annotations"))],
        "preview": [("preview", bi("Preview", "Preview")), ("plain", bi("Controlla pagine", "Review pages")), ("plain", bi("Riordina", "Reorder")), ("plain", bi("Apri pagina", "Open page"))],
        "export": [("plain", bi("Export", "Export")), ("plain", bi("Cosa esportare", "What to export")), ("plain", bi("Formato", "Format")), ("export", bi("Esporta", "Export"))],
    }
    items = flows.get(topic_id)
    if not items:
        return ""
    rendered = []
    for mark, label in items:
        rendered.append(ui_control(mark, tr(label, language), wide=True))
    return '<div class="guide-flow" aria-label="Workflow">' + '<span class="guide-flow-arrow" aria-hidden="true">→</span>'.join(rendered) + '</div>'


def exact_ui_sample(topic_id: str, language: str) -> str:
    samples = {
        "orientarsi": [("workspace", bi("Area di lavoro di chicCanva", "chicCanva workspace"))],
        "progetti-pagine": [("page-panel", bi("Sezione Gestione pagina", "Page management section"))],
        "vista": [("toolbar", bi("Toolbar: vista, pagina e strumenti di modifica", "Toolbar: view, page, and editing controls"))],
        "selezione": [("toolbar", bi("Strumenti di selezione e modifica nella toolbar", "Selection and editing tools in the toolbar"))],
        "autosave": [("memory-dialog", bi("Finestra Memoria, salvataggio e ripristino", "Memory, save, and restore window"))],
        "recipe-poster": [("workspace", bi("Area di lavoro per comporre un cartellone", "Workspace for composing a poster"))],
        "recipe-flashcards": [("page-panel", bi("Gestione delle pagine per creare una serie di schede", "Page management for creating a set of cards"))],
        "recipe-coloring": [("image-effects-panel", bi("Strumenti immagine per preparare una pagina da colorare", "Image tools for preparing a colouring page"))],
        "recipe-bilingual": [("text-panel", bi("Pannello Testo per comporre materiali bilingui", "Text panel for composing bilingual materials"))],
        "snap": [("canvas-panel", bi("Sezione Canvas con griglia, snap, guide e proporzioni", "Canvas section with grid, snap, guides, and proportions"))],
        "preview": [("preview-panel", bi("Finestra Preview di tutte le pagine", "All-pages Preview window"))],
        "export": [("export-panel", bi("Centro Esporta nella webapp", "Export center in the web app"))],
        "mobile": [("mobile-workspace", bi("Area di lavoro nella disposizione mobile", "Workspace in the mobile layout"))],
        "puter": [("ai-panel", bi("Sezione AI collegata all’account Puter", "AI section connected to the Puter account"))],
        "ai-prompt": [("ai-panel", bi("Prompt e parametri della generazione immagini AI", "Prompt and settings for AI image generation"))],
        "ai-models": [("ai-panel", bi("Scelta del provider e del modello AI", "AI provider and model selection"))],
        "ai-costi": [("ai-panel", bi("Stima del consumo e riepilogo Puter", "Usage estimate and Puter summary"))],
        "ai-reference": [("ai-panel", bi("Controlli per l’immagine di riferimento", "Reference-image controls"))],
        "ai-annotazioni": [("annotations", bi("Finestra per annotare l’immagine di riferimento", "Reference-image annotation window"))],
        "ai-generation": [("ai-panel", bi("Comandi per generare e inserire un’immagine", "Controls for generating and inserting an image"))],
        "ai-coloring": [
            ("ai-panel", bi("Impostazioni AI per creare una base illustrata", "AI settings for creating an illustrated starting point")),
            ("image-effects-panel", bi("Effetti immagine per rifinire una pagina da colorare", "Image effects for refining a colouring page")),
        ],
        "immagini": [("images-panel", bi("Sezione Immagini e Crop nella webapp", "Images and Crop section in the web app"))],
        "crop-qualita": [("images-panel", bi("Comandi Crop e Cambia qualità nel pannello Immagini", "Crop and Change quality controls in the Images panel"))],
        "immagini-effetti": [("image-effects-panel", bi("Sezione Effetti immagine", "Image effects section"))],
        "rimozione-sfondo": [("background-panel", bi("Sezione Rimuovi sfondo", "Remove background section"))],
        "colorizer": [("colorizer-panel", bi("Sezione Colorizer", "Colorizer section"))],
        "testo": [("text-panel", bi("Sezione Aggiungi testo nella webapp", "Add text section in the web app"))],
        "testo-speciale": [("special-panel", bi("Sezione Testo speciale", "Special text section"))],
        "font": [("font-panel", bi("Catalogo Font e stile", "Font and style catalogue"))],
        "outline": [("font-panel", bi("Controlli del font, del riempimento e dell’outline", "Font, fill, and outline controls"))],
        "emoji-clipart": [
            ("emoji-panel", bi("Sezione OpenMoji", "OpenMoji section")),
            ("clipart-panel", bi("Sezione Clipart", "Clipart section")),
        ],
        "forme": [("shapes-panel", bi("Sezione Forme e disegno nella webapp", "Shapes and drawing section in the web app"))],
        "gruppi-livelli": [("toolbar", bi("Comandi per gruppi, copia e livelli nella toolbar", "Group, copy, and layer controls in the toolbar"))],
    }
    topic_samples = samples.get(topic_id, [])
    return "".join(screenshot_visual(name, language, caption) for name, caption in topic_samples)

def svg_data(svg: str) -> str:
    encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return "data:image/svg+xml;base64," + encoded


GUIDE_ASSETS = Path(__file__).with_name("guide-assets")


def screenshot_data(name: str, language: str) -> str:
    path = GUIDE_ASSETS / f"{language}-{name}.png"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return "data:image/png;base64," + encoded


def screenshot_visual(name: str, language: str, caption) -> str:
    localized = tr(caption, language)
    return f'<figure class="guide-visual guide-real-ui"><img src="{screenshot_data(name, language)}" alt="{escape(localized)}" loading="lazy"><figcaption>{escape(localized)}</figcaption></figure>'


def visual_svg(kind: str, language: str) -> tuple[str, str]:
    labels = {
        "workspace": bi(
            ("Progetti", "Barra strumenti", "Foglio", "Pannello funzioni", "Qui crei", "Qui scegli e regoli"),
            ("Projects", "Toolbar", "Page", "Feature panel", "Create here", "Choose and adjust here"),
        ),
        "text": bi(
            ("Aggiungi testo", "Scrivi qui la frase", "Tutto MAIUSCOLO", "Aggiungi testo", "Contieni nel foglio", "Font e stile si regolano sotto"),
            ("Add text", "Type the phrase here", "ALL UPPERCASE", "Add text", "Contain in page", "Font and style are adjusted below"),
        ),
        "images": bi(
            ("Immagini e Crop", "Da URL", "Carica immagine", "Incolla dagli appunti", "Crop", "Cambia qualità", "Informazioni immagine"),
            ("Images & Crop", "From URL", "Upload image", "Paste from clipboard", "Crop", "Change quality", "Image information"),
        ),
        "ai": bi(
            ("Generazione immagini AI", "Famiglia / provider", "Modello", "Qualità", "Proporzioni", "Descrivi l’immagine", "Stima consumo", "Genera e inserisci"),
            ("AI image generation", "Family / provider", "Model", "Quality", "Aspect ratio", "Describe the image", "Estimated usage", "Generate and insert"),
        ),
        "annotations": bi(
            ("Annota immagine di riferimento", "Seleziona", "Rettangolo", "Ovale", "Spot", "Commento del marker", "Salva annotazioni"),
            ("Annotate reference image", "Select", "Rectangle", "Oval", "Spot", "Marker comment", "Save annotations"),
        ),
        "export": bi(
            ("Centro Esporta", "Cosa esportare", "Formato", "Risoluzione", "Sfondo", "Esporta", "PDF per stampare · PNG per grafica · JPG per fotografie"),
            ("Export center", "What to export", "Format", "Resolution", "Background", "Export", "PDF for print · PNG for graphics · JPG for photos"),
        ),
        "mobile": bi(
            ("Apri pannello", "Canvas", "Scorri le barre", "Usa due dita per zoom e spostamento", "Tieni premuto per i menu"),
            ("Open panel", "Canvas", "Scroll the bars", "Use two fingers to zoom and pan", "Long press for menus"),
        ),
        "colorizer": bi(
            ("Colorizer", "Riempimento", "Pennello intelligente", "Non oltrepassare i bordi", "Colore", "Termina modalità"),
            ("Colorizer", "Fill", "Smart brush", "Do not cross edges", "Color", "Finish mode"),
        ),
    }
    values = tr(labels.get(kind, labels["workspace"]), language)
    ink, accent, pale, line = "#173b34", "#278673", "#e9f4ef", "#cbdad4"
    if kind == "workspace":
        p, tools, page, panel, create, choose = map(escape, values)
        body = f'''
<rect x="8" y="8" width="784" height="434" rx="24" fill="#f3f6f3" stroke="{line}"/>
<rect x="22" y="22" width="756" height="48" rx="14" fill="#fff" stroke="{line}"/><text x="44" y="52" class="h">{p}</text>
<rect x="22" y="82" width="520" height="52" rx="14" fill="#fff" stroke="{line}"/><text x="44" y="114" class="h">{tools}</text>
<g fill="{pale}" stroke="{accent}"><rect x="335" y="94" width="32" height="28" rx="7"/><rect x="375" y="94" width="32" height="28" rx="7"/><rect x="415" y="94" width="32" height="28" rx="7"/><rect x="455" y="94" width="32" height="28" rx="7"/></g>
<rect x="22" y="146" width="520" height="278" rx="18" fill="#ccd3d0"/><rect x="112" y="166" width="340" height="238" rx="5" fill="#fff" stroke="#aab8b2"/><text x="282" y="278" text-anchor="middle" class="title">{page}</text><text x="282" y="308" text-anchor="middle" class="muted">{create}</text>
<rect x="554" y="82" width="224" height="342" rx="18" fill="#fff" stroke="{line}"/><text x="576" y="116" class="title">{panel}</text><text x="576" y="142" class="muted">{choose}</text>
<rect x="576" y="164" width="180" height="46" rx="12" fill="{pale}"/><rect x="576" y="222" width="180" height="78" rx="12" fill="#fafbf9" stroke="{line}"/><rect x="576" y="312" width="180" height="86" rx="12" fill="#fafbf9" stroke="{line}"/>'''
    elif kind in {"text", "images", "ai", "colorizer"}:
        title, *items = map(escape, values)
        y = 104
        blocks = []
        for index, item in enumerate(items):
            height = 46 if index != len(items) - 1 else 54
            fill = accent if (kind == "ai" and index == len(items)-1) or (kind == "text" and index == 2) else "#fff"
            color = "#fff" if fill == accent else ink
            blocks.append(f'<rect x="242" y="{y}" width="440" height="{height}" rx="13" fill="{fill}" stroke="{line}"/><text x="264" y="{y+29}" fill="{color}" class="label">{item}</text>')
            y += height + 11
        body = f'<rect x="105" y="24" width="590" height="398" rx="24" fill="#f7faf7" stroke="{line}"/><rect x="125" y="44" width="550" height="46" rx="13" fill="{pale}"/><text x="150" y="75" class="title">{title}</text>{"".join(blocks)}'
    elif kind == "annotations":
        title, select, rect, oval, spot, comment, save = map(escape, values)
        body = f'''
<rect x="18" y="18" width="764" height="410" rx="24" fill="#77817e"/><rect x="42" y="38" width="716" height="54" rx="14" fill="#fff"/>
<text x="62" y="70" class="title">{title}</text><g fill="{pale}" stroke="{accent}"><rect x="396" y="50" width="76" height="30" rx="8"/><rect x="478" y="50" width="76" height="30" rx="8"/><rect x="560" y="50" width="76" height="30" rx="8"/><rect x="642" y="50" width="76" height="30" rx="8"/></g>
<text x="434" y="70" text-anchor="middle" class="tiny">{select}</text><text x="516" y="70" text-anchor="middle" class="tiny">{rect}</text><text x="598" y="70" text-anchor="middle" class="tiny">{oval}</text><text x="680" y="70" text-anchor="middle" class="tiny">{spot}</text>
<rect x="126" y="110" width="548" height="252" fill="#fff"/><rect x="260" y="164" width="182" height="104" rx="8" fill="#fff4bb" stroke="#d64b4b" stroke-width="4"/><circle cx="278" cy="182" r="16" fill="#d64b4b"/><text x="278" y="188" text-anchor="middle" fill="#fff" class="label">1</text>
<path d="M350 268v24" stroke="#d64b4b" stroke-width="3"/><rect x="208" y="292" width="376" height="96" rx="16" fill="#fff"/><text x="230" y="326" class="label">{comment}</text><rect x="230" y="340" width="210" height="30" rx="8" fill="#f5f7f5" stroke="{line}"/><rect x="454" y="340" width="108" height="30" rx="8" fill="{accent}"/><text x="508" y="361" text-anchor="middle" fill="#fff" class="tiny">{save}</text>'''
    elif kind == "export":
        title, scope, fmt, res, bg, action, hint = map(escape, values)
        body = f'''
<rect x="104" y="24" width="592" height="396" rx="24" fill="#f7faf7" stroke="{line}"/><text x="132" y="64" class="title">{title}</text>
<text x="132" y="106" class="small">{scope}</text><rect x="132" y="118" width="536" height="42" rx="11" fill="#fff" stroke="{line}"/>
<text x="132" y="195" class="small">{fmt}</text><g><rect x="132" y="207" width="164" height="42" rx="11" fill="{accent}"/><rect x="310" y="207" width="164" height="42" rx="11" fill="#fff" stroke="{line}"/><rect x="488" y="207" width="180" height="42" rx="11" fill="#fff" stroke="{line}"/></g><text x="214" y="234" text-anchor="middle" fill="#fff" class="label">PDF</text><text x="392" y="234" text-anchor="middle" class="label">PNG</text><text x="578" y="234" text-anchor="middle" class="label">JPG</text>
<text x="132" y="282" class="small">{res}</text><rect x="132" y="294" width="250" height="42" rx="11" fill="#fff" stroke="{line}"/><text x="416" y="282" class="small">{bg}</text><rect x="416" y="294" width="252" height="42" rx="11" fill="#fff" stroke="{line}"/>
<rect x="132" y="350" width="536" height="48" rx="12" fill="{accent}"/><text x="400" y="381" text-anchor="middle" fill="#fff" class="label">{action}</text><text x="400" y="414" text-anchor="middle" class="muted">{hint}</text>'''
    else:
        title, *items = map(escape, values)
        body = f'<rect x="185" y="18" width="430" height="414" rx="34" fill="#edf1ef" stroke="{line}"/><rect x="205" y="42" width="390" height="52" rx="15" fill="#fff"/><text x="230" y="74" class="title">{title}</text>'
        y = 120
        for item in items:
            body += f'<rect x="220" y="{y}" width="360" height="52" rx="14" fill="#fff" stroke="{line}"/><text x="242" y="{y+32}" class="label">{item}</text>'
            y += 66
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<style>.h{{font:700 16px system-ui;fill:{ink}}}.title{{font:800 20px system-ui;fill:{ink}}}.label{{font:700 14px system-ui;fill:{ink}}}.small{{font:700 12px system-ui;fill:#60746d;text-transform:uppercase}}.tiny{{font:700 10px system-ui;fill:{ink}}}.muted{{font:14px system-ui;fill:#60746d}}</style>{body}</svg>'''
    captions = {
        "workspace": bi("Le quattro zone principali di chicCanva", "The four main areas of chicCanva"),
        "text": bi("Estratto del pannello Testo", "Excerpt from the Text panel"),
        "images": bi("Le azioni principali del pannello Immagini", "Main actions in the Images panel"),
        "ai": bi("L’ordine consigliato per preparare una generazione AI", "Recommended order for preparing an AI generation"),
        "annotations": bi("Marker numerato e commento nel pannello delle annotazioni", "Numbered marker and comment in the annotation panel"),
        "export": bi("Il Centro Esporta mostra solo le opzioni utili alla scelta corrente", "The Export center shows only the options relevant to the current choice"),
        "mobile": bi("Comandi essenziali nella disposizione mobile", "Essential controls in the mobile layout"),
        "colorizer": bi("Controlli essenziali di Colorizer", "Essential Colorizer controls"),
    }
    return svg_data(svg), tr(captions.get(kind, captions["workspace"]), language)


def visual(kind: str, language: str) -> str:
    source, caption = visual_svg(kind, language)
    return f'<figure class="guide-visual"><img src="{source}" alt="{escape(caption)}" loading="lazy"><figcaption>{escape(caption)}</figcaption></figure>'


def option_table(rows, language: str) -> str:
    headers = tr(bi(("Opzione", "A cosa serve", "Quando sceglierla"), ("Option", "What it does", "When to choose it")), language)
    body = "".join(
        "<tr>" + "".join(f"<td>{tr(cell, language)}</td>" for cell in row) + "</tr>"
        for row in rows
    )
    return f'<div class="guide-table-wrap"><table class="guide-options"><thead><tr>{"".join(f"<th>{escape(h)}</th>" for h in headers)}</tr></thead><tbody>{body}</tbody></table></div>'


def numbered_steps(steps, language: str) -> str:
    return '<ol class="guide-steps">' + "".join(f'<li>{tr(step, language)}</li>' for step in steps) + '</ol>'


def icon_reference(language: str) -> str:
    title = tr(bi("🧭 Atlante dei pulsanti e delle icone", "🧭 Button and icon atlas"), language)
    intro = tr(bi("Questa è la toolbar di chicCanva. Passa il puntatore su un pulsante per leggerne il nome. Quando è indicato, usa il clic destro oppure una pressione prolungata per aprire altre azioni.", "This is the chicCanva toolbar. Hover over a button to read its name. Where indicated, right-click or press and hold to open more actions."), language)
    groups = [
        (bi("👁️ Vista e navigazione", "👁️ View and navigation"), [
            ("hand",bi("Manina: sposta la vista","Hand: pan the view")),("zoom_out",bi("Riduci zoom","Zoom out")),("zoom_in",bi("Aumenta zoom","Zoom in")),("fit",bi("Fit pagina / Adatta","Fit page")),("preview",bi("Preview delle pagine","Page preview"))]),
        (bi("✏️ Selezione e modifica", "✏️ Selection and editing"), [
            ("select",bi("Seleziona oggetti","Select objects")),("rotate",bi("Abilita rotazione","Enable rotation")),("crop",bi("Crop non distruttivo","Non-destructive crop")),("copy",bi("Copia","Copy")),("paste",bi("Incolla","Paste")),("group",bi("Raggruppa","Group")),("ungroup",bi("Dividi gruppo","Ungroup")),("split",bi("Dividi testo","Split text")),("delete",bi("Elimina selezione","Delete selection"))]),
        (bi("📐 Composizione ed export", "📐 Layout and export"), [
            ("grid",bi("Mostra griglia","Show grid")),("snap",bi("Snap e guide","Snap and guides")),("front",bi("Sposta sopra","Move up")),("back",bi("Sposta sotto","Move down")),("export_region",bi("Disegna area PNG","Draw PNG area"))]),
        (bi("🎯 Annotazioni AI", "🎯 AI annotations"), [
            ("annotation_select",bi("Seleziona marker","Select marker")),("rect",bi("Marker rettangolare","Rectangle marker")),("oval",bi("Marker ovale","Oval marker")),("point",bi("Spot numerato","Numbered spot")),("delete",bi("Elimina marker","Delete marker")),("fit",bi("Adatta immagine","Fit image"))]),
    ]
    blocks = []
    for heading, items in groups:
        cards = ''.join(f'<div class="guide-icon-card"><span>{ui_mark(mark)}</span><strong>{escape(tr(label, language))}</strong></div>' for mark, label in items)
        blocks.append(f'<section><h3>{tr(heading, language)}</h3><div class="guide-icon-grid">{cards}</div></section>')
    shape_heading = tr(bi("🔷 Forme più usate", "🔷 Common shapes"), language)
    shape_note = tr(bi("Questi simboli corrispondono ai pulsanti della categoria Base. Dopo il trascinamento lo strumento torna automaticamente a Seleziona.", "These symbols match the buttons in the Basic category. After dragging, the tool automatically returns to Select."), language)
    shapes = [("▭",bi("Rettangolo","Rectangle")),("□",bi("Quadrato","Square")),("▢",bi("Arrotondato","Rounded")),("⬭",bi("Ovale","Oval")),("○",bi("Cerchio","Circle")),("△",bi("Triangolo","Triangle")),("◇",bi("Rombo","Diamond")),("☆",bi("Stella","Star")),("♡",bi("Cuore","Heart")),("☾",bi("Luna","Moon"))]
    shape_cards = ''.join(f'<div class="guide-icon-card"><span class="guide-shape-mark">{mark}</span><strong>{tr(label, language)}</strong></div>' for mark, label in shapes)
    blocks.append(f'<section><h3>{shape_heading}</h3><p>{shape_note}</p><div class="guide-icon-grid">{shape_cards}</div></section>')

    toolbar_rows = [
        ("hand", bi("Manina", "Hand"), bi("Trascina la vista senza spostare gli oggetti.", "Drag the view without moving objects."), bi("—", "—")),
        ("zoom_out", bi("Riduci zoom", "Zoom out"), bi("Allontana la vista.", "Zooms the view out."), bi("—", "—")),
        ("fit", bi("Fit pagina", "Fit page"), bi("Sceglie un livello di zoom oppure adatta il foglio allo spazio disponibile.", "Chooses a zoom level or fits the page in the available space."), bi("—", "—")),
        ("zoom_in", bi("Aumenta zoom", "Zoom in"), bi("Avvicina la vista.", "Zooms the view in."), bi("—", "—")),
        ("page", bi("+ Pagina", "+ Page"), bi("Aggiunge una nuova pagina al progetto.", "Adds a new page to the project."), bi("—", "—")),
        ("preview", bi("Preview", "Preview"), bi("Apre la panoramica delle pagine per controllarle e riordinarle.", "Opens the page overview for reviewing and reordering."), bi("—", "—")),
        ("select", bi("Seleziona", "Select"), bi("Seleziona, sposta e ridimensiona gli oggetti; trascina sul vuoto per una selezione rettangolare.", "Selects, moves, and resizes objects; drag on empty space for a selection box."), bi("Avvia o termina la Selezione a oggetto, utile su touch.", "Starts or stops Object selection, useful on touch.")),
        ("rotate", bi("Rotazione", "Rotation"), bi("Mostra o nasconde la maniglia di rotazione.", "Shows or hides the rotation handle."), bi("Azzera; ruota di 90° o 180°; rifletti orizzontalmente o verticalmente.", "Reset; rotate 90° or 180°; flip horizontally or vertically.")),
        ("crop", bi("Crop", "Crop"), bi("Ritaglia in modo non distruttivo l’immagine selezionata.", "Crops the selected image non-destructively."), bi("—", "—")),
        ("export_region", bi("Area PNG", "PNG area"), bi("Disegna una zona da esportare in PNG.", "Draws an area to export as PNG."), bi("—", "—")),
        ("grid", bi("Griglia", "Grid"), bi("Mostra o nasconde la griglia di lavoro.", "Shows or hides the workspace grid."), bi("—", "—")),
        ("snap", bi("Snap", "Snap"), bi("Attiva o disattiva lo snap classico.", "Turns classic snap on or off."), bi("Snap classico, linee guida, centro e bordi pagina, oggetti, equispaziatura e blocco proporzioni.", "Classic snap, guides, page centre and edges, objects, equal spacing, and aspect lock.")),
        ("copy", bi("Copia", "Copy"), bi("Copia gli oggetti selezionati.", "Copies the selected objects."), bi("Copia come immagine; per un’immagine ritagliata puoi scegliere originale o crop visibile.", "Copy as image; for a cropped image you can choose the original or visible crop.")),
        ("paste", bi("Incolla", "Paste"), bi("Incolla oggetti chicCanva oppure un’immagine dagli appunti.", "Pastes chicCanva objects or an image from the clipboard."), bi("—", "—")),
        ("group", bi("Raggruppa", "Group"), bi("Riunisce gli oggetti selezionati in un gruppo.", "Combines the selected objects into a group."), bi("—", "—")),
        ("ungroup", bi("Dividi gruppo", "Ungroup"), bi("Separa gli elementi del gruppo selezionato.", "Separates the selected group’s elements."), bi("—", "—")),
        ("split", bi("Splitta testo", "Split text"), bi("Divide un testo in lettere o gruppi modificabili.", "Splits text into editable letters or groups."), bi("—", "—")),
        ("paste_image", bi("Incolla speciale: immagine", "Paste special: image"), bi("Legge un’immagine dagli appunti e la inserisce direttamente sul foglio.", "Reads an image from the clipboard and inserts it directly on the page."), bi("—", "—")),
        ("front", bi("Sposta sopra", "Move up"), bi("Porta la selezione avanti di un livello.", "Moves the selection forward by one layer."), bi("Sposta sopra oppure direttamente in cima.", "Move up or move directly to top.")),
        ("back", bi("Sposta sotto", "Move down"), bi("Porta la selezione indietro di un livello.", "Moves the selection backward by one layer."), bi("Sposta sotto oppure direttamente in fondo.", "Move down or move directly to bottom.")),
        ("delete", bi("Elimina", "Delete"), bi("Elimina la selezione corrente.", "Deletes the current selection."), bi("—", "—")),
    ]
    headers = [bi("Icona", "Icon"), bi("Pulsante", "Button"), bi("Clic o tocco", "Click or tap"), bi("Clic destro o pressione lunga", "Right-click or press and hold")]
    table_head = ''.join(f'<th>{tr(item, language)}</th>' for item in headers)
    table_rows = ''.join(
        '<tr>'
        f'<td class="guide-tool-mark"><span>{ui_mark(mark)}</span></td>'
        f'<td><strong>{escape(tr(name, language))}</strong></td>'
        f'<td>{escape(tr(action, language))}</td>'
        f'<td>{escape(tr(menu, language))}</td>'
        '</tr>'
        for mark, name, action, menu in toolbar_rows
    )
    toolbar_title = tr(bi("Tutti i pulsanti della toolbar", "Every toolbar button"), language)
    toolbar_table = f'<section><h3>{toolbar_title}</h3><div class="guide-table-wrap"><table class="guide-options guide-toolbar-table"><thead><tr>{table_head}</tr></thead><tbody>{table_rows}</tbody></table></div></section>'

    return f'<section class="guide-reference guide-icon-reference" id="icons"><h2>{title}</h2><p>{intro}</p>{screenshot_visual("toolbar", language, bi("Toolbar di chicCanva", "chicCanva toolbar"))}{toolbar_table}{"".join(blocks)}</section>'


def context_reference(language: str) -> str:
    context_title = tr(bi("🖱️ Menu contestuali", "🖱️ Context menus"), language)
    context_intro = tr(bi("Il clic destro, oppure una pressione prolungata su touch, apre azioni legate all’elemento indicato. Le voci cambiano in base a ciò che hai selezionato; quelle non disponibili restano disattivate o non vengono mostrate.", "Right-clicking, or pressing and holding on touch, opens actions related to the item you indicated. Items change according to what is selected; unavailable actions remain disabled or are not shown."), language)
    contexts = [
        (bi("Oggetto sul foglio", "Object on the page"), bi("Copia, incolla, raggruppa o dividi, splitta testo, fissa posizione, duplica, adatta la selezione, porta in cima o in fondo, crop, rimuovi sfondo, usa come riferimento AI, duplica come immagine, ruota e rifletti, elimina.", "Copy, paste, group or ungroup, split text, lock position, duplicate, fit selection, move to top or bottom, crop, remove background, use as AI reference, duplicate as image, rotate and flip, delete.")),
        (bi("Scheda progetto", "Project tab"), bi("Rinomina, esporta JSON, chiudi progetto.", "Rename, export JSON, close project.")),
        (bi("Pagina", "Page"), bi("Rinomina, apri pagina, duplica pagina. In Preview trovi anche i comandi per riordinare.", "Rename, open page, duplicate page. Preview also includes reordering controls.")),
        (bi("Copia di un’immagine", "Copying an image"), bi("Copia l’immagine originale oppure soltanto il crop visibile.", "Copy the original image or only the visible crop.")),
        (bi("Elimina annotazione", "Delete annotation"), bi("Nel pannello Annotazioni, clic destro o pressione lunga sul comando Elimina offre anche Elimina tutte le annotazioni.", "In the Annotations panel, right-clicking or pressing and holding Delete also offers Delete all annotations.")),
    ]
    context_rows = ''.join(f'<tr><td><strong>{tr(place, language)}</strong></td><td>{tr(items, language)}</td></tr>' for place, items in contexts)
    context_table = f'<div class="guide-table-wrap"><table class="guide-options guide-context-table"><thead><tr><th>{tr(bi("Dove", "Where"), language)}</th><th>{tr(bi("Azioni", "Actions"), language)}</th></tr></thead><tbody>{context_rows}</tbody></table></div>'
    return f'<section class="guide-reference guide-context-reference" id="context-menus-guide"><h2>{context_title}</h2><p>{context_intro}</p>{screenshot_visual("context-menus", language, bi("Menu contestuali di chicCanva", "chicCanva context menus"))}{context_table}</section>'


def case_study(case, language: str) -> str:
    labels = {
        "title": bi("Esempio guidato", "Guided example"),
        "goal": bi("Obiettivo", "Goal"),
        "steps": bi("Passaggi", "Steps"),
        "result": bi("Risultato atteso", "Expected result"),
        "follow": bi("Per continuare", "Try next"),
    }
    return f'''<article class="guide-case"><div class="guide-case-kicker">{tr(labels['title'], language)}</div><h5>{tr(case['title'], language)}</h5>
<dl><div><dt>{tr(labels['goal'], language)}</dt><dd>{tr(case['goal'], language)}</dd></div><div><dt>{tr(labels['steps'], language)}</dt><dd>{numbered_steps(case['steps'], language)}</dd></div><div><dt>{tr(labels['result'], language)}</dt><dd>{tr(case['result'], language)}</dd></div><div><dt>{tr(labels['follow'], language)}</dt><dd>{tr(case['follow'], language)}</dd></div></dl></article>'''


def render_topic(topic, language: str) -> str:
    labels = {
        "where": bi("Dove si trova", "Where to find it"),
        "offers": bi("Di cosa disponi", "What is available"),
        "steps": bi("Come si usa", "How to use it"),
        "tips": bi("Scelte consigliate", "Recommended choices"),
        "related": bi("Continua con", "Continue with"),
    }
    visual_html = ""
    exact_sample = exact_ui_sample(topic["id"], language)
    flow = flow_for(topic["id"], language)
    options = option_table(topic.get("options", []), language) if topic.get("options") else ""
    related = "".join(f'<a href="#{target}">{tr(label, language)}</a>' for target, label in topic.get("related", []))
    return f'''<section class="guide-topic" id="{topic['id']}"><header class="guide-topic-head"><span class="guide-topic-icon">{icon(topic.get('icon', 'spark'))}</span><div><h3>{tr(topic['title'], language)}</h3><p class="guide-lead">{tr(topic['lead'], language)}</p></div></header>
{visual_html}{exact_sample}<div class="guide-where"><strong>{tr(labels['where'], language)}:</strong> {tr(topic['where'], language)}</div>
<h4>{tr(labels['offers'], language)}</h4>{options}
<h4>{tr(labels['steps'], language)}</h4>{flow}{numbered_steps(topic['steps'], language)}
<aside class="guide-choice"><strong>{tr(labels['tips'], language)}</strong><p>{tr(topic['tips'], language)}</p></aside>
{case_study(topic['case'], language)}
{f'<nav class="guide-related"><strong>{tr(labels["related"], language)}:</strong>{related}</nav>' if related else ''}</section>'''


def render_manual(chapters, routes, glossary, faq, language: str) -> str:
    title = tr(bi("Manuale illustrato di chicCanva", "Illustrated chicCanva handbook"), language)
    subtitle = tr(bi(
        "Impara facendo: scopri gli strumenti, scegli le impostazioni con sicurezza e trasforma un’idea didattica in un materiale pronto da usare.",
        "Learn by doing: discover the tools, choose settings with confidence, and turn a teaching idea into a ready-to-use resource.",
    ), language)
    start = tr(bi("Da dove vuoi cominciare?", "Where would you like to start?"), language)
    contents = tr(bi("Indice della guida", "Guide contents"), language)
    glossary_title = tr(bi("Parole utili, spiegate in modo semplice", "Useful words in plain language"), language)
    faq_title = tr(bi("Domande frequenti", "Frequently asked questions"), language)
    chapter_emoji = {"chapter-start":"🧭","chapter-create":"✏️","chapter-images":"🖼️","chapter-ai":"✨","chapter-finish":"📐","chapter-lab":"🎨"}
    route_html = "".join(f'<a class="guide-route" href="#{target}"><span>{icon(icon_name)}</span><strong>{tr(label, language)}</strong><small>{tr(description, language)}</small></a>' for target, icon_name, label, description in routes)
    toc = []
    body = []
    for chapter in sorted(chapters, key=lambda item: int(item["number"]["it"])):
        emoji = chapter_emoji.get(chapter["id"], "📘")
        toc.append(f'<div class="guide-toc-group"><strong>{emoji} {tr(chapter["title"], language)}</strong>')
        chapter_topics = []
        for topic in chapter["topics"]:
            toc.append(f'<a href="#{topic["id"]}">{tr(topic["title"], language)}</a>')
            chapter_topics.append(render_topic(topic, language))
        toc.append('</div>')
        body.append(f'<div class="guide-chapter" id="{chapter["id"]}"><header><span>{emoji}</span><div><h2>{tr(chapter["number"], language)}. {tr(chapter["title"], language)}</h2><p>{tr(chapter["intro"], language)}</p></div></header>{"".join(chapter_topics)}</div>')
    glossary_html = "".join(f'<div><dt>{tr(term, language)}</dt><dd>{tr(definition, language)}</dd></div>' for term, definition in glossary)
    faq_html = "".join(f'<details><summary>{tr(question, language)}</summary><p>{tr(answer, language)}</p></details>' for question, answer in faq)
    atlas_title = tr(bi("Atlante di pulsanti e icone", "Button and icon atlas"), language)
    context_title = tr(bi("Menu contestuali", "Context menus"), language)
    toc.extend([f'<a href="#icons">🧭 {atlas_title}</a>', f'<a href="#context-menus-guide">🖱️ {context_title}</a>', f'<a href="#glossary">📖 {glossary_title}</a>', f'<a href="#faq">❓ {faq_title}</a>'])
    return f'''<div class="guide-hero"><div><span class="guide-eyebrow">chicCanva</span><h2>{title}</h2><p>{subtitle}</p></div>{icon('spark')}</div>
<section class="guide-start"><h3>{start}</h3><div class="guide-route-grid">{route_html}</div></section>
<div class="guide-shell"><details class="guide-toc" open><summary>{contents}</summary><nav>{''.join(toc)}</nav></details><main class="guide-body">{''.join(body)}
{icon_reference(language)}
{context_reference(language)}
<section class="guide-reference" id="glossary"><h2>{glossary_title}</h2><dl class="guide-glossary">{glossary_html}</dl></section>
<section class="guide-reference" id="faq"><h2>{faq_title}</h2><div class="guide-faq">{faq_html}</div></section></main></div>'''
