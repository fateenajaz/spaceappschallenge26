# Accessibility

Implemented: semantic navigation and landmarks, a visible-on-focus skip link, native buttons/radio groups/selects/range inputs, persistent labels, visible keyboard focus, an explicit submit action, focus moved to the result heading after reveal, status/error announcements, responsive controls, reduced-motion styles, SVG descriptions and scrollable numerical tables.

The blind test does not expose dates or measurement values through its labels, progress or accessibility descriptions. It permits “I couldn't tell” without penalty. The science, explorer and original data remain available to people who cannot hear the tones. Selected values are labeled, and color is not the only cue. Rapidly changing notes are not announced every 300 ms; the global live region announces playback states.

The laboratory's horizontally scrollable exact formula and chart tables are focusable regions. Mobile layouts stack controls and preserve touch interaction. Playwright checks narrow iPhone-sized, tablet-sized and desktop layouts, reduced motion and 200% text sizing, alongside axe checks on the main routes.

Limitations: automated checks and WebKit device emulation do not establish WCAG conformance, actual iOS Safari behavior, or screen-reader usability. Team members should test VoiceOver/Safari, NVDA/Firefox or equivalent, keyboard-only operation on real devices, magnification, hearing differences and low-vision use before submission. No compliance certification is claimed.

Manual protocol: navigate from the skip link; complete the comparison with only a keyboard; confirm reveal focus and neutral uncertainty response; inspect numerical tables; adjust/seek playback; use every control at 200% zoom; repeat with reduced motion and a screen reader. Record actual issues and observations, never fabricated results.

The rehearsal update adds consent-gated and optional no-audio study participation, phase-heading focus, explicit discard of unfinished sessions, native questionnaire radio groups, visible storage errors, a presenter timer with `aria-live="off"`, stage focus, unique per-control volume IDs for embedded experiences, and keyboard-accessible frame selection. Automated checks now also cover the NASA Jukebox, study and presenter routes. This remains automated evidence, not a substitute for actual screen-reader and access-needs testing.

The November redesign replaces decorative eyebrow headings with direct page headings. Live signal canvases are hidden from assistive technology inside labeled figures; numerical measurements and playback status remain available as text. Reduced-motion preference renders a static signal and updates immediately if changed during playback.
