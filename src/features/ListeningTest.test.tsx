import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ListeningTest } from "./ListeningTest";
import { AudioProvider } from "../hooks/useAudioEngine";
import { createAttempt, signed } from "../data/climate-loader";
function setup() {
  vi.spyOn(Math, "random").mockReturnValue(0);
  render(
    <AudioProvider>
      <ListeningTest />
    </AudioProvider>,
  );
}
describe("blind comparison to scientific reveal", () => {
  it("hides dates until explicit submission, then reveals computed values and correct answer", () => {
    setup();
    expect(screen.queryByText(/1961/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reveal the Science" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Sound B" }));
    expect(screen.queryByText(/1961/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reveal the Science" }));
    expect(screen.getByText("You heard the difference.")).toHaveFocus();
    expect(screen.getAllByText(/1961–1990/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1991–2020/).length).toBeGreaterThan(0);
    const attempt = createAttempt(0, () => 0);
    expect(
      screen.getByText(
        `${Math.abs(attempt.B.mean - attempt.A.mean).toFixed(3)} °C higher`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        new RegExp(signed(attempt.A.mean, 3).replace("+", "\\+")),
      ).length,
    ).toBeGreaterThan(0);
  });
  it("accepts uncertainty neutrally and resets to a new blind attempt", () => {
    setup();
    fireEvent.click(screen.getByRole("radio", { name: "I couldn’t tell" }));
    fireEvent.click(screen.getByRole("button", { name: "Reveal the Science" }));
    expect(
      screen.getByText("Uncertainty is part of discovery."),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Try Another Comparison" }),
    );
    expect(
      screen.getByRole("button", { name: "Reveal the Science" }),
    ).toBeDisabled();
    expect(screen.queryByText(/1881–1910/)).not.toBeInTheDocument();
  });
});
