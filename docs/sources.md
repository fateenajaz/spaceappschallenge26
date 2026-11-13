# Sources and credits

- NASA GISS / GISTEMP v4: https://data.giss.nasa.gov/gistemp/
- Download definitions and 1951–1980 baseline: https://data.giss.nasa.gov/gistemp/data_v4.html
- Official global CSV: https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv
- NASA SVS 5190, NASA Climate Spiral, EIC-tagged resource: https://svs.gsfc.nasa.gov/5190/
- Challenge: https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/ (HTTP 502 on direct retrieval; supplied brief used, official full text remains unverified).
- NASA usage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/

## Original observations

`data/raw/GLB.Ts+dSST.csv` was downloaded over verified HTTPS on November 12, 2026 at 16:52:49.111 UTC. SHA-256: `a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253`. A hash-addressed downloadable copy is retained in `public/data`. The normalized data and report document the transformation version and exclusions. NASA records are not covered by a fabricated project attribution or generated from AI.

## NASA media

Credit: **NASA's Scientific Visualization Studio**. Listed visualizers: Mark SubbaRao (NASA/GSFC) and Ed Hawkins (National Centre for Atmospheric Science, University of Reading). GISTEMP data provider: NASA/GISS. Additional full credits and publications remain on the item source page.

Local still `public/nasa/climate-spiral.jpg`: downloaded from https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005190/GISTEMP_Spiral_English_degC_2160p60.01402_print.jpg . SHA-256 `038243a40cea07cfaae48b102e4b4563fa41ee29ad53e052eb1bf0e7a79eb8c2`. Inspected visually: central year label 2026, monthly axes and anomaly circles. No precise ending month is inferred from the filename.

Local animation `public/nasa/climate-spiral.mp4`: https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005190/GISTEMP_Spiral_English_degC_2160p60.mp4 . SHA-256 `64af12363dd8480776146063bd450f12e3f47590ced22d198403cbb71276531f`. Original source file retained; loaded on demand. The download was resumed after an initial timeout. Browser metadata loading is checked separately. The local VTT is an ECHO EARTH-authored general visual description, not a NASA-authored transcript or exact numerical transcription.

NASA media guidelines were consulted. Use is educational, with visible source credit and no NASA endorsement claim or NASA logo as project branding. Any future asset with a third-party copyright notice requires separate review.

## Software and fonts

React/React DOM, Vite, Tailwind CSS and TypeScript retain their project licenses. Lucide icons retain the ISC license. Public Sans and IBM Plex Mono are distributed locally through Fontsource under the SIL Open Font License; see the installed packages' LICENSE files. Vitest, Testing Library, Playwright, axe-core, tsx and Prettier are development tools. `package-lock.json` records exact dependency versions. No third-party analytics, payment or AI API runs in the product.

## Dated monthly frame additions

The rehearsal adds the original published July 2023 Celsius spiral (SVS 5137), August 2023 Celsius spiral (SVS 5161, EIC tagged) and May 2024 Celsius monthly graph (SVS 5311, EIC tagged). Full source URLs, exact asset URLs, publication/retrieval dates, inspection evidence and file hashes are downloadable in `public/data/eic-frames.json`. See `docs/frame-bindings.md`. The source graphics retain their historical revisions; audio uses the matching dates in the pinned raw CSV. No frame-index date formula or invented observation is used.

## Blue Marble context image — November 2026 redesign

[The Blue Marble: True-Color Global Imagery at 1 km Resolution](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/) supplies the illustrative Earth used in the introduction and live audio panels. Credit: NASA Goddard Space Flight Center / NASA Earth Observatory; Reto Stöckli (land surface, shallow water, clouds), Robert Simmon (ocean color, compositing and 3D globes). This 2002 composite uses observations principally from 2001. It is context imagery, not a visual measurement of the selected climate year.

Original: https://assets.science.nasa.gov/content/dam/science/esd/eo/content-feature/bluemarble/images/globe_east_2048.tif . The retained original is `data/media-originals/blue-marble-east-2002.tif`; the display derivative is resized to 1400 × 1400 and encoded as WebP (quality 88) at `public/nasa/blue-marble-east.webp`.

Blue Marble original SHA-256: `0a14c09e1ec0ce40ccf73e4e305ec3a9c40503f8b4f5e21c95894bd33cb52f56`. Display derivative SHA-256: `26a0cc84742125c5bf3edd477e2cf23adfa52bbd48522ecf01bf0bb5f6253e55`.
