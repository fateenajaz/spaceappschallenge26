# Verification evidence

## Latest rehearsal update — three improvements

The current application adds dated NASA monthly frame pairings, facilitated volunteer-study tooling, and a guided presenter mode. This is a user-confirmed rehearsal build, not the final submission. No human volunteer study has been conducted by the coding agent.

- `npm run build` passed TypeScript checking and production bundling. Current main JS: approximately 361.76 kB / 102.99 kB gzip; CSS: 37.18 kB / 8.17 kB gzip.
- `npm test`: **29 passed**, six files. Added coverage reproduces all 1,752 monthly records from retained NASA bytes, checks image SHA-256 values and explicit endpoint dates, preserves separate fixed annual/monthly domains, rejects corrupt study records, computes descriptive summaries from raw responses, and preserves monthly engine options across resume/replay/seek while restoring annual defaults.
- `npm run test:e2e`: **28 passed, 2 intentionally skipped**, 30 cases across Chromium, WebKit and mobile WebKit. New cases exercise monthly dates/values/frequencies, image/sound progression, pause/resume and speed, source audit, no-audio volunteer participation, explicit consent/save, exact raw-record JSON export, cancelling an unfinished session without deleting saved sessions, storage-corruption reporting, presenter timer and real comparison/reveal, stage navigation and reset, and image failure/retry.
- axe checks passed on all three new routes. Layout checks passed at 320/768/1280 CSS pixels and 200% text sizing, in addition to existing-route regression checks.
- The monthly assets were fetched again with `npm run data:prepare:eic -- --download`; all three matched the reviewed hashes. The script refuses changed bytes and does not silently bless a new date binding. Data pipeline version 1.1.0 exports annual and monthly snapshots with one retained raw source hash.
- Desktop NASA frame mode and mobile presenter screenshots were visually reviewed. The new study tests use explicitly synthetic responses in isolated browser contexts; their results are not presented as human study evidence.
- Real human listening, screen-reader/physical-device testing, and actual volunteer sessions remain necessary. Monthly graphics retain historical revisions; the app discloses possible minor numerical differences from the current pinned CSV and makes no original-movie frame-perfect claim.

The sections below preserve the original application verification checkpoint; a new deployment check is recorded after publication.

## Original application checkpoint

Verified November 12, 2026 on the local macOS arm64 environment. These are observed results, not a claim of complete scientific, browser or accessibility certification.

## Data and build

- Official CSV retained with SHA-256 `a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253`.
- Pipeline validation passed: 146 complete annual observations, 1880–2025; 2026 excluded; Celsius values and 1951–1980 metadata preserved; contiguous coverage and comparison intervals checked. Report: `public/data/validation-report.json`.
- `npm run build` passed TypeScript checking and Vite 8.3.8 production bundling. Main JS approximately 269.45 kB / 83.42 kB gzip; CSS approximately 28.36 kB / 6.75 kB gzip. Fonts are local; NASA video is on demand.
- Dependency installation audit reported zero vulnerabilities at installation. This is a point-in-time result, not a security guarantee.

## Automated behavior checks

`npm test`: **20 passed**, four files. Coverage includes official CSV reproduction and hash, header/annual-column handling, missing/incomplete/current years, malformed input, duplicate detection, Celsius metadata, chronological coverage, computed means, valid non-overlapping periods, stable A/B assignment, monotonic mapping, out-of-domain errors, audio start/pause/resume/stop/replay/seek/speed/mute/volume, async cancellation, node disposal, hidden-label reveal, computed results and neutral uncertainty.

`npm run test:e2e`: **10 passed, 2 intentionally skipped**, approximately 9 seconds in the final local run. Browser versions installed by Playwright 1.65.0: Chromium build 1254 (Chrome for Testing 158.0.8127.18), WebKit build 2388 (27.2), plus iPhone 13-sized WebKit emulation.

Observed in all three projects:

- Introduction CTA → blind A/B playback → pause/resume → sequence switching → explicit submission → computed reveal.
- Reveal focus, period labels, uncertainty path and explorer navigation.
- Year navigation, seeking, audio-clock progression, frozen year while paused, playback speed, mute/unmute, volume, restart and stop.
- Laboratory selection, exact substituted frequency and gesture-triggered audio initialization.
- No uncaught page errors in the complete flow.
- axe checks on Listening Test, Explorer, Laboratory and Science routes: no violations in the tested states.
- Local NASA still decoded and original animation metadata loaded.
- Screenshot capture of home, listening test, explorer and laboratory; desktop home and mobile explorer screenshots were visually inspected.
- No page overflow across all five routes at 320, 768 and 1280 CSS pixels, and at 200% text size; reduced-motion mode enabled during layout checks. A separate 320-pixel diagnostic confirmed explorer chart and controls fit inside the viewport rather than being clipped.

Chromium additionally captured the production AudioEngine's real Web Audio signal through an AnalyserNode, checked nonzero RMS amplitude and located the expected fundamental within two FFT bins. This is signal analysis, not physical listening. The same test is intentionally skipped for the two WebKit projects; audio activation and interactive playback still run there.

`unslop-ui` static scan: zero findings at the time of the scan. This is a mechanical design check; visual judgment still matters.

## User-story boundaries

The product flows from a user playback gesture → bundled, validated NASA records → shared mapping → Web Audio oscillators → shared audio-clock index → chart/current measurement. There is no runtime API/backend/database boundary. NASA requests are needed for explicit source links or future offline snapshot refreshes, not for pressing Play.

## Limits and remaining review

- Real iOS/iPadOS hardware, installed Safari, Firefox, Edge, screen readers, and human listening comfort/discriminability have not been verified.
- The companion in-app browser host was unavailable; project browser QA used the requested Playwright infrastructure.
- No user study, learning-effect estimate, accessibility certification or award outcome is claimed.
- Official challenge full text remained unavailable through direct retrieval (HTTP 502); the user-supplied master prompt guided implementation.
- NASA monthly media has no verified frame-to-annual-data binding. The custom annual chart is the synchronized visual.
- Full first-visit offline hosting is not implemented; serve the bundled application locally for a disconnected demonstration.
- Development timing and competition eligibility are disclosed in `docs/ai-usage.md`.

## Production deployment

- Vercel project: `echo-earth-nasa-2026`, project ID `prj_PvrSNFh0AH9ZCVkzBNk4MfVOqvAy`, within the authenticated team `fateennaqash-1514s-projects`. No existing project was overwritten.
- Published URL: https://echo-earth-nasa-2026.vercel.app . Deployment ID: `dpl_CYcNkMtcUXneSXUmaG92WESzHTgN`; Vercel returned READY, production environment, with no deployment login protection.
- Build runtime: Node 24.x. Source deployment used CLI 65.15.0 after the installed 44.5.5 upload was rejected as outdated. No global CLI installation was changed.
- Unauthenticated public HTTPS request returned HTTP 200.
- Downloaded production `data/climate.json` exactly matched the validated local snapshot, including all records and the original CSV SHA-256.
- `ECHO_BASE_URL=https://echo-earth-nasa-2026.vercel.app npm run test:e2e`: **9 passed, 3 intentionally skipped** in 10.6 seconds. Full user flow, accessibility/media and layout checks passed in Chromium, WebKit and mobile WebKit against the published site. Source-instrumented signal analysis is skipped remotely because production serves compiled assets rather than the source instrumentation module.
- Browser tests and documentation changes after deployment did not change application code or the published scientific snapshot. No external analytics, accounts or secrets are required by the deployed application.

## Rehearsal update — production verification

- Published to the existing rehearsal project `echo-earth-nasa-2026`, deployment `dpl_5ZAwsyCtYaFiJ6TSid6mYHYwctVb`, READY in the production environment with no login protection. URL: https://echo-earth-nasa-2026.vercel.app .
- `ECHO_BASE_URL=https://echo-earth-nasa-2026.vercel.app npm run test:e2e`: **27 passed, 3 intentionally skipped** in 27.9 seconds. All old and new flows passed in Chromium, WebKit and mobile WebKit; only the source-instrumented local signal-analysis test is skipped remotely.
- Published annual JSON, monthly JSON and binding manifest exactly matched the verified local objects. Each of the three published NASA images was independently downloaded and SHA-256-checked against the inspected manifest.
- Routes: `/#frames` (dated NASA Jukebox), `/#study` (facilitated volunteer sessions), `/#present` (guided rehearsal).
- Production study checks used synthetic, explicitly labeled responses in isolated browser contexts. Nothing was sent to a backend or inserted into other users' browser storage. These checks are software evidence, not a human study.
- The existing local development server was reused and left running; it was already present when this update began. Application code and published scientific data were unchanged by this final documentation update.

## NASA-inspired redesign — November 13, 2026

- Production build passes; 30 unit/component checks pass.
- Local browser suite: 31 passed, 2 intentionally skipped (Chromium-only source-level fundamental analysis). Chromium, WebKit and mobile WebKit pass the live signal/mute/pause/reduced-motion checks and existing full product flows.
- Visually inspected desktop introduction, listening comparison, explorer at rest and playing, and mobile introduction. Checked narrow widths and enlarged text. NASA spiral images now reserve their intrinsic dimensions; the mobile media test scrolls into view before checking the deliberately lazy-loaded file.
- React review: the canvas uses transient refs/native drawing rather than React state per frame, creates no new audio context, and releases its animation, observer and subscription. No animation/3D framework was added.
- All 22 requested design skills verified installed. NASA Blue Marble source and derivative hashes recorded in sources.md; the scientific CSV, annual/monthly JSON and frame bindings are unchanged.

### Redesign production result

Deployment `dpl_9YV5EzTeYRbmwxL4GHy7hWm1ZmEy` is READY on the existing production URL, with no login protection. The public browser suite passed 30 checks, with 3 intentional skips for source-only instrumentation. Live signal checks passed on Chromium, WebKit and mobile WebKit. A separate home-page axe scan returned no violations. Annual/monthly data, frame manifest and Blue Marble image returned HTTP 200 and matched the local files byte-for-byte. No human study or accessibility certification is implied. This final verification note does not change deployed application code.

## Storytelling and image instrument revision

The home journey was visually inspected at desktop and narrow mobile sizes. All 34 unit/component tests pass, including actual raster fraction rules and rejected blank inputs. The production build passes. Story traversal, user-initiated image playback, pause, source selection, method table, measured comparison, discovery reveal, reduced motion and image-failure handling pass in Chromium, WebKit and mobile WebKit. Axe checks run against the image instrument with its method table expanded. Existing numerical audio and study flows remain covered.

A Chromium browser signal check captures nonzero PCM from the actual NASA image playback, verifies pause drains the signal, and verifies leaving the chapter closes its audio context. A closed context can retain the analyser’s last buffer; closed-context buffer contents are not a measure of continuing sound. This is signal verification, not a human assessment of musical quality. Real device listening and assistive-technology feedback remain outstanding.

## Focused UX revision

Layout checks confirm the chapter-2 image, comparison, variability and ending screens fit a 1440×900 viewport without a vertical scroll requirement. The comparison also fits a 390×844 viewport. Narrower devices and enlarged text may scroll naturally; no overflow is hidden to force a false fit. Regression checks cover 320px layouts and 200% text, Escape/focus restoration in native dialogs, switching sonification methods without stacking both instruments, source failures, and the guided comparison.
