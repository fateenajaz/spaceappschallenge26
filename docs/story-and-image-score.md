# A connected Earth story and an image-derived instrument

The home route now presents six deliberate chapters: our home → a NASA visual language → an audible image → a numerical comparison → yearly variability → classroom use and sources. Visitors control progression and sound. Chapter entry uses a short fade/translation; reduced-motion preferences remove it. Navigation focuses the chapter heading and remains usable without hearing. No timers force progress.

## Authentic source material

The opening uses the retained NASA Blue Marble. The image instrument uses only the inspected EIC-tagged SVS 5161 and SVS 5311 visualizations in the existing frame manifest. The first is the published August 2023 Celsius climate spiral, the second the published monthly graph through May 2024. Images are retained unchanged, attributed and linked to NASA source pages. Selection never implies that these two images are consecutive frames of one movie. Asset URLs and hashes remain in public/data/eic-frames.json.

The NASA 5161 source page explicitly links the GISTEMP dataset underlying the graphic and describes its monthly anomalies relative to 1951–1980: https://svs.gsfc.nasa.gov/5161/ . Media guidance: https://www.nasa.gov/nasa-brand-center/images-and-media/ . The project does not use NASA insignia as branding, claim NASA endorsement, or imply NASA authored its sound or narrative. Individual source credits remain authoritative.

## Image-to-sound method (version 1)

The selected local image is read into a browser canvas at width 512, with aspect ratio preserved and height rounded to an integer (minimum 8). The full raster, including labels, is processed; it is not interpreted as a temperature field. It is partitioned spatially into 64 columns and 8 horizontal bands.

For every pixel, retain only alpha >=128, maximum RGB >=45, and RGB spread >=25. A red pixel requires R > 1.12G and R > 1.08B. Otherwise a blue pixel requires B > 1.12R and B > 1.02G. Other pixels contribute no voice. Divide retained counts by all pixels in the cell to obtain fractions. If the image cannot load, canvas access fails, or no features survive, block playback with an error. Never generate a substitute score.

Scan left-to-right at 0.22 seconds per column, 14.08 seconds total. Red fractions activate triangle waves and blue fractions activate sine waves. Both use the same top-to-bottom pitch palette: 659.255, 587.330, 493.883, 440, 391.995, 329.628, 293.665 and 246.942 Hz. Each oscillator's envelope peak is 0.035 × sqrt(fraction), followed by the user-controlled master gain (default 0.35). Short attacks/releases soften edges; a pentatonic voicing makes simultaneous bands easier to hear. These are authored design choices, not NASA thresholds or measured climate frequencies.

The instrument exposes the selected column's actual fractions in a keyboard-accessible table. The overlay and scheduler use the same audio clock. Changing source, changing column, navigating away or stopping cancels scheduled sound. A hidden tab pauses sound; resume repeats the selected column. Loading/resume cancellation uses a generation token. No sound starts automatically.

This is a spatial scan, not chronological playback: x-position in a spiral is not a year. Rendered colors, JPEG compression, resize interpolation and matching labels influence the score. No temperatures, causal claims, physical thresholds or new observations are recovered from pixels. Red/blue are pixel classes, not scientific labels in arbitrary imagery.

## Numerical sonification remains distinct

The following comparison uses the existing pinned NASA GISTEMP annual measurements and fixed annual frequency mapping. It never passes pixel features off as anomaly records. The distinct instrument and handoff are explicitly explained. The original monthly endpoint route remains available and keeps its historical revision disclosure. No CSV values were changed by the story implementation.

## Validation limits

Automated tests cover color fractions, rejected blank inputs, browser playback lifecycle, chapter traversal, image failure, keyboard access, reduced motion and accessibility checks. They do not establish educational efficacy or usability for every hearing/vision profile. Real listening, assistive-technology feedback, Arabic educator review and eligibility decisions remain human work. This continues to be a rehearsal build, not a guarantee of an award or competition eligibility.

## Focused UX polish

The guided journey now uses a compact layout with a persistent Back/Next dock. Short exit and entrance transitions connect chapters; tool routes and lesson stages have their own entrance transitions. The chapter heading receives focus after navigation. Primary controls are kept in the main screen; detailed image methodology, annual chart evidence and the full 30-year discovery table open in native dialogs. Dialogs support Escape, contain keyboard focus and explicitly restore the triggering control on close, including Safari. Detail views preserve all source material; nothing was replaced with invented summaries.

The guided comparison replaces listening controls with its computed reveal rather than appending an additional page below them. Small-screen controls keep the play/pause actions and settings together. The standalone NASA Jukebox switches between image-derived sound and dated numerical measurements instead of stacking both instruments. A contextual navigation strip connects standalone tools to the next relevant concept. The lesson has explicit Previous/Next steps. Presenter exploration moves its optional deeper question into a detail view.

Decorative Earth entrance motion is separate from scientific information. The eight live color-density indicators use the current image column’s actual computed fractions. They are not synthetic audio bars or a temperature trend. Reduced-motion preferences disable chapter, route, modal, Earth and density-indicator motion. No scroll is locked: small windows, large text and long optional details remain naturally scrollable.
