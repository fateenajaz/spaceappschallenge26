# Sonification and playback

The pure mapping lives in `src/audio/mappings.ts`. For domain [−0.48, +1.28] °C from the complete pinned record, normalize linearly to [0,1] then map exponentially to 220–660 Hz. Both boundaries are audio design choices. The fixed domain is shared by the test, annual explorer and laboratory. Invalid values, degenerate domains and excursions beyond the domain throw; a new snapshot deliberately establishes a new global mapping.

A higher anomaly produces a strictly higher sine frequency. Equal anomaly increments produce equal frequency ratios. Exponentiation is nonlinear: an average frequency is not the frequency of the average anomaly. Comparison results are calculated directly from observations.

Normal playback assigns 300 ms to each annual record, about nine seconds for thirty observations. Slow and fast multiply rate by 0.5 and 2. Master volume/mute apply globally; there is no temperature-dependent amplitude, musical quantization, background track or summary tone. Each oscillator uses modest attack/release envelopes and a maximum note gain of 0.2 before master gain, keeping headroom.

`AudioEngine` maintains idle/loading/playing/paused/stopped/completed/error states. Context creation/resume occurs from a playback gesture. A generation token cancels stale asynchronous startup. The audio clock determines logical progress; requestAnimationFrame renders it and queues roughly 120 ms of future notes. Late frames skip expired notes. Only one sequence owns the graph. Pause stores fractional position, resume rebuilds remaining events, speed changes rebuild future scheduling, and all live nodes are stopped/disconnected on seek, stop, replacement or disposal. Master gain changes are smoothed.

The app stops audio on route changes and pauses when hidden. The NASA video has a separate, labeled monthly timeline. It pauses annual audio when opened or played. Scheduling/display synchronization is at annual record boundaries against AudioContext time, not a claim of sample-perfect visual or physical-speaker latency compensation.

Browser tests check gesture activation and lifecycle. Chromium signal analysis checks nonzero rendered samples and the peak frequency against the formula at FFT resolution. Human listening for comfort, device acoustics and pitch discriminability remains unverified until team review.

The new NASA Jukebox uses three documented monthly endpoints and a separate domain derived from all 1,752 retained monthly records (−0.81 to +1.48 °C). It uses the same monotonic exponential formula and one shared engine, with explicit per-sequence domain and 1.2-second event settings. Resume/replay/seek preserve those settings. An annual playback command restores the annual mapping and 300 ms events. Pitches across the annual and monthly domains are not directly comparable. The two-period blind comparison always uses one shared annual domain.

## Live audio visualization

An AnalyserNode after the master gain reads 1024 time-domain samples. Canvas waveforms and RMS-driven rings reflect this measured signal, including volume and mute. Blind A/B panels use only RMS amplitude until reveal; they do not encode frequency, date or anomaly. Motion stops on pause, route unmount and reduced-motion preference. The Blue Marble behind the signal is illustrative context rather than a selected-year climate frame.
