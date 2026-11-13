# ECHO EARTH — research and implementation plan

Prepared November 12, 2026 (Asia/Dubai). This document preserves the initial planning-only checkpoint. The user subsequently authorized development; see README.md, docs/verification.md and docs/ai-usage.md for the implemented state and timing.

## Build-period gate

The supplied master prompt says to stop after planning if the permitted build period has not begun. The NASA Space Apps Global Organizing Team states that development starts November 14, 2026 at 09:00 in the Local Event's timezone (or the Team Owner's area of residence for the Universal Event). For Dubai, that is November 14 at 09:00 GST / 05:00 UTC. Confirm any event-specific instructions with the Local Lead before implementation.

Primary guidance: https://github.com/nasa/spaceapps/discussions/1813 (GO Team answer, November 5, 2026). NASA's event announcement also identifies November 14–15: https://science.nasa.gov/universe/nasa-welcomes-all-ages-experience-levels-for-space-apps-challenge/.

No framework scaffolding, dependency installation, data processing script, normalized snapshot, application code, tests, or deployment was created during this planning session. This document is a proposed design and checklist, not evidence of an implemented product.

## Repository inspection

- Workspace: `/Users/fateen/Desktop/uni/uobrpl/nasa_hackathon`.
- Initially empty; no existing framework, package manifest, assets, functionality, Git metadata, or repository instructions to preserve.
- Input: the user's supplied ECHO EARTH master build prompt.

## Scientific resource research

| Resource | Verified finding | Implementation consequence |
| --- | --- | --- |
| [GISTEMP v4 downloads](https://data.giss.nasa.gov/gistemp/data_v4.html) | Global land-ocean anomalies cover 1880–present, relative to 1951–1980. Monthly, seasonal and annual columns are available. | Use the global land-ocean series; label all measurements as anomalies in °C. |
| [Official CSV](https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv) | Direct research inspection succeeded with curl. First line is `Land-Ocean: Global Means`; header includes `Year`, twelve months, `J-D`, `D-N`, and seasons. Decimal anomalies and `***` missing markers are present. | Find the actual header; select `J-D` by name, not column assumptions. Preserve decimals in Celsius; do not divide by 100 or substitute `D-N`. |
| [NASA Climate Spiral, SVS 5190](https://svs.gsfc.nasa.gov/5190/) | Monthly GISTEMP v4 anomalies, same reference period; explicitly tagged Earth Information Center. English Celsius video, frame set and stills are published. | Keep official monthly media distinct from the synchronized custom annual chart. No guessed frame-to-year assignments. |
| SVS credits | Requested item credit is NASA's Scientific Visualization Studio. Listed visualizers include Mark SubbaRao and Ed Hawkins. | Preserve asset provenance and item attribution; review linked reproduction guidelines before publishing. |
| [Challenge brief](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/) | Direct retrieval returned HTTP 502 in this session. | Treat the pasted brief as the working requirement; recheck the official challenge and Resources tab before implementation. Full official brief verification remains outstanding. |

Only the CSV structure was inspected; this is not a validation of the complete historical dataset. The exact final annual year, missing records, global domain, period means and scientific outcomes must be established by the future pipeline. In November 2026, 2025 is the latest possible complete calendar year; retain it only if the official source contains a complete valid record. Never treat 2026 as complete.

The local Python HTTPS client failed certificate verification; curl succeeded without bypassing TLS verification. The future script must use a working verified TLS configuration or accept a locally retrieved original CSV. Never disable certificate verification as a fallback.

## Architecture and dependencies

Build a client-only React + TypeScript application with Vite, Tailwind CSS, Lucide React icons, one shared dataset and one Web Audio engine, matching the requested stack. No backend, account, API key, AI service or database is required. Use semantic HTML, project-specific CSS design tokens and lightweight SVG charts; add Recharts only if it materially improves keyboard and data access. Navigation can use hash routes to keep static hosting simple and support direct links.

Runtime dependencies: React, React DOM and Lucide React. Build tooling: TypeScript, Vite, its React integration, and Tailwind CSS with its compatible Vite integration. Verification: Vitest, React Testing Library, jsdom, Playwright and an accessibility checker where supported. Use Node for offline CSV processing. Resolve compatible versions against current official documentation when the build period opens; record exact versions in the lockfile.

Proposed boundaries (create only populated modules):

| Boundary | Responsibility | Team owner |
| --- | --- | --- |
| `src/app`, shared `src/types` | Application composition, navigation, typed contracts and integration | Fateen |
| `scripts`, `src/data`, `src/lib/mathematics` | Reproducible ingestion, validation, metadata, selectors and means | Abdullah |
| `src/audio`, `src/hooks/useAudioEngine` | Mapping, scheduler, audio lifecycle and single engine adapter | Zayd |
| `src/components`, experience layouts, `src/styles` | Controls, charts, responsive presentation, NASA media | Yaser |
| `src/content`, accessibility behavior | Learning explanations, text alternatives, keyboard and focus review | Rayyan |
| `src/tests`, browser tests, `docs`, README | Acceptance coverage, credits, deployment and demo instructions | Vishal |

Shared integration files have one owner. Team members use feature branches and agree contract changes before integrating. Parallel team development starts only during the permitted period.

## Proposed shared contracts

These are design specifications, not source code:

- ClimateRecord: integer `year`, finite `anomalyC` in Celsius.
- ClimateDataset: requested `id`, `title`, `provider`, `sourceUrl`, `sourceVersion`, `referencePeriod`, `units`, `lastVerified`, and chronologically ordered `records`.
- Snapshot provenance: original file path, source URL, retrieval timestamp, raw SHA-256, processing version, latest retained year, exclusions and validation report. Label GISTEMP v4 separately from the snapshot revision; v4 does not make historical values immutable.
- MappingConfig: dataset ID/revision, global minimum and maximum anomaly, minimum frequency 220 Hz, maximum frequency 660 Hz. Freeze for the loaded snapshot and share across all experiences.
- PlaybackSnapshot: state, sequence ID, record index, fractional event position, current frequency and error. States: idle, loading, playing, paused, stopped, completed, error.
- Engine commands: play sequence, pause, resume, stop, replay, seek, set speed, set volume, mute, subscribe, dispose. Only one sequence can own playback.
- ComparisonAttempt: stable randomized A/B period assignment, chosen answer, submission state; compute means from records. Never expose years, anomalies or frequencies in the blind interface, accessible labels, tooltips or progress announcements.

## Data pipeline specification

1. Retrieve the official HTTPS CSV or accept an unchanged local original; retain original bytes and hash.
2. Locate the `Year` header and require exactly one `J-D` column and all twelve month columns. Reject unexpected structure rather than guessing.
3. Validate row lengths, integer years, duplicate years, missing tokens and finite numeric values. Malformed or duplicate records fail with row-level diagnostics.
4. Exclude current/future calendar years and incomplete annual rows explicitly. Require twelve valid months and a valid `J-D` for retained years. Report exclusions separately from invalid input.
5. Preserve source annual `J-D` values in °C. Do not replace the official annual statistic with an average of rounded monthly values.
6. Sort by year; verify 1880 start, contiguous retained coverage, nonempty data and at least two distinct anomaly values. Treat unusual magnitudes as review findings, never silently clamp them.
7. Verify both proposed comparison intervals contain exactly 30 unique years and do not overlap.
8. Emit normalized JSON, metadata, immutable raw reference and a validation report. No fabricated fallback. Keep the previous validated snapshot intact if regeneration fails.
9. Make input timestamp explicit so repeat processing of identical bytes with identical options gives identical scientific output.

## Sonification and timing specification

Use `n = (anomalyC - globalMin) / (globalMax - globalMin)` and `f = 220 × (660 / 220)^n`. Derive the domain once from the complete validated snapshot. Out-of-domain input or a zero-width domain is an explicit error; changing datasets requires a new shared domain, never per-period normalization.

Default: sine oscillator, constant gain, short attack/release, 300 ms per annual event, 9 seconds for a 30-year period. No music, reverb, volume encoding or summary tone in the initial release. Explain that pitches are artificial encodings, not sounds naturally emitted by Earth. Exponential mapping means mean pitch is not numerically equivalent to pitch at the mean anomaly; calculate the answer from anomalies.

Create/resume AudioContext only from user gestures. Schedule a short lookahead window against AudioContext.currentTime; derive the active index and fractional progress from the same clock. Drive visual updates with requestAnimationFrame, accounting for output timing where supported. Track/disconnect every node; cancel scheduling and invalidate stale callbacks on stop, seek, sequence changes and unmount.

Pause saves position before canceling queued nodes. Resume rebuilds only the remaining sequence. Speed changes rebuild future scheduling while preserving logical position. Route changes stop playback. On page hiding, pause intentionally to avoid timer throttling and an inaudible/offscreen running timeline; require user action to resume. Master gain supplies volume/mute without changing pitch. Report initialization errors visibly and accessibly.

## Product and visual direction

Reference direction: a focused museum listening station with scientific instrument readouts. Use the supplied navy background (#08111F), pale text (#F4F7FA), blue (#73B9E6) for selection and amber (#E8B978) for revealed comparisons. Verify actual contrast in implementation. Choose IBM Plex Sans for explanatory text and IBM Plex Mono with tabular numerals for measurements, using locally hosted fonts and documented licenses; system fallbacks preserve usability.

The first screen leads to listening, with the exact requested headline and copy. Main navigation connects Listening Test, Hear the Century, Sound Laboratory and Sources. Layout follows the task: focused introduction, two balanced listening panels, then the reveal; avoid unrelated statistics and decorative charts. Mobile controls wrap or stack with generous touch targets.

### Invisible Climate Test

- Randomize 1961–1990 and 1991–2020 once per attempt. Preserve assignment until an explicit new attempt.
- Equal sound duration, gain, speed and global mapping. A/B switching stops the other sequence. Progress announces note count without disclosing dates or frequencies.
- Radio choices A, B, and “I couldn't tell”; explicit submit. Allow uncertainty and avoid ability judgments.
- Reveal period labels, computed means, computed difference and outcome, plus aligned charts on identical axes and an accessible table.
- Explain anomalies, baseline, pitch encoding, variability and multidecade comparison. Provide replay, explorer navigation and a new attempt. Only show additional presets once validated.

### Hear the Century

- Shared annual SVG chart with labeled axes, zero baseline, year marker and a data table.
- Play/pause/resume/stop/restart, previous/next year, labeled scrubber, slow/normal/fast, volume and mute.
- Display year, anomaly, normalized value and frequency from the active shared record. Scrubbing updates values immediately; preview sound on an explicit user action or committed selection, not every touch movement.

### NASA visual integration

- Include the authentic Climate Spiral still alongside the annual listening/chart experience, with source, credits, temporal coverage and an explicit monthly-versus-annual explanation. Inspect the asset's own date labels before identifying its time coverage.
- Allow loading the official animation on demand with independent controls. Never play an unsynchronized monthly video under a moving annual cursor while suggesting they match frame by frame.
- The shared GISTEMP source provides a meaningful relationship: the annual chart and generated sound represent annual values of the record depicted monthly in the NASA spiral. The annual chart is the synchronized visual; the original NASA media supplies the monthly context.
- If verified monthly synchronization is later feasible, document a separate monthly-series mapping and frame-time manifest first. This is outside the initial release.
- Retain the official still locally for venue Wi-Fi resilience after build starts; absent media gets an honest unavailable state and source link.

### Sound Laboratory

- Select one real year and an optional second year; display their actual measurements and generated frequencies.
- Play either measurement through the same engine. Show the implemented exponential curve with labeled units and active points.
- Expose source → year → anomaly → domain → normalized value → frequency → generated tone, including actual substituted numbers.
- Explain that 220–660 Hz are audio design bounds, not physical climate thresholds. Keep scientific mapping fixed; expose timing controls without letting one blind-test period use different settings.

## Accessibility and resilience

Use real buttons, fieldsets, radio groups, native range inputs, headings, landmarks and a skip link. Provide visible focus, labeled values, adequate contrast, noncolor selection cues, touch targets, reduced motion and 200% zoom support. Move focus to a reveal heading after submission. Announce state changes and errors politely; avoid screen-reader announcements for every 300 ms note. Supply a keyboard-accessible numerical table and a nonaudio route to the science. Make no blanket accessibility compliance claim.

Bundle the verified data and core assets so playback never depends on NASA requests. A local snapshot does not imply the entire website works on a first visit without connectivity. Do not claim full offline support unless separately implemented and tested. No personal data collection, user accounts or feedback persistence in the initial release.

## Ordered implementation checklist — after the gate opens

- [ ] Recheck official challenge/resources, Local Event start instructions and media usage guidance.
- [ ] Initialize React/TypeScript/Vite; establish scripts, lockfile, global styles, navigation and shared types.
- [ ] Implement CSV pipeline and fail-closed validation; retain raw source, normalized snapshot and report.
- [ ] Test parser, missing/incomplete years, duplicates, sorting, Celsius preservation, metadata and period selectors.
- [ ] Implement pure mapping and single audio engine; test timing and lifecycle independently of React.
- [ ] Build blind test and computed reveal; verify hidden labels and stable randomization.
- [ ] Build synchronized annual explorer, timeline and accessible data alternatives.
- [ ] Integrate inspected official NASA media and attribution; label temporal differences.
- [ ] Build laboratory, second-year comparison and traceable calculation.
- [ ] Audit keyboard, focus, contrast, reduced motion, mobile and zoom behavior.
- [ ] Complete README and science, sonification, accessibility, sources, AI-use and demo documentation.
- [ ] Run automated tests, production build and browser verification; fix observed failures.
- [ ] Prepare Vercel-compatible static output and deploy only if authorized access exists; otherwise document exact deployment steps without inventing a URL.

## Verification and release criteria

Unit tests must check the correct annual column, exclusions, malformed input, duplicate detection, contiguous years, non-overlapping periods, computed means, deterministic monotonic mapping and explicit out-of-domain errors. Use synthetic CSV fixtures clearly marked as tests, never as product data.

Audio tests use an injectable clock/context abstraction to check start, repeated play, pause/resume races, stop, replay, cleanup, speed changes and cancellation of stale callbacks. Real-browser checks must additionally exercise AudioContext activation and lifecycle; mocks cannot establish audible quality.

Interaction tests must run the complete start → A/B play → answer → submit → computed reveal flow, including uncertainty, replay, navigation, seeking and laboratory calculations. Include assertions against actual snapshot-derived results rather than hardcoded guessed outcomes.

Check Chromium and WebKit if infrastructure permits; document versions and any untested browser. Check representative desktop, tablet and narrow mobile viewports, keyboard-only use, text zoom, reduced motion and touch controls. Verify actual output with human listening on real target devices where available; do not claim an automated screenshot proves sound quality or Safari compatibility.

Release blockers: authentic validated snapshot; stable shared mapping; functioning audio and comparisons; correct reveal; synchronized annual chart; meaningful credited EIC media; responsive accessible core controls; passing tests and production build; no critical runtime errors. Optional artistic mode, pixel analysis, extra datasets and feedback collection remain deferred.

## Risks and decisions

| Risk | Response |
| --- | --- |
| Premature competition development | Stop at this plan until the permitted period; no scaffold now. |
| Official challenge temporarily unavailable | Recheck primary brief and resources before code; record unresolved differences. |
| Revised NASA historical values | Pin raw CSV hash and snapshot metadata; compute all UI conclusions from that snapshot. |
| Missing/partial annual records | Explicit exclusion/report; never infer completion from a year label or available J-D alone. |
| Monthly media versus annual sound | Separate labeled NASA context and synchronized annual chart; no guessed frame bindings. |
| Browser scheduling and autoplay | Gesture initialization, audio-clock scheduling, cancellation, hidden-tab pause and device testing. |
| Blind test information leakage | Audit visible and accessible content, including frequencies, charts and tooltips. |
| Education claims exceed evidence | Provide a small usability protocol and record real observations only; no invented outcomes or award prediction. |
| Venue connectivity or missing deployment access | Local data/assets and static build; disclose any hosting or offline limitations. |

## Handoff and documentation plan

The eventual README will cover the challenge, problem, solution, features, data/audio chain, sources, architecture, installation, commands, tests, deployment, accessibility, limitations, contributors, AI disclosure and credits. Preserve the six team roles and ACM Student Chapter / UOBRPL links supplied in the prompt. State explicitly that NASA does not endorse the project.

Demo sequence: introduce NASA data (0–15 s), compare sounds (15–40 s), reveal computed science (40–60 s), explore annual playback (60–90 s), inspect exact mapping (90–110 s), show official visual context and credits (110–120 s). Record tested browser/device combinations and remaining limitations before the demonstration.

Completion at the original planning checkpoint: repository inspection, scientific source research, architecture and implementation checklist. Application, normalized dataset, audio engine, tests and deployment remain intentionally unstarted under the user's pre-event restriction.
