# chicCanva documentation

This directory is the technical and operational reference for chicCanva. It is written for maintainers, reviewers, deployers, and AI agents taking over development. The Italian and English end-user guides are generated from the same two sources embedded in the application.

Coding agents and automated contributors must begin with [`AGENTS.md`](../AGENTS.md). It defines implementation invariants, human-approval gates, the bilingual UI policy, canvas and persistence safeguards, and feature-specific test expectations.

## Documentation map

| Document | Audience | Purpose |
|---|---|---|
| [../AGENTS.md](../AGENTS.md) | Coding agents and reviewers | Operational contract, approval gates, implementation playbooks, and validation matrix. |
| [user-guide.html](user-guide.html) | Teachers and end users | Standalone copy of the complete in-app guide. |
| [user-guide-en.html](user-guide-en.html) | Teachers and end users | Complete standalone English guide. |
| [LOCALIZATION.md](LOCALIZATION.md) | Developers and AI agents | Runtime language selection, prompt localization, guide parity, and maintenance rules. |
| [PROJECT.md](PROJECT.md) | Product and maintainers | Mission, constraints, use cases, decisions, and extension direction. |
| [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) | Developers and AI agents | Codebase map, runtime architecture, data model, build composition, and design decisions. |
| [FEATURES_AND_PROCESSES.md](FEATURES_AND_PROCESSES.md) | Developers and QA | Detailed behavior and internal flows for editing, fonts, emoji, images, AI, persistence, and export. |
| [UI_UX_ARCHITECTURE.md](UI_UX_ARCHITECTURE.md) | Product and frontend maintainers | Interface structure, responsive behavior, interaction rules, accessibility, and UX invariants. |
| [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) | Contributors and AI agents | Safe edit/build/test/release workflow and source-of-truth rules. |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Operators | Direct-file, PowerShell webserver, static HTTPS, and PWA deployment procedures. |
| [SECURITY_PRIVACY_LICENSING.md](SECURITY_PRIVACY_LICENSING.md) | Maintainers and deployers | Trust boundaries, browser storage, remote services, licenses, attribution, and deployment obligations. |
| [PUTER_BILLING_AND_PRICING.md](PUTER_BILLING_AND_PRICING.md) | Developers and AI agents | Puter allowance/top-up accounting, unit conversion, live price cache, estimate formulas, and regression fixtures. |
| [../CONTEXT.md](../CONTEXT.md) | AI agents | Condensed handoff for resuming work quickly. |
| [../README.md](../README.md) | Everyone | Project overview and entry point. |

## Source-of-truth rule

Do not edit generated application files as the primary change:

- `chicCanva.html`
- `build/chicCanva/chicCanva.html`
- `build/chicCanva-pwa/index.html`
- `tests/v7-test.html`
- `docs/user-guide.html`
- `docs/user-guide-en.html`

Edit the modular sources under `development/`, the guide source in `development/build-guide.py`, and the browser tests in `tests/v7-tests.js`. Then run the documented build commands. `development/build-workspace.py` regenerates the application and both distributions; `tests/build-v7-tests.py` regenerates the browser harness.

## Documentation maintenance contract

Every user-visible feature change should update all affected layers in the same change:

1. the relevant source module and UI fragment;
2. both complete guide generators and the English catalogue in `development/i18n.js`;
3. one or more technical documents in this directory;
4. `README.md` when capabilities, setup, build, deployment, or licenses change;
5. `CONTEXT.md` when architecture, workflows, key constraints, or known risks change;
6. browser/static checks where the behavior is material.

The build process regenerates the standalone guide automatically, so the copy in `docs` and the guide embedded in the HTML remain aligned.
