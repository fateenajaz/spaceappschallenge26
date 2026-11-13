# Team development contracts

| Owner | Boundary | Review contract |
| --- | --- | --- |
| Fateen | Types, app composition, build and deployment | Own integration and lockfile changes; maintain one consistent data/audio interface. |
| Abdullah | `scripts`, `src/data`, scientific explanations | Preserve source provenance; validate before changing normalized data; coordinate with audio owner. |
| Zayd | `src/audio`, playback hook | Preserve fixed mapping and single-owner scheduling; coordinate contract changes. |
| Yaser | Layout, charts, controls, styles, NASA media | Consume shared records and audio; do not duplicate dataset values or engines. |
| Rayyan | Accessibility and learning | Review keyboard, focus, semantics and explanations with frontend owner. |
| Vishal | Tests, README, source credits, demo | Keep claims tied to actual validation; record device/browser limits and deployment evidence. |

Use branches such as `feature/nasa-data`, `feature/audio-engine`, `feature/frontend`, `feature/accessibility`, `feature/testing-docs`. Avoid simultaneous edits to app composition and package manifests. Agree shared types before changing callers. Re-run the appropriate unit/component/browser checks and production build before integrating.

The initial working tree is AI-assisted and uncommitted. This directory was initially within a broader ancestor Git worktree containing unrelated user files. No ancestor Git changes were staged or committed. If the team wants an isolated repository here, create it deliberately and push only this project; do not commit the ancestor workspace.
