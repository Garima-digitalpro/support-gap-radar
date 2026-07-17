import { describe, expect, it } from "vitest";
import { parseTicketsCsvText } from "./fileParsers.js";

describe("ticket CSV parsing", () => {
  it("accepts common customer-support export headings", () => {
    const tickets = parseTicketsCsvText([
      "case-id,title,message,final-reply,severity",
      "C-1,Refund timing,When will my refund arrive?,Within five days,high",
      "C-2,Cancel plan,How do I cancel?,Open billing settings,normal",
    ].join("\n"));

    expect(tickets).toHaveLength(2);
    expect(tickets[0]).toMatchObject({
      id: "C-1",
      subject: "Refund timing",
      resolution: "Within five days",
      priority: "high",
    });
  });

  it("explains which row is missing a customer question", () => {
    expect(() => parseTicketsCsvText("id,subject,description\n1,Empty,"))
      .toThrow("Ticket row 2 needs a description");
  });
});
