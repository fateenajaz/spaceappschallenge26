import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import data from "../../src/data/climate.json" with { type: "json" };
test("listen, pause, reveal, explore, and inspect the mapping", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Go directly to the listening test" }).click();
  await expect(
    page.getByRole("heading", { name: "Listen before you look." }),
  ).toBeVisible();
  await expect(page.getByText("1961–1990", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Play Sound A", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Play Sound B", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Stop Sound B" }).click();
  await page.getByRole("radio", { name: "I couldn’t tell" }).check();
  await page.getByRole("button", { name: "Reveal the Science" }).click();
  await expect(
    page.getByRole("heading", { name: "Uncertainty is part of discovery." }),
  ).toBeFocused();
  await expect(
    page.getByText("Sound A ·", { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore 140+ Years" }).click();
  await expect(page.getByTestId("active-year")).toHaveText("1880");
  await page.getByRole("button", { name: "Next year" }).click();
  await expect(page.getByTestId("active-year")).toHaveText("1881");
  await page.getByRole("slider", { name: "Select a year" }).fill("120");
  await expect(page.getByTestId("active-year")).toHaveText("2000");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      Number(await page.getByTestId("active-year").textContent()),
    )
    .toBeGreaterThan(2000);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const frozen = await page.getByTestId("active-year").textContent();
  await page.waitForTimeout(400);
  await expect(page.getByTestId("active-year")).toHaveText(frozen!);
  await page.getByLabel("Playback speed").selectOption("2");
  await page.getByRole("button", { name: "Mute audio", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unmute audio", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Volume", { exact: true }).fill("0.25");
  await page.getByRole("button", { name: "Unmute audio", exact: true }).click();
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(page.getByTestId("active-year")).toHaveText("1880");
  await page
    .getByRole("button", { name: "Stop playback", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Sound Laboratory", exact: true })
    .click();
  await page.getByLabel("Select year", { exact: true }).selectOption("144");
  const r = data.records[144],
    minimum = Math.min(...data.records.map((r) => r.anomalyC)),
    maximum = Math.max(...data.records.map((r) => r.anomalyC));
  const f = 220 * 3 ** ((r.anomalyC - minimum) / (maximum - minimum));
  await expect(
    page.getByText(`${f.toFixed(3)} Hz`, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Play measurement", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    /Audio (playing|completed)/,
  );
  expect(errors).toEqual([]);
});
test("keyboard, accessibility, mobile sizing and local media", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByText("Skip to content", { exact: true }),
  ).toBeFocused();
  for (const route of ["listen", "explorer", "lab", "science"]) {
    await page.goto(`/#${route}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/#explorer");
  const img = page.locator('img[src="/nasa/climate-spiral.jpg"]');
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "View NASA animation" }).click();
  await expect(page.locator("video")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThan(0);
});

test("captures the rendered layouts at desktop and narrow sizes", async ({
  page,
}, info) => {
  for (const route of ["home", "listen", "explorer", "lab"]) {
    await page.goto(`/#${route}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `test-results/screenshots/${info.project.name}-${route}.png`,
      fullPage: true,
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["home", "listen", "explorer", "lab", "science"]) {
      await page.goto(`/#${route}`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `No overflow on ${route} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.locator("html").evaluate((el) => {
    el.style.fontSize = "200%";
  });
  for (const route of ["home", "listen", "explorer", "lab", "science"]) {
    await page.goto(`/#${route}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `No overflow on ${route} at 200% text`,
    ).toBe(true);
  }
});

test("real Web Audio signal contains the mapped fundamental", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium" || Boolean(process.env.ECHO_BASE_URL),
    "Source-instrumented signal analysis runs in local Chromium; UI audio activation is checked in all projects.",
  );
  await page.goto("/#lab");
  await page
    .getByRole("button", { name: "Play measurement", exact: true })
    .click();
  const record = data.records[120];
  const d = {
    min: Math.min(...data.records.map((r) => r.anomalyC)),
    max: Math.max(...data.records.map((r) => r.anomalyC)),
  };
  const signal = await page.evaluate(
    async ({ record, domain }) => {
      const modulePath = "/src/audio/engine.ts";
      const { AudioEngine } = await import(/* @vite-ignore */ modulePath);
      let context: AudioContext | undefined, analyser: AnalyserNode | undefined;
      const engine = new AudioEngine(domain, {
        context: () => {
          context = new AudioContext();
          analyser = context.createAnalyser();
          analyser.fftSize = 8192;
          const createGain = context.createGain.bind(context);
          let first = true;
          context.createGain = () => {
            const node = createGain();
            if (first) {
              first = false;
              node.connect(analyser!);
            }
            return node;
          };
          return context;
        },
        requestFrame: (fn: FrameRequestCallback) => requestAnimationFrame(fn),
        cancelFrame: (id: number) => cancelAnimationFrame(id),
      });
      await engine.play(Array(5).fill(record), "signal-check");
      await new Promise((resolve) => setTimeout(resolve, 120));
      const fft = new Float32Array(analyser!.frequencyBinCount);
      analyser!.getFloatFrequencyData(fft);
      let peak = 0;
      for (let i = 1; i < fft.length; i++) if (fft[i] > fft[peak]) peak = i;
      const waveform = new Float32Array(analyser!.fftSize);
      analyser!.getFloatTimeDomainData(waveform);
      const result = {
        frequency: (peak * context!.sampleRate) / analyser!.fftSize,
        resolution: context!.sampleRate / analyser!.fftSize,
        rms: Math.sqrt(
          waveform.reduce((s, v) => s + v * v, 0) / waveform.length,
        ),
        state: engine.getSnapshot().state,
      };
      engine.dispose();
      return result;
    },
    { record, domain: d },
  );
  expect(signal.state).toBe("playing");
  expect(signal.rms).toBeGreaterThan(0.001);
  const expected = 220 * 3 ** ((record.anomalyC - d.min) / (d.max - d.min));
  expect(Math.abs(signal.frequency - expected)).toBeLessThan(
    signal.resolution * 2,
  );
});

test("live visuals follow audio, mute, pause and motion preferences", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#explorer");
  const visual = page.locator('.audio-visual[data-sequence="explorer"]');
  const level = async () =>
    Number(await visual.getAttribute("data-signal-level"));
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect.poll(level).toBeGreaterThan(0.001);
  await page.getByRole("button", { name: "Mute audio", exact: true }).click();
  await expect.poll(level).toBe(0);
  await page.getByRole("button", { name: "Unmute audio", exact: true }).click();
  await expect.poll(level).toBeGreaterThan(0.001);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(visual).toHaveAttribute("data-reduced-motion", "true");
  await expect.poll(level).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(level).toBeGreaterThan(0.001);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect.poll(level).toBe(0);
});
