# Agent development guidelines

This file is the operational contract for coding agents working in this repository. It complements the maintained architecture documents; it does not replace them. Read the documents relevant to the requested change before editing code.

## 1. Required reading and sources of truth

Read in this order:

1. `AGENTS.md` — implementation and approval rules.
2. `CONTEXT.md` — condensed current state and non-negotiable behavior.
3. `docs/TECHNICAL_ARCHITECTURE.md` — build, runtime, state, canvas, persistence, memory, network, and PWA boundaries.
4. `docs/UI_UX_ARCHITECTURE.md` — interaction, responsive layout, sidebar, dialogs, and accessibility rules.
5. `docs/LOCALIZATION.md` — Italian/English runtime architecture.
6. `docs/FEATURES_AND_PROCESSES.md` — feature-specific data and control flows.
7. `docs/DEVELOPMENT_WORKFLOW.md` — build and validation commands.
8. `docs/SECURITY_PRIVACY_LICENSING.md`, `docs/PUTER_BILLING_AND_PRICING.md`, or `docs/DEPLOYMENT.md` when the change touches those areas.

The editable sources live under `development/`. The following files are generated artifacts and must not be edited as the primary implementation:

- `chicCanva.html`;
- `build/chicCanva/chicCanva.html`;
- files under `build/chicCanva-pwa/`;
- `tests/v7-test.html`;
- `development/help-v7.html` and `development/help-v7-en.html`;
- `docs/user-guide.html` and `docs/user-guide-en.html`.

Regenerate them with the documented build pipeline.

## 2. Before changing code

Inspect the current implementation with repository search. Do not infer behavior from a screenshot or from an older generated build alone. Locate:

- the editable HTML/CSS/JavaScript source;
- wrappers or later overrides of the same global function;
- serialization and restore paths for affected state;
- existing localization entries and dynamic renderers;
- relevant browser tests and documentation;
- build insertion order in `development/build-workspace.py`.

Before implementation, report:

- the observed problem or missing behavior;
- the proposed user-visible result;
- the source files expected to change;
- compatibility, data, cost, privacy, license, and migration implications;
- the validation that will prove the change.

If the user has already explicitly authorized that exact scope, proceed after the report. Critical or breaking changes use the approval gates in section 4.

Do not silently broaden the product requirement. When an adjacent defect is discovered, report it as a separate finding and identify whether it is required for the requested behavior.

## 3. Architectural invariants

Every change must preserve these properties unless the user explicitly approves a breaking redesign:

1. The local application remains one self-contained HTML file. The PWA is derived from the same generated application.
2. Modular files in `development/` are the editing layer; `development/build-workspace.py` is the authoritative composer.
3. Module injection order is significant. A wrapper saves the current function reference and calls its predecessor exactly once.
4. Stable DOM IDs, option values, object types, serialized keys, provider/model IDs, and `data-*` identifiers are behavior contracts.
5. Italian and English are equally supported UI languages. User content and stable internal values are never translated.
6. One shared Fabric canvas represents only the active page. Switching pages or projects saves the active page before loading another.
7. Document coordinates, viewport coordinates, and raster backing-store coordinates are separate systems.
8. View state such as zoom, pan, grids, guides, helpers, and selection controls must not alter print geometry or output.
9. Printable mutations participate in history and autosave. Drafts and tool preferences do not create undo steps.
10. Image edits are non-destructive unless the action explicitly says it replaces the selected image; original assets and recovery metadata remain reachable.
11. Temporary Fabric objects are excluded from project serialization and export and are removed on commit, cancel, page switch, and error.
12. Mobile uses the same document format while applying larger touch targets, responsive layouts, and stricter memory limits.
13. Puter and other user-paid or privacy-relevant network paths require an explicit user action and clear UI state.
14. Generated builds, guides, PWA assets, documentation, version metadata, and tests remain synchronized.

## 4. Risk classification and human approval

Every implementation report must include a line named **Breaking changes**. Write `None` when there are none; otherwise list each change, affected saved data or workflow, and the migration or fallback.

### Routine changes

Examples: a localized label, a reversible layout correction, an existing-style tooltip, or a narrowly scoped regression fix with unchanged data contracts.

Proceed when the requested scope is already authorized. Report the final files and validation.

### Critical changes

Report a concrete design and request human approval before implementation when a change affects any of the following and the user has not already approved that exact design:

- project JSON, IndexedDB, localStorage, autosave generations, history, or recovery compatibility;
- object serialization, asset reachability, Colorizer dependency roots, or destructive asset cleanup;
- Fabric transform semantics, crop geometry, snap/guide behavior, pointer coordinates, or export dimensions;
- authentication, user-paid calls, pricing, usage accounting, private data, network fallbacks, proxy rules, or external side effects;
- third-party licensing, attribution, redistribution, or a new runtime dependency;
- PWA service-worker strategy, cache invalidation, install/update behavior, or deployment headers;
- removal or renaming of a public control, stable ID, option value, serialized key, model ID, or documented workflow;
- irreversible deletion, publication, deployment, or replacement of user data.

The approval request must state the trigger, before/after behavior, affected files/data, rollback or migration, and planned tests. Approval of one design does not authorize a materially different design.

### Breaking changes

A breaking change includes any saved project that no longer opens correctly, any control or internal value consumed elsewhere that changes meaning, changed print/output geometry, removed offline capability, newly automatic paid/network activity, or a deployment requirement that invalidates an existing installation.

Prefer backward-compatible readers and forward-written formats. If compatibility is impossible, propose a version bump and migration path before editing.

## 5. Choosing the implementation location

Extend an existing coherent module before adding a new module. Use the source map in `docs/DEVELOPMENT_WORKFLOW.md`.

If a new module is justified:

1. create focused `.js`, `.css`, and optional `.html` fragments under `development/`;
2. insert them at the correct dependency point in `development/build-workspace.py`;
3. use a feature-specific prefix for new globals;
4. preserve predecessor calls when wrapping global functions;
5. add source and generated-build tests;
6. document the module and its lifecycle.

```js
const previousBindWorkspace = bindWorkspace;
bindWorkspace = function () {
  previousBindWorkspace();
  bindFeatureControls();
};
```

Never call the saved predecessor twice or omit it. Check for later wrappers before deciding that the first declaration is the active runtime implementation.

## 6. UI feature playbooks

### Adding or changing a sidebar section

- Use the existing direct-child `.card` and `.card-h` structure so `setupCollapsible()` can discover it.
- Give the card and its important controls stable IDs.
- Keep the header keyboard-operable and compatible with `aria-expanded`.
- Add the quick-jump entry through a stable source label or target ID. Never route by translated visible text.
- Respect single-section mode, Collapse all, Expand all, remembered collapsed state, and scroll/flash behavior.
- Put labels above their controls and follow the spacing and field widths of neighboring settings.
- Test narrow widths, coarse pointers, zoomed text, and long English/Italian strings.
- Update `docs/UI_UX_ARCHITECTURE.md` when the information architecture changes.

### Adding a toolbar or contextual action

- Reuse the existing button, icon, focus, active, disabled, and tooltip patterns.
- Provide localized `aria-label`, `title`, and `data-tip` content where used.
- Keep keyboard, toolbar, and context-menu entry points on the same underlying operation.
- Preserve menu hover/focus transfer: a submenu must remain open while the pointer moves from its trigger into the menu.
- Do not make tooltip text an internal command identifier.
- Verify disabled/empty-selection states and touch long press where the action is also contextual.

### Adding a dialog or popover

- Reuse the application `<dialog>` styling and lifecycle.
- Focus the primary field/action when appropriate and restore focus to the opener on close.
- Handle Escape, explicit cancel, backdrop behavior, and repeated opening.
- Keep destructive actions visually distinct and explain data loss before the action.
- Prevent duplicate submit handlers and overlapping asynchronous submissions.
- On mobile, ensure content scrolls inside the viewport and footer actions remain reachable.
- Localize titles, labels, option text, validation, progress, empty states, errors, and dynamically inserted results.

### Responsive layout changes

- Treat 720 px and coarse-pointer behavior as functional states, not only visual restyling.
- Let long values wrap without narrowing labels unpredictably.
- Prefer grid or flex flow over absolute positioning for dynamic text.
- For paired label/value summaries, align their first lines and let secondary values occupy their own block.
- Measure that the following content begins below the tallest preceding row; screenshots alone can miss overlap at other font metrics.
- Preserve minimum touch target and Fabric control hit-area rules documented in `UI_UX_ARCHITECTURE.md`.

## 7. Localization requirements

Italian is the canonical editorial source and English is an equal runtime language. Every new visible string must have both forms in the same change.

Use the central helpers from `development/i18n.js`:

```js
setLocalizedText(status, 'Operazione completata');
setLocalizedTextParts(counter, 'Pagina', ' ', pageNumber);
setLocalizedAttribute(button, 'aria-label', 'Apri immagini');
setLocalizedAttribute(button, 'data-tip', 'Incolla oggetti · Ctrl+V');
const message = t('Seleziona un’immagine');
const locale = appLocale();
```

Rules:

- Add the canonical Italian source and English translation to the central catalog or a narrow dynamic pattern.
- Use `setLocalizedText`, `setLocalizedTextParts`, and `setLocalizedAttribute` for content that is rerendered after startup.
- Use `t()` when composing a localized value without binding it to an element.
- Format dates and numbers with `appLocale()`.
- Rerender dynamic views from `applyLanguage()` when stored DOM content cannot be translated safely in place.
- Keep user-entered names, prompts, tags, imported filenames, search results, font names, model/provider names, and project content unchanged.
- Keep internal option values and keys stable. For example, an emoji option may display `Faccine ed emozioni` or `Smileys and emotions` while retaining `value="smileys-emotion"`.
- Keep established technical terms such as PNG, SVG, PDF, DPI, RAM, CPU, WebGPU, ONNX, Colorizer, and model quality values when they are clearer or required by an API.
- Do not introduce feature-level `language === 'en' ? ... : ...` shortcuts for visible UI. AI prompt composition may intentionally select language-specific prompt material, as documented in `docs/LOCALIZATION.md`.
- Do not translate text by matching the currently displayed English value. Store or pass the canonical source.

Required localization test direction is `Italian → English → Italian`. Assert both visible labels and unchanged internal/user values.

## 8. Canvas and Fabric changes

### Coordinate choice

Choose the coordinate system explicitly:

- Fabric object placement, fitting, crop, and snap use document coordinates.
- Pointer/UI placement uses viewport coordinates.
- Pixel sampling and image processing use raster backing-store coordinates.

Use the existing `canvasRasterPoint()` mapping for eyedropper-like tools. Do not replace it with `canvas.getPointer()` when reading pixels.

### Object mutations

After changing geometry:

```js
object.set({ left, top, scaleX, scaleY });
object.setCoords();
canvas.requestRenderAll();
saveActivePage();
scheduleCommit();
scheduleAutosave();
```

Use the smallest subset required by the active lifecycle; avoid duplicate history boundaries. Apply related properties atomically so listeners do not observe an invalid intermediate pose.

### Transforms, resizing, crop, and snap

- Preserve the opposite control anchor when constraining a transform.
- Preserve the object's original `scaleX:scaleY` relationship for proportional corner resizing; do not infer a new ratio from a snapped bounding box.
- Keep classic snap and magnetic guides independent, including Shift/Alt XOR behavior.
- Test all corner directions, negative/flip scales, rotations, groups, `ActiveSelection`, crop helpers, and Escape rollback.
- A crop changes the visible source rectangle while preserving source pixels and displayed geometry.
- Call `setCoords()` before reading bounds after a transform.
- Temporary guides must be `evented:false`, `selectable:false`, `excludeProject:true`, and `excludeFromExport:true`, then removed on every exit path.

### Interaction modes

Drawing, crop, export-region, Colorizer, pan, and point-edit modes can conflict. A mode must:

1. snapshot affected selection and interaction flags;
2. disable only the interactions it owns;
3. create temporary objects that cannot serialize;
4. commit one valid result or cancel cleanly;
5. restore the exact previous flags on success, cancel, error, page/project switch, and window blur;
6. release pointer capture, animation frames, overlays, decoded rasters, and temporary buffers.

Never assume every existing object was selectable before entering the mode; position-locked objects must remain locked afterward.

### Groups and text

Changing a text child's font changes glyph metrics. Detach/rebuild persistent groups and restore their visual center instead of mutating children while retaining stale group bounds. Test text-only groups and mixed text/OpenMoji groups.

## 9. State, history, persistence, and assets

Useful runtime primitives include:

| Primitive | Purpose | Main source or active override |
|---|---|---|
| `$()` | Stable DOM lookup by ID | baseline runtime |
| `uid()`, `clamp()` | IDs and bounded values | baseline runtime |
| `selectionObjects()`, `selectedImage()` | Current Fabric selection | baseline runtime and feature wrappers |
| `serializeObject()`, `instantiateObject()` | Fabric ↔ project descriptors | baseline plus shape/group/lock/Colorizer extensions |
| `saveActivePage()` | Persist the active Fabric page into descriptors | baseline/runtime wrappers |
| `commitHistory()`, `scheduleCommit()`, `withHistory()` | Undo boundary management | `development/pending.js` and wrappers |
| `scheduleAutosave()` | Debounced workspace persistence | `development/pending.js` |
| `assetFromUrl()`, `addImageAsset()` | Register and instantiate image assets | baseline plus transport wrappers |
| `renderPageDataUrl()` | Independent page rasterization | baseline/export wrappers |
| `setLocalizedText*()`, `t()`, `appLocale()` | Runtime localization | `development/i18n.js` |

Search for the final active definition before calling or wrapping a primitive.

State rules:

- Serialize semantic descriptors, never live DOM nodes, Fabric controls, decoded `Image` objects, canvas contexts, workers, or promises.
- Add new serializable properties to both write and read paths and decide an explicit default for old projects.
- Preserve unknown compatible fields when normalizing imported projects.
- Keep history snapshots compact. Tool defaults, draft inputs, searches, filters, AI references, zoom, pan, and sidebar state do not create undo entries.
- Commit high-frequency gestures once at pointer-up, not once per move.
- Start asynchronous derivation from a stable serialized pose; mutate project state only after complete output validation.
- Asset cleanup must traverse current pages, retained history, nested groups, Colorizer `baseAssetId` and source descriptors, clipboard data, and the current AI reference.
- Release decoded/runtime memory while preserving compressed assets needed for reopen, undo, and export.

Storage changes require tests for missing pointers, interrupted writes, previous-generation recovery, legacy records, large assets, explicit close, and PWA relaunch. Treat schema changes as critical.

## 10. Images, rendering, and export

- Preserve `originalDataUrl` and record `derivedFrom`, operation/model/device, source dimensions, and license metadata when applicable.
- Keep page geometry independent from source pixel resolution. Replacing/resampling an image must preserve its physical size, position, rotation, crop, and undoability.
- Use progressive high-quality downscaling for text-heavy images; release each temporary canvas promptly.
- Apply storage/compression decisions after resizing and explain that PNG optimization changes encoded size rather than introducing JPEG-style quality loss.
- Enforce explicit pixel and memory caps before allocating large canvases.
- Render export from project descriptors at requested output dimensions. Hide helpers without mutating saved document state.
- Validate transparent and white backgrounds, crop bounds, DPI, region margins, PDF/ZIP order, and large-page failure recovery.

## 11. Async, AI, network, privacy, and licensing

- Disable only the controls involved in a running operation and restore them in `finally`.
- Show progress for model downloads, rendering, upload, and generation.
- Use bounded fetches and named abort handling. Catch expected aborts inside the feature.
- Do not discard a completed remote result because ingestion failed; preserve a retry/download/open recovery path.
- Keep direct fetch, Puter fetch, and the local BAT proxy as distinct user-visible transports.
- Never start generation, paid usage, login, download through Puter, or external publication implicitly.
- Keep provider/model IDs and technical quality values canonical even when surrounding UI is localized.
- Review `docs/SECURITY_PRIVACY_LICENSING.md` before adding code, models, fonts, media catalogs, or network services. Record license and attribution in the distribution and asset metadata.
- For pricing or usage estimates, label measured and estimated values separately, state assumptions, preserve unit conversion, and test locale formatting.

## 12. Test and verification matrix

Tests must prove behavior and regression boundaries, not only DOM existence.

### Always run after implementation

```powershell
python development/build-workspace.py
python tests/build-v7-tests.py
python tests/check-chic-build.py
git diff --check
```

Serve `tests/v7-test.html` over HTTP with a fresh query parameter and require the visible result:

```text
ALL V7 CHECKS COMPLETE
```

Run syntax checks through standard input if direct path resolution is restricted:

```powershell
Get-Content development/changed-file.js -Raw | node --check -
```

### Add targeted checks according to feature type

| Feature type | Minimum regression coverage |
|---|---|
| UI/sidebar | keyboard activation, accordion behavior, narrow layout, long IT/EN labels |
| Localization | IT→EN→IT, dynamic rerender, attributes/tooltips, stable keys, preserved user text |
| Canvas transform | every relevant handle, snap on/off, modifiers, rotation/flip, group/selection, Escape rollback |
| Interaction mode | enter, commit, cancel, error, page switch, locked-object restoration, temporary-object cleanup |
| Persistence | save/load, undo/redo, project/page switch, autosave recovery, old/default field behavior |
| Asset/image | source preservation, page geometry, crop, memory cap, reachability/GC, export |
| Mobile/touch | coarse pointer, long press, pinch, hit areas, wrapping/overlap, memory path |
| Network/AI | signed out, success, timeout, rejected promise, fallback, recovery, cost/account state |
| PWA | first install, update, offline relaunch, cache ID, generated asset order |

For layout regressions, assert geometry where possible: compare bounding rectangles, line positions, or computed styles in addition to taking screenshots.

Do not rewrite a test to accept a regression. If an intentional behavior change invalidates a test, explain the old and new contract in the change report.

## 13. Documentation and completion

A material feature is incomplete until its documentation matches the generated application.

### User-guide integration playbook

Treat the illustrated guide as part of the feature, not as a later editorial task. When a visible control, workflow, icon, glyph, menu, or option changes:

1. locate the final runtime control and its active wrapper; do not copy an obsolete generated artifact;
2. record the stable control ID, actual Italian label, English catalogue entry, `aria-label`, tooltip, displayed glyph, and SVG path where present;
3. update the matching entry in `development/guide_content.py`, the screenshot map, and the icon atlas in `development/guide_manual.py`;
4. reuse the exact mark from the source control. For SVG controls, copy the current `viewBox` and paths; for textual glyphs, copy the Unicode character; for shape buttons, use `development/shapes-ui.html` and `development/shapes.js` as sources of truth;
5. regenerate the relevant localized screenshot with `development/capture-guide-assets.js`. Store the PNG under `development/guide-assets/`; the guide embeds it as a Data URL and never depends on an external request;
6. add or revise an arrow workflow when the feature has a short sequence of meaningful choices, using the actual visible command names in each language;
7. keep chapter/category emoji editorial only. Do not use emoji as internal routing keys or replacements for accessible labels;
8. update both language forms in the same semantic entry. Stable topic IDs and internal anchors remain language-neutral;
9. never artistically rearrange, simplify, or invent a screenshot-like product panel. A diagram may explain a concept, but anything presented as UI must be a current localized screenshot or an exact DOM/CSS reproduction with the same order, labels, spacing, and icons;
10. use source glyphs and SVG paths directly in the icon atlas so each tool remains legible at small size; document normal click/tap and right-click/press-and-hold behavior separately;
11. update guide assertions so renamed controls, icon counts, screenshot coverage, links, and IT→EN→IT parity fail when stale.
12. give every functional topic at least one current localized screenshot of the relevant application section. A topic may reuse a screenshot only when that same visible section is genuinely where the feature is operated; combined topics should show each distinct panel they teach.
13. keep the contextual-menu reference as its own guide section and index destination. Feature chapters may link to it, but must not absorb the complete menu catalogue under one unrelated feature such as grouping.

Before completion, compare the rendered guide against the current application at desktop and mobile widths. Check the icon shape, order, label, enabled/disabled meaning, context-menu relationship, long translated text, horizontal overflow, and keyboard/touch description. A feature with stale guide graphics or only one updated language is incomplete.

- Update the Italian guide source in `development/build-guide.py`.
- Update the English guide source in `development/build-guide-en.py`.
- Update `docs/FEATURES_AND_PROCESSES.md` for behavior/data flow.
- Update `docs/TECHNICAL_ARCHITECTURE.md` for boundaries, modules, state, or lifecycle.
- Update `docs/UI_UX_ARCHITECTURE.md` for layout and interaction rules.
- Update `docs/LOCALIZATION.md` for language architecture.
- Update deployment, security, licensing, and billing documents when relevant.
- Update `CONTEXT.md` when a future agent needs the decision immediately.
- Bump `development/version.json` for a product release, then rebuild. Do not type the version separately into generated artifacts.

The final implementation report must state:

- what changed and why;
- user-visible behavior in Italian and English;
- state/data/network/license implications;
- **Breaking changes: None** or the approved list;
- tests and manual checks performed;
- remaining material limitations or unverified external behavior.

Do not claim completion while required build artifacts are stale or a required test is failing.
