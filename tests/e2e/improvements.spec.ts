import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import monthly from "../../src/data/monthly.json" with { type: "json" };

test("NASA snapshots use matching dates, monthly measurements and preserved playback settings", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#frames");
  await expect(
    page.getByRole("button", { name: "Play snapshots", exact: true }),
  ).toBeEnabled();
  await expect(page.getByTestId("frame-date")).toHaveText("July 2023");
  const record = monthly.records.find((r) => r.year === 2023 && r.month === 7)!;
  await expect(page.getByTestId("frame-anomaly")).toHaveText(
    `+${record.anomalyC.toFixed(2)} °C`,
  );
  const hz =
    220 *
    3 **
      ((record.anomalyC - monthly.domain.min) /
        (monthly.domain.max - monthly.domain.min));
  await expect(page.getByTestId("frame-frequency")).toHaveText(
    `${hz.toFixed(1)} Hz`,
  );
  await page
    .getByRole("button", { name: "Hear this month", exact: true })
    .click();
  await expect(page.getByText(/^Audio (playing|completed)$/)).toBeAttached();
  await page.getByRole("button", { name: "August 2023", exact: true }).click();
  await expect(page.getByTestId("frame-date")).toHaveText("August 2023");
  await page.getByRole("button", { name: "Replay NASA snapshots" }).click();
  await expect(page.getByTestId("frame-date")).toHaveText("July 2023");
  await expect(page.getByTestId("frame-date")).toHaveText("August 2023");
  await page
    .getByRole("button", { name: "Pause snapshots", exact: true })
    .click();
  await page.getByLabel("Playback speed").selectOption("0.5");
  const frozen = await page.getByTestId("frame-date").textContent();
  await page.waitForTimeout(450);
  await expect(page.getByTestId("frame-date")).toHaveText(frozen!);
  await page
    .getByRole("button", { name: "Resume snapshots", exact: true })
    .click();
  await expect(page.getByTestId("frame-date")).toHaveText("May 2024");
  await page.getByRole("button", { name: "Stop NASA snapshots" }).click();
  await expect(page.getByTestId("frame-date")).toHaveText("July 2023");
  await page
    .getByText("Audit the frame-to-data binding", { exact: true })
    .click();
  await expect(
    page.getByText("The source describes the Celsius climate spiral", {
      exact: false,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("volunteer workflow records only consented local responses and exports the actual session", async ({
  page,
}) => {
  await page.goto("/#study");
  await expect(
    page.getByText("No completed sessions are saved in this browser.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Begin baseline questions" }),
  ).toBeDisabled();
  await page.getByLabel("Audio setup").selectOption("no-audio");
  await page.getByRole("checkbox", { name: /The volunteer agrees/ }).check();
  await page.getByRole("button", { name: "Begin baseline questions" }).click();
  await page
    .getByRole("radio", { name: "Earth’s absolute temperature", exact: true })
    .check();
  await page
    .getByRole("radio", { name: "A louder sound", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Continue to the listening test" })
    .click();
  await expect(
    page.getByRole("button", { name: "Play Sound A", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("radio", { name: "I couldn’t tell", exact: true })
    .check();
  await page.getByRole("button", { name: "Reveal the Science" }).click();
  await page.getByRole("button", { name: "Continue to follow-up" }).click();
  await page
    .getByRole("radio", {
      name: "A difference from a reference-period average",
      exact: true,
    })
    .check();
  await page
    .getByRole("radio", {
      name: "A higher global temperature anomaly",
      exact: true,
    })
    .check();
  await page
    .getByLabel("Observer notes", { exact: false })
    .fill("Synthetic browser test; not a human participant.");
  await page.getByRole("button", { name: "Save anonymous session" }).click();
  await expect(
    page.getByRole("heading", { name: "One observation, recorded honestly." }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("echo-earth-study-v1")!),
  );
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({
    device: "no-audio",
    pre: { anomaly: "absolute", pitch: "volume" },
    post: { anomaly: "baseline", pitch: "warmer" },
    listening: {
      answer: "uncertain",
      correct: null,
      completedSequences: { A: false, B: false },
    },
  });
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download this session" }).click();
  const download = await downloadEvent;
  const report = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(report.records).toEqual(stored);
  expect(report.summary).toMatchObject({
    sessions: 1,
    preCorrect: 0,
    postCorrect: 2,
    questionResponses: 2,
    uncertain: 1,
  });
  await page.getByRole("button", { name: "New participant" }).click();
  await page.getByRole("checkbox", { name: /The volunteer agrees/ }).check();
  await page.getByRole("button", { name: "Begin baseline questions" }).click();
  await page
    .getByRole("button", { name: "Stop and discard unfinished session" })
    .click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("echo-earth-study-v1")!).length,
    ),
  ).toBe(1);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Export all local results" }),
  ).toBeVisible();
});

test("presenter rehearsal guides the real comparison and resets its timer", async ({
  page,
}) => {
  await page.goto("/#present");
  await expect(
    page.getByRole("timer", { name: "Demo elapsed time" }),
  ).toHaveText("00:00");
  await page
    .getByRole("button", { name: "Start demo timer", exact: true })
    .click();
  await expect(page.getByRole("timer")).not.toHaveText("00:00");
  await page
    .getByRole("button", { name: "Begin the comparison", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Next stage", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("radio", { name: "I couldn’t tell", exact: true })
    .check();
  await page.getByRole("button", { name: "Reveal the Science" }).click();
  await expect(
    page.getByRole("heading", { name: "Reveal the evidence", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Computed mean difference:/)).toBeVisible();
  await page.getByRole("button", { name: "Next stage", exact: true }).click();
  await expect(page.getByTestId("frame-date")).toBeVisible();
  await page
    .getByRole("button", { name: "Explore the cooler-year discovery" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Can a warming climate still contain cooler years?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();
  await page.getByRole("button", { name: "Next stage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Show the evidence from real users." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next stage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A lesson ready to try." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause timer", exact: true }).click();
  const frozen = await page.getByRole("timer").textContent();
  await page.waitForTimeout(350);
  await expect(page.getByRole("timer")).toHaveText(frozen!);
  await page
    .getByRole("button", { name: "Restart rehearsal", exact: true })
    .click();
  await expect(page.getByRole("timer")).toHaveText("00:00");
  await expect(
    page.getByRole("heading", { name: "Invite a discovery", exact: true }),
  ).toBeVisible();
});

test("new experiences pass accessibility and fit narrow phones and enlarged text", async ({
  page,
}, info) => {
  for (const route of ["frames", "study", "present"]) {
    await page.goto("/#" + route);
    await page.getByRole("heading", { level: 1 }).waitFor();
    if (route === "frames")
      await expect(
        page.getByRole("button", { name: "Play snapshots", exact: true }),
      ).toBeEnabled();
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/screenshots/${info.project.name}-${route}.png`,
      fullPage: true,
    });
  }
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["frames", "study", "present"]) {
      await page.goto("/#" + route);
      await page.getByRole("heading", { level: 1 }).waitFor();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.locator("html").evaluate((el) => {
    el.style.fontSize = "200%";
  });
  for (const route of ["frames", "study", "present"]) {
    await page.goto("/#" + route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${route} at 200%`,
    ).toBe(true);
  }
});

test("corrupted saved study data is reported without being overwritten", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("echo-earth-study-v1", "invalid-json-fixture");
  });
  await page.goto("/#study");
  await expect(page.getByRole("alert")).toContainText(
    "Saved study results could not be read",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("echo-earth-study-v1")),
  ).toBe("invalid-json-fixture");
});

test("missing NASA imagery blocks paired playback and can be retried", async ({
  page,
}) => {
  await page.route("**/nasa/monthly/2023-08.jpg", (route) => route.abort());
  await page.goto("/#frames");
  await expect(
    page.getByRole("alert").filter({ hasText: "NASA stills could not load" }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Play snapshots", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText(/^Audio playing$/)).toHaveCount(0);
  await page.unroute("**/nasa/monthly/2023-08.jpg");
  await page.getByRole("button", { name: "Retry NASA images" }).click();
  await expect(
    page.getByRole("button", { name: "Play snapshots", exact: true }),
  ).toBeEnabled();
});
