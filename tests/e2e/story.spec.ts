import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("story connects NASA pixels, user-led sound, prediction and original measurements", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A planet worthlistening to.",
  );
  await page.getByRole("button", { name: "Begin the journey" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play the NASA image" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Play the NASA image" }).click();
  await expect(
    page.getByRole("button", { name: "Pause image sound" }),
  ).toBeVisible();
  await page.waitForTimeout(400);
  await expect
    .poll(async () =>
      Number(
        await page.getByRole("slider", { name: "Scan position" }).inputValue(),
      ),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pause image sound" }).click();
  const column = await page
    .getByRole("slider", { name: "Scan position" })
    .inputValue();
  await page.waitForTimeout(300);
  await expect(page.getByRole("slider", { name: "Scan position" })).toHaveValue(
    column,
  );
  await page.getByRole("button", { name: "Monthly record" }).click();
  await expect(
    page.getByRole("button", { name: "Play the NASA image" }),
  ).toBeEnabled();
  await page
    .getByText("Why these sounds? Follow the translation.", { exact: true })
    .click();
  await expect(page.getByText(/Analyzed raster:/)).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("radio", { name: "I couldn’t tell" }).check();
  await page.getByRole("button", { name: "Reveal the Science" }).click();
  await expect(
    page.getByText(/The two periods’ mean anomalies differ by/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("I’m unsure").check();
  await page.getByRole("button", { name: "Reveal the evidence" }).click();
  await expect(page.getByText(/There are \d+ downward/)).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Continue", exact: true }),
  ).toHaveAttribute("href", "#explorer");
  expect(errors).toEqual([]);
});
test("image failure blocks sound and reduced motion preserves chapter access", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/nasa/monthly/*", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Begin the journey" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play the NASA image" }),
  ).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText(/could not/);
  expect(
    await page
      .locator(".story-scene")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What can your ears",
  );
});

test("actual NASA pixel sound produces a signal and becomes silent when leaving the chapter", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Signal capture is checked in Chromium; UI playback is checked across browsers.",
  );
  await page.addInitScript(() => {
    const Base = window.AudioContext;
    window.AudioContext = class extends Base {
      constructor(options?: AudioContextOptions) {
        super(options);
        const analyser = this.createAnalyser();
        analyser.fftSize = 2048;
        const create = this.createGain.bind(this);
        let first = true;
        this.createGain = () => {
          const gain = create();
          if (first) {
            first = false;
            gain.connect(analyser);
          }
          return gain;
        };
        (window as unknown as { imageAnalyser: AnalyserNode }).imageAnalyser =
          analyser;
      }
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Begin the journey" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play the NASA image" }),
  ).toBeEnabled();
  await page.getByRole("slider", { name: "Scan position" }).fill("20");
  await page.getByRole("button", { name: "Play the NASA image" }).click();
  const rms = () =>
    page.evaluate(() => {
      const a = (window as unknown as { imageAnalyser: AnalyserNode })
        .imageAnalyser;
      const values = new Float32Array(a.fftSize);
      a.getFloatTimeDomainData(values);
      return Math.sqrt(
        values.reduce((sum, value) => sum + value * value, 0) / values.length,
      );
    });
  await expect.poll(rms).toBeGreaterThan(0.0001);
  await page.getByRole("button", { name: "Pause image sound" }).click();
  await expect.poll(rms).toBeLessThan(0.00001);
  await page.getByRole("button", { name: "Resume image sound" }).click();
  await expect.poll(rms).toBeGreaterThan(0.0001);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { imageAnalyser: AnalyserNode }).imageAnalyser
            .context.state,
      ),
    )
    .toBe("closed");
});
