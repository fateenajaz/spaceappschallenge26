# ECHO EARTH — Demo Storyboard & Recording Guide

Owner: **Vishal** (Testing, Documentation, Demo & Submission Support)  
References: `ECHO EARTH.pdf` §16 (30-second concept), `docs/demo.md` (2-minute `/#present` rehearsal)

> **Critical Audio Rule:** The project’s tones generated from NASA source material **must be clearly audible** in the recording. Do not drown them out with narration or background music.

---

## 1. 30-Second Submission Demo Storyboard

*(Verify official 2026 Space Apps video length limits before final export; adapt pacing if 30s vs 60s/2m is required.)*

| Time | Visual on Screen | Audio / Sound | Voiceover / Caption |
| --- | --- | --- | --- |
| **0:00 – 0:05** | ECHO EARTH Introduction screen | Silence / clean entry | *"Climate data is everywhere. But what if we could hear it?"* |
| **0:05 – 0:12** | Blind Listening Test: Audio Card A & Card B | **Use clearly labeled 2–3s excerpts of each real period**; full comparisons take about 9 seconds per period at normal speed | *"ECHO EARTH turns real NASA temperature observations into sound."* |
| **0:12 – 0:20** | Select an answer → Submit → **Scientific Reveal** appears with period dates & mean anomalies | Brief pause for clarity | *"Visitors hear the data first, then discover what it tells us about Earth's changing climate."* |
| **0:20 – 0:27** | **NASA image instrument** scanning an inspected SVS 5161 or SVS 5311 image | **Play a short excerpt of the actual image-derived sound**, synchronized to the spatial scan | *"Explore the image as sound, then inspect the measurements behind the science."* |
| **0:27 – 0:30** | End card / project title | Clean fade | *"ECHO EARTH — Hear what the planet is telling us."* |

---

## 2. Live 2-Minute Pitch Flow (`/#present`)

Use the built-in presenter mode at `/#present` (6 stage budgets totaling 120 seconds, documented in `docs/demo.md`):

1. **0:00–0:15:** Explain that higher pitch = higher temperature anomaly; ask judges to predict.
2. **0:15–0:40:** Play Period A and Period B; take the judge's vote (or "I couldn't tell").
3. **0:40–1:05:** Reveal the real dates, computed means, difference, and 1951–1980 baseline.
4. **1:05–1:30:** Show the NASA snapshots (`/#frames`), play one month, and explain the pairing.
5. **1:30–1:50:** Share **actual** pilot observations from `docs/pilot-report.md` (if not yet run, state so honestly).
6. **1:50–2:00:** Show the classroom lesson / printable guide and close.

---

## 3. Recording Checklist (Before & After Capture)

- [ ] **Clean browser window:** Close extra tabs, hide bookmarks bar, disable notifications ("Do Not Disturb").
- [ ] **Resolution:** Record at 1920×1080 (16:9) with readable zoom (`100%` or `110%`).
- [ ] **Audio routing:** Capture system audio cleanly so the Web Audio sine tones are crisp and louder than background noise; pause narration while tones play.
- [ ] **Real data only:** Use the production/final build (`npm run build && npm run preview` or final Vercel URL) — never mock screens.
- [ ] **Post-export check:** Watch the exported `.mp4` with headphones and laptop speakers to verify sync, legibility, and audio clarity.

The image instrument translates rendered pixels artistically; the annual comparison translates numerical anomalies. Explain this distinction and do not imply that spatial scan position is a date or that image-derived notes are recovered temperatures. Preserve credits and development provenance in the submission.
