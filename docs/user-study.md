# Facilitated volunteer study — rehearsal protocol 1.0.0

Open `/#study` in the application. This workflow is implemented and tested with explicitly synthetic browser fixtures. No human participant study has been conducted by the coding agent. The product starts with zero results and never includes seeded demonstration responses.

## Purpose

Observe whether people can use the controls, compare two climate periods, interpret the pitch mapping, and explain temperature anomalies after seeing the reveal. This is formative usability work, not an experiment establishing educational efficacy.

## Preparation and consent

Use volunteers who have not already explored the app. Start with a small convenience sample, for example 8–12 people, and include people with different access needs when they freely choose to participate. This number is a practical starting target, not a statistical power calculation or a participant count already collected. For school sessions, follow the institution's consent process. Do not collect names, email addresses, age, diagnoses, audio/video recordings or other identifying information.

Explain the purpose, what is stored, that uncertainty/no audio is acceptable, and that the participant can stop at any time. The facilitator confirms agreement before baseline questions are enabled. Results stay in the current browser's localStorage; no backend or analytics receives responses. Other people using that browser can see its results. Use a dedicated browser profile where appropriate and review exports before sharing.

Read exactly: “We are testing this experience, not you. You’ll answer two questions, compare two sounds if comfortable, see the underlying observations, and answer again. There is no penalty for uncertainty.”

## Session sequence

1. Choose headphones, speakers, or no audio. Use a comfortable volume and consistent hardware where practical. Confirm consent.
2. Have the participant answer two baseline questions about anomalies and higher pitch. Do not explain answers. The interface gives no baseline feedback.
3. Run the real blind A/B experience. Offer replay but do not coach the warmer-period choice. The same source records, random assignment, frequency mapping and controls as the public experience are used.
4. Have the participant submit an answer, including uncertainty if appropriate. Allow time to inspect the calculated periods, means, charts and explanation.
5. Ask the same two knowledge questions again, plus a self-report about whether hearing helped. Record observable hesitations, misconceptions and access barriers in the optional notes field, without personal or medical details.
6. Explicitly save the anonymous session. Nothing is saved automatically before completion. Stopping an unfinished session discards only its in-memory answers and audio, not previously saved results.
7. Start a new participant. Export all local results as JSON when needed. Review the raw observations and notes before drawing conclusions.

## Stored record

Versioned session ID, creation time, protocol version, dataset snapshot ID, raw baseline/follow-up answers, actual A/B period assignments and calculated means, comparison answer and computed outcome, software playback-completion flags, elapsed comparison time, audio setup, self-reported helpfulness and optional observer notes. No identity field is present. Uncertainty is stored as a neutral null outcome, not an incorrect answer.

Playback completion means the software reached the end; it does not prove the participant heard or attended to the sound. Timing describes the comparison screen, not the entire session. Corrupt storage is reported and is not silently overwritten. If saving fails, a completed session can be downloaded directly.

## Analysis and reporting

Use the dashboard's actual counts and denominators. Inspect baseline and follow-up responses, uncertain answers, comparison choices and observed control problems. Keep results from different protocol/data revisions distinguishable using the metadata in the export. Describe the sample, hardware, observer involvement and accessibility conditions without identifying people.

Repeated questions introduce practice effects. There is no randomized control group, the sample is voluntary, observers can influence responses, and self-reported helpfulness differs from measured comprehension. Do not say that a higher follow-up score proves the audio caused learning. Do not generalize findings to all students or blind/low-vision users. Report failures and unclear results as well as successes.

Suggested report wording, only after actual sessions: “In our convenience sample of [actual count], [observed count/denominator] answered the mapping question correctly after the experience. Participants reported [actual observations]. These formative results do not establish educational efficacy.” Do not fill these fields with invented numbers.
