import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
vi.mock("../components/Player", () => ({
  PlayButton: () => <button>Listen</button>,
}));
import { Discovery, coolerSteps, decadeDifference } from "./Discovery";
describe("climate discovery", () => {
  it("uses actual cooler steps within a rising decade comparison", () => {
    expect(coolerSteps.length).toBeGreaterThan(0);
    expect(decadeDifference).toBeGreaterThan(0);
    coolerSteps.forEach(({ from, to }) => {
      expect(to.year).toBe(from.year + 1);
      expect(to.anomalyC).toBeLessThan(from.anomalyC);
    });
  });
  it("requires a prediction and allows uncertainty before revealing evidence", () => {
    render(<Discovery />);
    expect(
      screen.getByRole("button", { name: "Reveal the evidence" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByLabelText("I’m unsure"));
    fireEvent.click(
      screen.getByRole("button", { name: "Reveal the evidence" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      `${coolerSteps.length} downward`,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: coolerSteps[0].to.year },
    });
    expect(
      screen.getByText(new RegExp(`${coolerSteps[0].from.year}:`)),
    ).toBeInTheDocument();
  });
});
