# ECHO EARTH — NASA Space Apps 2026 Submission Outline

Owner: **Vishal** (Testing, Documentation, Demo & Submission Support)  
Global Deadline: **Sunday, 15 November 2026, 11:59 PM UAE time** (confirm any earlier University of Dubai local presentation deadline)

---

## 1. Project Summary (Judge-Facing Description)

**Project Name:** ECHO EARTH — The Invisible Climate Test  
**Tagline:** *What if you could hear climate change before you could see it?*  
**Challenge:** The Earth Information Jukebox (NASA Space Apps Challenge 2026)  
**Team:** Fateen, Abdullah, Zayd, Yaser, Rayyan, Vishal (ACM Student Chapter × UOBRPL, University of Dubai)

**Short Description:**  
ECHO EARTH is an interactive "Earth Jukebox" and auditory climate laboratory that translates NASA Earth Information Center (EIC) visualizations and their underlying NASA GISTEMP v4 observations into dynamic, real-time sound. Instead of presenting climate data only as static charts or prerecorded music, ECHO EARTH pairs EIC visual frames with live Web Audio sonifications—balancing strict scientific data interpretation with accessible, engaging soundscapes. The guided journey introduces NASA imagery and an explicitly artistic pixel-to-sound instrument. Visitors can then take a blind A/B listening test to hear two 30-year climate periods and predict which was warmer, then reveal the actual NASA measurements, scientific explanation, and exact data-to-frequency mapping before exploring the 1880–2025 record and EIC frame sonifications themselves.

---

## 2. Alignment with the 5 NASA Judging Criteria

| Criterion | How ECHO EARTH Addresses It |
| --- | --- |
| **Impact** | Bridges the sight-only gap for Earth science by making global temperature patterns and EIC visuals interpretable through sound alongside numerical tables, supporting students, educators, museums, and low-vision exploration (with explicit limitations noted until tested with blind/low-vision users). |
| **Creativity** | Turns "translating sight into sound" into an interactive, testable blind A/B experiment (*hear the pattern before you see the chart*) plus real-time EIC frame sonification, rather than a passive soundtrack. |
| **Validity** | Uses validated NASA GISTEMP v4 annual `J-D` values and separately parsed monthly columns (1880–2025, 1951–1980 baseline, incomplete 2026 excluded) and a fixed, deterministic Web Audio frequency mapping that can be inspected year by year, while clearly distinguishing artistic pixel-to-sound modes from raw measurements. |
| **Relevance** | Addresses *The Earth Information Jukebox* through actual pixel-derived sound from inspected EIC-tagged SVS 5161 and SVS 5311 images, plus separately labeled numerical endpoint tones. SVS 5190 and Blue Marble provide credited visual context; neither is claimed to drive the image instrument. |
| **Presentation** | Built as a restrained, accessible scientific instrument with keyboard navigation, live status announcements, a 2-minute presenter mode (`/#present`), and a 30-second demo where the generated sound is clearly audible. |

---

## 3. Slides Outline (For Local / Judge Presentation)

1. **Title:** ECHO EARTH — *What if you could hear climate change before you could see it?* (Team & University of Dubai)
2. **The Problem:** Climate data relies heavily on visual charts; passive "data music" is hard to interpret scientifically.
3. **The Innovation (Live Demo / Blind Test):** Hear Period A vs Period B → Predict → Reveal the NASA measurements.
4. **How It's Real Science:** NASA GISTEMP v4 (`GLB.Ts+dSST.csv`, 1880–2025, 1951–1980 baseline) + deterministic Web Audio formula + NASA SVS 5190 Climate Spiral attribution.
5. **Accessibility & Pilot Findings:** Keyboard navigation, numerical alternatives, and *(insert only real pilot results from `docs/pilot-report.md`, or state if testing is in progress)*.
6. **Takeaway & Links:** Live URL, GitHub repo, and *"We aren't creating music about climate change — we're creating a new way to investigate climate data."*

---

## 4. Required Submission Assets & Links Check

Verify every item before submitting on the NASA Space Apps team page:

- [ ] **Live Web App URL (no login required, tested on 2nd device):** `https://echo-earth-nasa-2026.vercel.app` *(confirm final deployment URL)*
- [ ] **Public GitHub Repository URL:** `https://github.com/fateenajaz/spaceappschallenge26`
- [ ] **Demo Video (30-second / official 2026 limit):** `[INSERT FINAL VIDEO LINK / FILE]`
- [ ] **Screenshots:**
  - [ ] Introduction screen
  - [ ] Blind A/B Listening Test
  - [ ] Scientific Reveal + NASA Climate Spiral
  - [ ] Historical Climate Explorer / Sound Laboratory
- [ ] **Documentation & Provenance:**
  - [ ] `README.md` accurately identifies rehearsal/final status, with development timing retained and eligibility clarified by organizers
  - [ ] `docs/sources.md` (NASA GISTEMP v4 + SVS 5190 credits, Mark SubbaRao & Ed Hawkins)
  - [ ] `docs/ai-usage.md` (transparent AI-assistance disclosure)
  - [ ] `docs/pilot-report.md` (real volunteer observations only, or explicit note if none)
  - [ ] `docs/qa-checklist.md` signed off on final build
- [ ] **Official requirements verified:** The user supplied the challenge text; confirm it against the final official challenge/resources and submission instructions. Record the source and review date, verify video length/format limits, and resolve rehearsal reuse eligibility with organizers.
