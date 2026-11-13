# `src/data/` — NASA climate data module

Owner: Abdullah (NASA data and scientific validation). This folder turns NASA's
official global temperature record into clean, validated records that the UI and
audio modules share. **No NASA value is typed in by hand anywhere in this
module.** Every number is parsed from the committed raw CSV or computed from it.

## Source and credits

| Field         | Value                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Dataset       | GISS Surface Temperature Analysis, version 4 (GISTEMP v4): Global Land–Ocean Temperature Index |
| Producer      | NASA Goddard Institute for Space Studies (GISS)                                                |
| File          | `GLB.Ts+dSST.csv` (global means, land + ocean)                                                 |
| Source URL    | https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv                                |
| Dataset info  | https://data.giss.nasa.gov/gistemp/                                                            |
| Column used   | `J-D`: January–December annual mean                                                            |
| Units         | °C (degrees Celsius)                                                                           |
| Base period   | 1951–1980 (anomalies are departures from this period's mean)                                   |
| Coverage      | 1880 through the last complete calendar year in the snapshot (see `sourceMetadata.coverage`)   |
| Date accessed | See `retrievedAt` in `climate.json` (also `sourceMetadata.accessedAt`)                         |
| Raw copy      | `data/raw/GLB.Ts+dSST.csv`, SHA-256 recorded in `climate.json` → `rawSha256`                   |

Suggested citation:

> GISTEMP Team, 2026: GISS Surface Temperature Analysis (GISTEMP), version 4.
> NASA Goddard Institute for Space Studies. Dataset accessed (see `retrievedAt`)
> at https://data.giss.nasa.gov/gistemp/.
>
> Lenssen, N., G.A. Schmidt, M. Hendrickson, P. Jacobs, M. Menne, and R. Ruedy, 2024:
> A GISTEMPv4 observational uncertainty ensemble. _J. Geophys. Res. Atmos._, 129,
> e2023JD040179, doi:10.1029/2023JD040179.

ECHO EARTH is not endorsed by NASA. NASA data are used as published.

## Files

| File                                  | What it is                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `climate-api.ts`                      | **Recommended entry point** for UI and audio: records, ranges, means, presets, source metadata        |
| `climate-api.test.ts`                 | Tests checking the API against the raw CSV                                                            |
| `climate-loader.ts`                   | Loads and validates `climate.json`, original presets and `createAttempt()` used by the listening test |
| `validators.ts`                       | CSV parser (`parseNASA`) and dataset validation                                                       |
| `validators.test.ts`                  | Parser tests (synthetic fixtures + full reproduction of the shipped data)                             |
| `climate.json`                        | Generated annual records `{ year, anomalyC }` plus provenance metadata                                |
| `monthly.json`                        | Generated monthly records (same source)                                                               |
| `eic-*`, `study.*`, `presentation.ts` | Visualization frame bindings, study and demo helpers                                                  |

## Using the API

```ts
import {
  getAllRecords, // all { year, anomalyC }, oldest first
  getRange, // getRange(1961, 1990) → 30 records (throws if incomplete)
  getYear, // getYear(1998) → record or undefined
  meanAnomaly, // meanAnomaly(1991, 2020) → number, °C vs 1951–1980
  comparisonPresets, // non-overlapping 30-year pairs with computed means
  getPreset, // getPreset("1961-1990_vs_1991-2020")
  sourceMetadata, // name, URL, units, base period, coverage, accessed date
} from "../data/climate-api";
```

Comparison presets (all 30-year, non-overlapping, earlier period first; the UI
should shuffle them for the blind A/B test):

- `1961-1990_vs_1991-2020`: two recent climate normals (the blueprint default)
- `1931-1960_vs_1991-2020`: mid-century vs recent
- `1901-1930_vs_1991-2020`: early 20th century vs recent

Each preset has `periods[i].meanAnomalyC` and `differenceC` (later minus earlier),
computed when the module loads.

## How the data was processed

Run with `npm run data:prepare` (script: `scripts/prepare-climate-data.ts`). Use
`--input data/raw/GLB.Ts+dSST.csv` to rebuild from the committed snapshot instead
of downloading.

1. **Read the raw CSV** (downloaded from the official URL over HTTPS) and record
   its SHA-256 hash so the exact input can be verified later.
2. **Skip the title row** (`Land-Ocean: Global Means`) by searching for the row
   that starts with `Year,`. Columns are found **by name**, not by position.
3. **Validate every cell**: each must be a number or the missing marker `***`.
   Malformed numbers, duplicate years, wrong column counts and implausible values
   (|x| > 10 °C) stop the build with an error.
4. **Treat `***` as missing.**
5. **Keep a year only if** all 12 months and the `J-D` annual value are present,
   **and** the year is earlier than the current calendar year. Incomplete years
   (such as the current year) are excluded and listed in
   `public/data/validation-report.json`.
6. **Keep the values exactly as published**: °C relative to 1951–1980. **No
   rebasing**, smoothing or unit conversion.
7. **Check coverage**: years must run 1880, 1881, … without gaps, and the
   1961–1990 and 1991–2020 periods must each be complete.
8. **Write** `climate.json` (annual) and `monthly.json`, plus a hash-named copy of
   the raw CSV in `public/data/` so visitors can download the original.

Tests (`npm test`) re-parse the committed raw CSV and confirm it reproduces the
shipped records exactly, that the hash matches, and that every mean and preset
matches an independent calculation from the raw file.

## Scientific QA notes

Checks done for the data deliverable (all automated in `npm test` unless noted):

| Check                                               | How it is verified                                                                                                                                                                                                                                | Result          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Raw file is the one we processed                    | SHA-256 of `data/raw/GLB.Ts+dSST.csv` equals `rawSha256` in `climate.json`                                                                                                                                                                        | Pass            |
| Every shipped value equals NASA's J-D value         | Each record compared to an independent read of the raw CSV                                                                                                                                                                                        | Pass            |
| No gaps, duplicates or missing values               | Years run 1880 → last complete year, all values finite                                                                                                                                                                                            | Pass            |
| Incomplete/current year excluded                    | Any year with `***` in J-D or months is absent                                                                                                                                                                                                    | Pass            |
| Baseline not altered                                | 1951–1980 mean is close to zero, as NASA's definition implies                                                                                                                                                                                     | Pass            |
| Comparison means are computed, not typed            | Each preset mean equals a fresh calculation from the raw CSV                                                                                                                                                                                      | Pass            |
| 1991–2020 warmer than 1961–1990                     | Computed means compared                                                                                                                                                                                                                           | Pass            |
| Chart and sound use the same numbers                | `climate-api`, charts (`src/components/Charts.tsx`) and audio (`src/hooks/useAudioEngine.tsx`) all read `records`/`domain` from `climate-loader.ts`                                                                                               | Pass            |
| No year is clamped by the sound mapping             | Audio domain = data min/max; every year maps inside `FREQUENCY_MIN`–`FREQUENCY_MAX`                                                                                                                                                               | Pass            |
| Warmer always sounds higher                         | Pitch order matches anomaly order for all years                                                                                                                                                                                                   | Pass            |
| Mapping differs from blueprint draft (manual note)  | Blueprint §7 proposed clamping to −0.5…1.5 °C at 220–440 Hz. The audio module instead maps the full data range to 220–660 Hz, so no clamping occurs. This is the audio owner's design choice; the data module only confirms it covers every year. | Noted           |
| NASA visualization frames match data years (manual) | Owned by frame bindings: see `docs/frame-bindings.md` and `eic-loader.test.ts`                                                                                                                                                                    | See those files |

## Scientific limitations

- **Anomalies, not absolute temperatures.** Each value is how much warmer or
  cooler a year was than the 1951–1980 average, not Earth's actual temperature.
  A value of `+1.0` means "1 °C above the 1951–1980 mean", not "1 °C". Pitch in
  ECHO EARTH represents this difference.
- **The base period is a reference choice.** Using a different baseline (e.g.
  1991–2020 or pre-industrial) would shift every value up or down by a constant,
  but would **not** change the shape of the trend or the difference between two
  periods. We keep NASA's 1951–1980 baseline unchanged so our numbers match NASA's
  published charts and the Climate Spiral. Because the baseline is 1951–1980,
  that period averages roughly zero by definition.
- **Year-to-year natural variability.** Single years go up and down because of
  natural factors such as El Niño / La Niña, volcanic eruptions and solar
  variation. One warm or cool year does not show a trend. Climate change is
  judged over longer periods, which is why the listening test compares 30-year
  averages.
- **Global average.** This is one number per year for the whole planet. It
  hides large regional and seasonal differences. Some places warm much faster
  (e.g. the Arctic), and local temperatures can differ a lot.
- **Measurement uncertainty.** GISTEMP is an estimate built from weather
  stations and sea-surface measurements. Uncertainty is larger in the early
  record (late 1800s) when coverage was sparse. Values are published to 0.01 °C,
  but the true uncertainty is larger than that, especially for early years.
- **The record gets revised.** NASA updates GISTEMP monthly, and past values can
  shift slightly as new data and methods arrive. Our snapshot is fixed (see
  `retrievedAt` and `rawSha256`); a fresh download may differ in the last
  decimal.
- **Sound is a representation.** The tones are generated from these numbers by
  a documented mapping (see `src/audio/`). They are not recordings of Earth.

## Rules for changing this folder

- Never edit `climate.json` or `monthly.json` by hand. Regenerate them with the
  script.
- If you re-download the CSV, commit the new raw file, regenerate, and run
  `npm test`. The dataset id and hash will change.
- Keep `{ year: number, anomalyC: number }` (defined in `src/types/climate.ts`)
  as the shared record shape.
