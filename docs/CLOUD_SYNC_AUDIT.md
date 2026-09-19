# Cloud Sync verification — 2026-09-19

The corrected chicCanva 1.14.7 synchronization flow passes **22/22 dedicated checks** in isolated Chromium contexts at both 1440×1000 and 390×844. No test reads credentials or writes to a real MEGA account.

## Reproduction and limits

Run `node tests/run-cloud-sync-audit.cjs` with Playwright available through `NODE_PATH`. The runner injects `tests/cloud-sync-audit.js` into the generated application closure, uses fresh browser storage, aborts external requests, and substitutes an in-memory MEGA node tree. It writes `tests/cloud-sync-audit-results.json` and exits with status 1 if any contract fails.

The suite verifies complete publication and recovery, manifest-last ordering, failure recovery, immutable revision folders, unchanged-payload deduplication, manual publication with quota refresh, ten-minute scheduling, polling conflicts, reload from Cloud, persistent warnings, active and expired locks, stale writers, empty storage, session discovery, and the non-dismissible conflict decision on desktop and mobile.

The simulation does not establish live MEGA network consistency, throttling, or genuinely simultaneous distributed writes. MEGA does not expose an application-level atomic compare-and-swap, so coordination remains deliberately best-effort. Safety comes from three checks: read the current manifest before claiming a lock, verify the short-lived lock after refresh, and compare the manifest again before publication.

## Runtime contract

- The first changed snapshot is queued promptly when no Cloud upload occurred in the previous ten minutes. Later changes coalesce into the latest pending snapshot.
- Identical workspace payloads do not create another Synch revision.
- Each attempt uses a unique, immutable revision directory. Project files and `workspace.json` upload before `current.json`; older revisions are deleted only after publication succeeds.
- A 90-second lease protects only the publication attempt. It is released in `finally`; an abandoned lease expires and cannot block Synch permanently.
- A remote revision newer than the locally observed revision suspends this client before it uploads. The suspension is stored independently from the user's enabled setting and remains visible until resolved.
- Reload from Cloud can read while synchronization is suspended. It adopts the remote session and revision, stores the recovery pointer locally, then reloads the application.
- Continue locally leaves the client detached and the warning visible. Opening the warning later offers Reload from Cloud again.
- After MEGA login or remembered-session restoration, chicCanva scans `.synch`. If the locally known session is absent, it discovers the newest valid session. A manual login offers the Cloud session immediately; startup restoration exposes it in the existing recovery dialog.
- Starting a deliberately new workspace detaches it to a new Synch session ID. Choosing Cloud or the parallel recovery path adopts the selected Cloud session.
- The conflict dialog ignores Escape because a stale client must explicitly reload or continue locally.

Legacy version-1 manifests remain readable. New version-2 manifests add `payloadHash`; local metadata adds `lastSyncAt`, `lastSyncHash`, and `syncSuspended`, all with safe defaults. Project JSON remains version 7 and unchanged.

**Breaking changes: None.**
