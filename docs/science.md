# Scientific method

NASA GISS's GISTEMP v4 global Land–Ocean Temperature Index estimates global surface temperature change. The source table reports monthly, seasonal and annual anomalies from the 1951–1980 mean, in Celsius decimals. An anomaly is not absolute temperature. Source: https://data.giss.nasa.gov/gistemp/data_v4.html.

The pipeline selects the official `J-D` annual value. It does not average rounded monthly cells or confuse `D-N` with January–December. Both J-D and all twelve months must be present for past calendar years; the current year remains excluded even if an annual-like value is populated. Missing/malformed input is reported, not invented or interpolated. Global coverage must be contiguous from 1880. The original CSV hash links every shipped record to the retained bytes. The normalized snapshot is dated November 12, 2026 and contains 1880–2025.

Period means are arithmetic averages of annual anomalies. The initial comparison is 1961–1990 versus 1991–2020. The additional preset compares 1881–1910 and 1991–2020. Each period has exactly thirty years; pairs do not overlap. Labels are randomized once per attempt; results and differences are computed, never hardcoded. No uncertainty estimate or causal inference is encoded.

The reference period is fixed by NASA's dataset. Shifting a baseline would shift anomaly values and would require explicit relabeling; this application never mixes baselines. Individual annual variability is not equivalent to a multidecade pattern. Historical observations can be revised by NASA, so the app shows a snapshot revision and verification date.

NASA SVS's Climate Spiral (https://svs.gsfc.nasa.gov/5190/) uses monthly GISTEMP anomalies on the same baseline. The locally inspected still is labeled 2026. It is shown as monthly context with a partial year, not represented as an annual frame for a selected observation. The app's custom annual SVG chart is synchronized to the annual sound. No frame-perfect binding to the original animation is claimed.

The product explores a listening interaction; it does not claim sound establishes causation, proves a learning benefit, or measures the user's competence. It represents a scalar global estimate without regional or observational-uncertainty sonification. NASA does not endorse the project.

A separate monthly endpoint mode now pairs published NASA stills with explicitly documented July 2023, August 2023 and May 2024 dates. Matching monthly values come from the same retained NASA CSV, with a domain computed from all 1,752 months in complete calendar years. The annual listening comparison remains unchanged. See `docs/frame-bindings.md` for source-date evidence, image hashes, historical revision limits, domain scope and the distinction between a selected endpoint sequence and a continuous original NASA movie.
