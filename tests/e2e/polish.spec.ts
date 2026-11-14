import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("focused journey keeps controls nearby and details preserve keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".story-eyebrow, .story-kicker")).toHaveCount(0);
  await page.getByRole("button", { name: "Begin the journey" }).click();
  for (let step = 2; step <= 6; step++) {
    await expect(
      page.getByRole("progressbar", { name: "Journey progress" }),
    ).toHaveAttribute("aria-valuenow", String(step));
    await expect(
      page.locator(".journey-dock .button.primary"),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight + 2,
      ),
    ).toBe(true);
    if (step < 6)
      await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  for (let step = 5; step >= 3; step--) {
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(
      page.getByRole("progressbar", { name: "Journey progress" }),
    ).toHaveAttribute("aria-valuenow", String(step));
  }
  const details = page.getByRole("button", {
    name: "Why these sounds? Follow the translation.",
  });
  await details.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close details" }),
  ).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(details).toBeFocused();
});
test("the two jukebox methods replace each other and retain their explanation", async ({
  page,
}) => {
  await page.goto("/#frames");
  await expect(page.getByTestId("frame-date")).toBeVisible();
  await page.getByRole("button", { name: /Image → sound/ }).click();
  await expect(
    page.getByRole("button", { name: "Play the NASA image" }),
  ).toBeEnabled();
  await expect(page.getByTestId("frame-date")).toHaveCount(0);
  await page.getByRole("button", { name: /Measurement → pitch/ }).click();
  await expect(page.getByTestId("frame-date")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play the NASA image" }),
  ).toHaveCount(0);
});

test("secondary tools are available through one menu that closes after navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Additional experiences" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page
    .getByRole("link", { name: "Sound Laboratory", exact: true })
    .click();
  await expect(page).toHaveURL(/#lab$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue", exact: true }),
  ).toHaveAttribute("href", "#science");
});
