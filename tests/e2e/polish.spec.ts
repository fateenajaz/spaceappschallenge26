import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("focused journey keeps controls nearby and details preserve keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const name of [
    "02 A visual language",
    "03 An audible image",
    "04 Your discovery",
    "05 The bigger picture",
    "06 Keep listening",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".scene-leaving")).toHaveCount(0);
    const next = page.locator(".journey-dock .button.primary");
    await expect(next).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight + 2,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "03 An audible image", exact: true })
    .click();
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
