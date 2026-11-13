# ECHO EARTH — QA & Submission Readiness Checklist

Owner: **Vishal** (Testing, Documentation, Demo & Submission Support)  
Reference: `docs/verification.md`, `docs/accessibility.md`, `docs/team.md`

---

## 1. Automated Gate (Run after every team merge/PR)

```sh
npm test
npm run build
npm run test:e2e
```

- [ ] `npm test` — all Vitest unit/component tests pass.
- [ ] `npm run build` — `tsc --noEmit` and Vite production bundle succeed with 0 errors.
- [ ] `npm run test:e2e` — Playwright + `axe-core` checks pass across Chromium, WebKit, and mobile.

---

## 2. Real Audio & Listening QA (Manual — Speakers & Headphones)

Automated checks only verify FFT/PCM buffers. Verify with real speakers and headphones:

- [ ] **No autoplay:** Audio only starts after an explicit Play click/tap.
- [ ] **Clean envelopes:** No harsh clicks/pops between notes; initial volume is conservative.
- [ ] **Single active playback:** Starting B stops A; Pause, Stop, and route changes immediately silence all oscillators.
- [ ] **Clear pitch difference:** Period A vs Period B are audibly distinct, and the warmer period is genuinely higher-pitched.
- [ ] **Controls:** Mute, volume slider, playback speed, and Replay respond immediately.

---

## 3. Physical Device & Browser Matrix

| Device / OS | Browser | Audio Unlocks on Tap/Click | Layout Clean (No Overflow) | Full Flow Passes | Notes |
| --- | --- | --- | --- | --- | --- |
| macOS (local) | Chrome | [ ] | [ ] | [ ] | |
| macOS (local) | Safari | [ ] | [ ] | [ ] | |
| iPhone / iPad | Safari | [ ] | [ ] | [ ] | |
| Android phone | Chrome | [ ] | [ ] | [ ] | |

---

## 4. Keyboard & Accessibility Spot Check

- [ ] **Keyboard-only flow:** Complete `Intro` -> `Blind Test` -> `Reveal` -> `Explorer` -> `Lab` using only `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- [ ] **No blind-test spoilers:** Before submitting, confirm period years/dates are not leaked in labels, tooltips, or screen-reader text.
- [ ] **VoiceOver check (`Cmd+F5` on macOS):** Confirm buttons, live status updates, and the reveal heading are announced clearly.

---

## 5. Scientific & Submission Readiness

- [ ] **Data & baseline:** 1951–1980 reference period, °C units, and 2026 exclusion are clearly explained.
- [ ] **NASA credits:** NASA GISTEMP v4 and NASA SVS Climate Spiral (Mark SubbaRao & Ed Hawkins) are visibly credited.
- [ ] **No rehearsal placeholders:** Remove any `"Rehearsal build"` notices from UI and `README.md` before final submission.
- [ ] **Volunteer pilot (`/#study`):** Run 5–12 real sessions and record actual observations in `docs/pilot-report.md` (never mix synthetic test data).
- [ ] **AI disclosure:** Confirm `docs/ai-usage.md` reflects final work for NASA Space Apps rules.
- [ ] **Production URL check:** Open the final Vercel URL in an **incognito window on a second device** (no login/auth required, audio works, all links work), and run:

```sh
ECHO_BASE_URL=https://echo-earth-nasa-2026.vercel.app npm run test:e2e
```

---

## 6. Bug Log

| ID | Route / Feature | Device / Browser | Steps to Reproduce | Expected vs Actual | Severity | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | Open |
