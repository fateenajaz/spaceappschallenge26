# ECHO EARTH

**Rehearsal build — prepared for practice, not the final competition submission.**

**Live application: https://echo-earth-nasa-2026.vercel.app**

**Hear what the planet is telling us.** A browser-based educational listening experiment for NASA Space Apps 2026, Dubai, addressing [The Earth Information Jukebox](https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/).

ECHO EARTH turns real NASA global temperature anomalies into live-generated tones. A visitor compares two hidden climate periods, submits an answer, reveals the actual observations, then explores the historical record and the exact measurement-to-frequency calculation. No account, API key, payment or backend is needed.

## Problem and approach

Visual representations can exclude people or obscure patterns for some audiences. This project explores whether a listener can recognize a multidecade pattern through pitch, then connect it to the numerical and visual evidence. It does not claim that sonification is universally better than a chart or that an educational benefit has been proven.

## Features

- **The Invisible Climate Test:** stable randomized A/B labels, two real 30-year periods, explicit answers including uncertainty, computed means and difference, visual reveal, replay and another validated comparison.
- **Hear the Century:** complete annual observations from 1880–2025; synchronized annual chart, selected year, anomaly and frequency; playback, pause/resume, stop, restart, previous/next, seek, speed, mute and volume.
- **The Sound Laboratory:** real-year selection, a second observation for comparison, exponential mapping curve and substituted calculations.
- **NASA Jukebox:** three published, inspected monthly endpoint snapshots (July/August 2023 and May 2024) paired with their corresponding monthly NASA observations and a fixed historical monthly pitch domain. [Binding method](docs/frame-bindings.md).
- **Volunteer testing:** consent gate, baseline questions, real blind comparison/reveal, follow-up, anonymous browser-local records and JSON exports. Starts with zero results. [Study protocol](docs/user-study.md).
- **Presenter mode:** a 120-second guided rehearsal with real app controls, timer/pause/reset, stage budgets, computed reveal and speaker cues.
- **NASA EIC context:** authentic locally retained Climate Spiral still and on-demand animation. The monthly NASA media and annual explorer are explicitly distinguished.
- Numerical chart alternatives, keyboard controls, visible focus, reduced motion, mobile layouts and source downloads.

## How the application works

Original NASA CSV → validated complete annual `J-D` records → versioned JSON → shared fixed anomaly domain → calculated frequency → one native Web Audio engine → synchronized annual measurement and chart.

The default 300 ms sine event has a modest envelope and identical amplitude across observations. A 30-year comparison takes approximately 9 seconds at normal speed. All three experiences use the same mapping and engine. Changing routes stops audio; hiding the document pauses playback. The NASA video has independent controls and opening it pauses annual audio.

## NASA data and media

Source: [NASA GISS / GISTEMP v4](https://data.giss.nasa.gov/gistemp/) [data documentation](https://data.giss.nasa.gov/gistemp/data_v4.html), [official global land–ocean CSV](https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv).

Bundled snapshot: 146 annual records, 1880–2025, °C anomalies relative to 1951–1980; retrieved November 12, 2026. The incomplete/current 2026 record is excluded. Historical values can change in later NASA revisions. Original bytes, SHA-256 and validation findings are retained in `data/raw`, `public/data` and `src/data/climate.json`.

NASA's [Climate Spiral, SVS 5190](https://svs.gsfc.nasa.gov/5190/) is tagged as an Earth Information Center resource and uses monthly GISTEMP data. Credit: **NASA's Scientific Visualization Studio**; visualizers Mark SubbaRao and Ed Hawkins. The inspected still is labeled 2026 and includes a partial year; no selected-year or frame-perfect annual association is claimed. See [media provenance](docs/sources.md) and [NASA usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

The official challenge URL returned HTTP 502 during research; the supplied project brief is the implementation requirement. Full official challenge-text verification remains outstanding. NASA does not endorse ECHO EARTH.

## Sonification methodology

For the pinned snapshot, `minimum = -0.48 °C`, `maximum = +1.28 °C`:

```text
normalized = (anomalyC - minimum) / (maximum - minimum)
frequencyHz = 220 × (660 / 220) ^ normalized
```

The domain is derived from all complete annual records, never rescaled per comparison. Higher anomalies always yield higher pitches. Invalid and out-of-domain values are errors, not silently clamped. The frequency bounds are design choices, not physical climate thresholds. These are artificial tones; the Earth is not naturally emitting these sounds. Results use arithmetic means of anomalies, not means of frequencies.

See [science](docs/science.md) and [sonification](docs/sonification.md).

## Technical architecture

React + TypeScript + Vite, Tailwind CSS, Lucide React, IBM Plex fonts, native Web Audio, SVG charts. `src/data` owns parsing and selection, `src/audio` owns mathematical mapping and a single playback state machine, `src/hooks` adapts the engine to React, and `src/features` contains the three experiences and methodology. Hash navigation supports static hosting without server routing.

Vitest and React Testing Library exercise data, audio and interaction behavior. Playwright covers Chromium, WebKit and a narrow iPhone-sized WebKit viewport, including axe accessibility checks. No backend or environment secrets are needed.

## Local installation and commands

Use Node 20.19+ (or a current supported Node 22/24 release).

```sh
npm ci
npm run dev
```

Open the printed local URL, normally `http://127.0.0.1:5173`. Press Play to authorize browser audio.

```sh
npm run build           # TypeScript check + production bundle in dist/
npm run preview         # Serve the production bundle
npm test                # Data, mapping, engine and component tests
npm run test:watch
npx playwright install chromium webkit
npm run test:e2e         # Browser flows, accessibility, layout and audio signal check
```

## Reproduce the dataset

Use the retained original and timestamp for a reproducible snapshot:

```sh
npm run data:prepare -- --input data/raw/GLB.Ts+dSST.csv --retrieved-at 2026-11-12T16:52:49.111Z --as-of-year 2026
```

Or fetch a fresh original with verified HTTPS via curl:

```sh
npm run data:prepare
```

The script finds the actual header, selects `J-D`, validates numeric cells and duplicate years, requires twelve complete months and a complete annual value, filters out current/future years, sorts, checks contiguous coverage from 1880, validates comparison intervals, then exports JSON, raw bytes and a report. It preserves Celsius decimals. Fetch or validation failure exits without substituting invented values. To update the retained input, save the official CSV in `data/raw` and pass its actual retrieval timestamp. Review changes before releasing a new snapshot.

## Rehearsal improvements

Open `/#frames` for the dated NASA image/sound pairings, `/#study` to run an actual volunteer session, or `/#present` for the guided demo. These routes are also linked from the introduction/footer. The monthly data domain is distinct from the annual comparison domain and is explained in the interface. All playback uses one engine.

Study responses stay only in the browser and are saved on explicit completion. No server receives them. No real human study has been conducted by the coding agent, and no learning-benefit result is claimed. Synthetic browser test records run in isolated test contexts and are never seeded into the product. Exported results preserve raw answers and snapshot/protocol metadata.

Prepare monthly snapshots with the same `data:prepare` command. To reproduce the inspected NASA assets/manifest:

```sh
npm run data:prepare:eic -- --download
```

Changed source image hashes require reinspection. See [frame bindings](docs/frame-bindings.md) and [volunteer protocol](docs/user-study.md).

## Deployment

The repository includes `vercel.json` with Vite, `npm run build` and `dist` output. No environment variables are required. For a new Vercel project, import this directory from a repository or run:

```sh
npx --yes vercel@65.15.0 link
npx --yes vercel@65.15.0 deploy
# After verifying the preview:
npx --yes vercel@65.15.0 deploy --prod
```

The deployed project is `echo-earth-nasa-2026`; the current checkout is linked locally. The preinstalled CLI 44.5.5 was rejected by the upload endpoint, so use the pinned current CLI above. To rerun the browser checks against production: `ECHO_BASE_URL=https://echo-earth-nasa-2026.vercel.app npm run test:e2e`. Source-instrumented signal analysis runs only in local Chromium.

Choose the intended team and a new ECHO EARTH project; do not link an unrelated production project. Commit the snapshot and NASA assets so deployment never depends on fetching NASA during a build. Hash URLs work on standard static hosting. The 19 MB NASA video is downloaded only when opened; the main annual data is bundled locally.

## Accessibility and verification limits

Charts have data tables; source and methodology text remain usable without hearing. Controls use native semantic elements and labels. A focused skip link, reveal focus management, reduced motion and responsive layouts are implemented. See [accessibility notes](docs/accessibility.md) and [verification evidence](docs/verification.md).

Automated checks cannot establish usability for every access need. WebKit emulation is not a claim of testing real iOS hardware or installed Safari. Physical listening and screen-reader testing require team review. No user-study result or award prediction is claimed.

## Scientific limitations

Anomalies are departures from a baseline, not absolute temperatures. Annual global estimates hide monthly, spatial and uncertainty information. Sonification communicates the chosen scalar record and mapping; it does not explain causation. Different hearing profiles and devices change perception. The local snapshot is a pinned source revision. NASA monthly media is context; the custom annual chart is the synchronized visual.

Bundled data and media remove runtime NASA dependencies. Full first-visit offline access is not implemented; serve the application locally for an offline venue demonstration.

## Contributors

| Contributor | Responsibility                            |
| ----------- | ----------------------------------------- |
| Fateen      | Team leader, architecture and integration |
| Abdullah    | NASA data and scientific validation       |
| Zayd        | Audio engine and sonification             |
| Yaser       | Frontend and visualizations               |
| Rayyan      | Accessibility and education               |
| Vishal      | Testing, documentation and demo           |

Collaboration: [ACM Student Chapter](https://acmuobd.com) and [UOBRPL](https://uobrpl.com).

## AI-assisted development and third-party credits

Codex assisted with architecture, implementation, tests and documentation. NASA measurements were retrieved, never generated. Team review and human validation remain necessary. [Disclosure and development timing](docs/ai-usage.md).

React / React DOM (MIT), Vite (MIT), Tailwind CSS (MIT), Lucide (ISC), IBM Plex Sans/Mono (SIL Open Font License), and the development tools retain their respective licenses. NASA media is separately attributed and is not covered by a blanket application-code license. See [sources and credits](docs/sources.md). No NASA insignia is used as the application's identity.

[Two-minute demonstration](docs/demo.md) · [Team development contracts](docs/team.md).

## Visual design

The NASA-inspired redesign uses Public Sans, a black Earth-led introduction, blue actions and light editorial science pages. Decorative eyebrow headings are removed. The playback canvas reads actual post-volume Web Audio samples; muted and paused sound produces a resting visual. Blind comparisons show amplitude alone; the explorer, laboratory and revealed comparisons show waveforms. Reduced-motion mode keeps a static visual. See [design notes](docs/design.md).

## Classroom discovery additions

Open `/#lesson` for the five-minute classroom activity with English/draft Arabic guidance, the blind comparison, a new prediction/reveal about cooler years within 1991–2020, and verified NASA endpoint exploration. The Arabic guidance is explicitly awaiting educator review; existing comparison and NASA controls remain English. `public/teacher-guide.html` is printable with the browser’s Print / Save as PDF command.

The NASA viewer now has a keyboard-operable endpoint scrubber and a “Describe this moment” action with a screen-reader announcement. It still uses the three inspected snapshots; no continuous NASA movie frame binding is claimed. `/#present` now follows prediction → reveal → connected observation → actual pilot evidence → classroom use. See `docs/pilot-report.md` for collecting and reporting actual feedback. No participant results or educator endorsements have been invented.

## Connected story and actual image sonification

The home page is now a six-chapter journey with meaningful chapter transitions, keyboard focus handling and reduced-motion support. Its image instrument reads the real retained NASA SVS raster in the browser: color selects a voice, vertical position selects a note, and retained pixel density sets the level. The spatial scan follows the audio clock. Two inspected EIC-tagged visualizations are selectable; the method and actual pixel fractions are exposed. No pixels are presented as recovered temperature data. See [story and image-score method](docs/story-and-image-score.md).

The NASA Jukebox route also offers this image instrument, followed by the distinct numerical endpoint instrument. Image sound has its own volume/stop controls and is stopped when leaving the chapter or route. The numerical source records are unchanged. User-supplied challenge text guided the experience; it is not an organizer eligibility approval.
