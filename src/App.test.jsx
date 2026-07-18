import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { postJson } from "./lib/api.js";

vi.mock("./lib/api.js", () => ({ postJson: vi.fn() }));

describe("verified demo cluster drafting", () => {
  beforeEach(() => {
    postJson.mockReset();
  });

  afterEach(cleanup);

  it.each([
    ["Seat changes, 4 tickets, 25% missing", "Manage paid seats and recover workspace ownership"],
    ["Invoice corrections, 5 tickets, 0% missing", "Update billing details and correct invoices"],
    ["SSO setup, 5 tickets, 0% missing", "Configure and maintain SAML SSO"],
  ])("opens the bundled draft for %s without an API request", (clusterName, draftTitle) => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: clusterName }));
    fireEvent.click(screen.getByRole("button", { name: "Draft evidence-grounded patch" }));

    expect(screen.getByRole("dialog", { name: draftTitle })).toBeInTheDocument();
    expect(postJson).not.toHaveBeenCalled();
  });

  it("clears a failed replay error when the user selects another cluster", async () => {
    postJson.mockRejectedValueOnce(new Error("Replay failed"));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Draft evidence-grounded patch" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Proposed documentation Markdown" }), {
      target: { value: "# Edited refund patch" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replay 14 questions" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Replay failed");
    fireEvent.click(screen.getByRole("button", { name: "Close article workbench" }));
    fireEvent.click(screen.getByRole("button", { name: "Seat changes, 4 tickets, 25% missing" }));

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});
