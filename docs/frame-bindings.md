# Auditable monthly NASA frame–sound pairings

The `/#frames` route adds three published, inspected NASA visual snapshots. Each snapshot is associated with the documented final month of that visualization. Its selected date chooses the displayed image, the corresponding monthly record, and the frequency supplied to the shared Web Audio engine.

| Date | Official NASA item | Verified media |
| --- | --- | --- |
| July 2023 | https://svs.gsfc.nasa.gov/5137/ | Published Celsius Climate Spiral still; source explicitly specifies coverage through July 2023. Visual inspection confirms the 2023 label and final arc at July. |
| August 2023 | https://svs.gsfc.nasa.gov/5161/ | Published August Celsius Climate Spiral still; source explicitly specifies coverage through August 2023 and tags the item Earth Information Center. Visual inspection confirms the year and August endpoint. |
| May 2024 | https://svs.gsfc.nasa.gov/5311/ | Published completed Celsius monthly line-graph still; source explicitly specifies coverage through May 2024 and tags the item Earth Information Center. Visual inspection confirms the baseline label and completed graph. |

The first two snapshots are adjacent months; the third is nine months after August. The sequence is explicitly labeled as selected snapshots, not consecutive monthly playback. The stills retain the historical record through their endpoint; the sound represents only the selected endpoint observation. No sound is calculated from image colors or pixels.

The raw NASA CSV retained for annual data also supplies 1,752 monthly observations across complete calendar years 1880–2025. Its monthly columns are parsed and validated in the same pass as J–D. Data in incomplete/current years is deliberately excluded from this monthly snapshot. The monthly record at each explicit `(year, month)` key is paired with the corresponding published still. The app exposes the exact source, evidence, date, asset hash, anomaly, normalization and frequency.

## Mapping scope and revisions

Monthly anomalies span −0.81 to +1.48 °C in the retained snapshot. The monthly mode uses this complete historical domain, never just the three selected values, and maps exponentially to 220–660 Hz. The original annual experiences keep their −0.48 to +1.28 °C domain. Both mappings are monotonic, but pitches across modes must not be compared directly. There is still one audio engine; domain and duration are explicit sequence settings preserved on pause/resume/replay/seek and restored to annual defaults on an annual play command.

Graphics were published in 2023/2024 and retain those releases' observations. The audio reads the matching monthly date in the pinned November 2026 CSV. Historical GISTEMP revisions can cause small numerical differences. The app discloses this and does not claim pixel-level numerical identity. Both use the GISTEMP v4 land–ocean anomaly definition and 1951–1980 baseline. These are endpoint-date bindings, not a claim of synchronization to every original movie frame.

## Source preparation and verification

`src/data/eic-frames.json` and the downloadable `public/data/eic-frames.json` contain full source/asset URLs, publication dates, retrieval timestamps, review evidence and SHA-256 values. Images are retained unchanged in `public/nasa/monthly`. The contact sheet `docs/frame-review/published-monthly-stills.jpg` records the three inspected images together; it is review material, not a substitute NASA scientific visualization.

Regenerate both data snapshots with the documented `npm run data:prepare` command and retained raw CSV. Regenerate the binding manifest with `npm run data:prepare:eic`; `-- --download` retrieves the exact published files and verifies their hashes against the inspected manifest. Changed image bytes require a new source/date/visual review rather than automatic acceptance.

All three images preload successfully before sequence audio is enabled. A display/load failure stops sound and reports the problem. The active image and tone consume the same engine index; each still is held for 1.2 seconds at normal playback speed. Date selection, preview, play/pause/resume, replay, stop, previous/next, speed and global volume/mute are functional.

Credit: NASA's Scientific Visualization Studio. Visualizer: Mark SubbaRao. Spiral concept/visualizer: Ed Hawkins. Full individual credits remain on each source page. NASA does not endorse ECHO EARTH.
