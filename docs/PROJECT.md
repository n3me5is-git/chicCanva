# Project definition and product direction

## Mission

chicCanva is a compact “mini Canva” for teachers, families, and educational activities. It helps create printable lettering, classroom posters, flashcards, worksheets, decorations, and multi-page projects without requiring a design subscription or a complex desktop application.

Chicca, a small teacher mascot, gives the product a friendly identity. The slogan is “Piccole idee, grandi progetti.”

## Product constraints

These constraints define the product and should be treated as requirements:

- The editor ships as one HTML file.
- The same HTML supports limited direct-file operation and richer HTTP(S) operation.
- The Windows launcher uses only built-in PowerShell/.NET.
- A public-domain HTTPS build can be installed as a PWA on desktop and mobile.
- Core editing, serialization, image transforms, and export are client-side.
- Optional services are visibly optional and user-initiated.
- Existing features should be extended or improved rather than silently removed.
- The interface must remain usable by nontechnical teachers.
- Project JSON must carry the editable document and assets.
- Image-derived operations preserve the original.
- Mobile resource limits are part of functional correctness.

## Main use cases

1. Produce a word or phrase in thick outlined letters to color by hand.
2. Generate one letter or meaningful group per page for banners and classroom displays.
3. Build mixed-format, multi-page educational projects.
4. Combine text, emoji, photos, clipart, and generated illustrations.
5. Create coloring material from a photo or illustration.
6. Export a print-ready PDF, individual images, a page ZIP, or a selected region.
7. Save and reopen the editable project, with optional undo history.
8. Work from a desktop browser, local Windows launcher, phone/tablet browser, or installed PWA.

## Current feature domains

- Projects and custom pages
- Canvas selection and object transformations
- Text outline/filled rendering
- Complete font catalog and style wizard
- Grapheme-aware splitting and symbol joining
- OpenMoji browser and smart emoji conversion
- Images, clipboard, URLs, crop, grayscale, and edge outline
- Local PDF-to-PNG import into A4 project pages
- Chroma-key and local AI background removal
- Puter image generation with reference images and style presets
- Openclipart search and optional keyword translation
- Undo/redo, autosave, recovery, and portable JSON
- PDF, PNG, JPG, region, and ZIP export
- Responsive UI, PWA install/update, and local PowerShell server
- Integrated end-user guide and technical documentation

## Product quality criteria

A feature is complete when:

- it works in the relevant delivery modes;
- its unavailable state is explained in direct-file mode;
- progress is visible for slow work;
- errors leave the UI usable;
- the action participates in history/autosave when it changes the project;
- it behaves on narrow/coarse-pointer screens;
- it preserves print dimensions and asset quality;
- its costs/privacy/license implications are visible when relevant;
- it is described in the guide and technical documentation;
- builds and tests are regenerated and pass.

## Deliberate decisions

### One custom page model

Earlier versions had separate whole-phrase, one-letter, and custom modes. The current product uses one custom-page document model. Special tasks are macros that create or append custom pages. This reduces duplicated state and lets every result be edited with the same tools.

### Multiple open projects

Imported JSON opens a new tab instead of replacing the active document. This supports comparison and copying between jobs. Explicit close removes a project from autosave, so close dialogs emphasize external JSON backup.

### Client-side derivation

Grayscale, Sobel outline, chroma key, crop, PDF, image export, ZIP assembly, and AI background removal run locally. Puter is used for generation and explicit assisted download, where remote service is intrinsic or intentionally selected.

### Small mobile segmentation model

Phones are more likely to freeze from ONNX model/session memory than from cached model bytes. Mobile therefore keeps the downloaded small model in browser cache but creates and terminates a worker for each removal job.

### Generated artifacts committed with source

The repository keeps ready-to-use builds because the product is intended to be copied and run without a toolchain. Generated artifacts must therefore be synchronized and reviewable, even though modular sources remain the editing layer.

## Future-extension pattern

“Funzioni e Progetti Speciali” is the expansion point for future education-specific macros. A macro should produce ordinary pages and objects instead of creating a parallel editing engine. Examples could include alphabet cards, name labels, number lines, classroom schedules, matching cards, and worksheet grids.

Potential future work should be evaluated against bundle size, offline behavior, mobile memory, licensing, user cost, and whether it can remain comprehensible in the sidebar.

## Non-goals unless requirements change

- collaborative multi-user editing;
- cloud project accounts owned by chicCanva;
- server-side document storage in the supplied BAT;
- a general-purpose backend proxy;
- professional vector path editing;
- exact desktop publishing prepress/color-management workflows;
- automatic paid-service actions without a user click.

## Documentation ownership

The technical documents and `CONTEXT.md` are part of the implementation. A change that makes them materially inaccurate is incomplete. The Italian guide is generated and embedded during every build; the standalone guide is generated from the same fragment.
