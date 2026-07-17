import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReplayRail } from "./ReplayRail.jsx";

const cluster = {
  coverage: 40,
  projectedCoverage: 85,
  projectedAnswerable: 3,
  ticketCount: 4,
};

describe("ReplayRail", () => {
  it("labels precomputed sample projections without inventing a count", () => {
    render(<ReplayRail cluster={cluster} replay={null} />);
    expect(screen.getByText("Before").nextElementSibling).toHaveTextContent("40%");
    expect(screen.getByText("Projected").nextElementSibling).toHaveTextContent("85%");
    expect(screen.getByText("3 of 4 questions become answerable")).toBeInTheDocument();
  });

  it("prefers measured replay results", () => {
    render(<ReplayRail cluster={cluster} replay={{ beforeCoverage: 38, afterCoverage: 75, answerableAfter: 2 }} />);
    expect(screen.getByText("2 of 4 questions become answerable")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});
