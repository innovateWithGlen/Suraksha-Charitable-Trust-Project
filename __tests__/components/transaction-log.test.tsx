/**
 * Tests for the TransactionLog component.
 * Verifies rendering of pledge rows, expense rows, empty state, and bill links.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionLog } from "@/components/transactions/transaction-log";

const pledge = {
  id: "t1",
  type: "pledge" as const,
  date: "2025-03-01T00:00:00.000Z",
  entity: "Tata Consultancy Services",
  projectName: "Rural Health Camp",
  amount: 1000000,
  status: "confirmed",
};

const expense = {
  id: "t2",
  type: "expense" as const,
  date: "2025-03-10T00:00:00.000Z",
  entity: "Admin",
  projectName: "Rural Health Camp",
  amount: -25000,
  status: "logged",
  billDocumentUrl: "https://storage.example.com/bill.pdf",
};

describe("TransactionLog component", () => {
  it("renders table headers", () => {
    render(<TransactionLog transactions={[pledge]} />);
    expect(screen.getByText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/type/i)).toBeInTheDocument();
    expect(screen.getByText(/project/i)).toBeInTheDocument();
    expect(screen.getByText(/entity/i)).toBeInTheDocument();
    expect(screen.getByText(/amount/i)).toBeInTheDocument();
  });

  it("renders an empty state message when no transactions", () => {
    render(<TransactionLog transactions={[]} />);
    expect(screen.getByText(/no csr transactions/i)).toBeInTheDocument();
  });

  it("renders pledge row with company name", () => {
    render(<TransactionLog transactions={[pledge]} />);
    expect(screen.getByText("Tata Consultancy Services")).toBeInTheDocument();
  });

  it("renders pledge type badge", () => {
    render(<TransactionLog transactions={[pledge]} />);
    expect(screen.getByText(/pledge/i)).toBeInTheDocument();
  });

  it("renders expense row with negative amount", () => {
    render(<TransactionLog transactions={[expense]} />);
    expect(screen.getByText(/25,000/)).toBeInTheDocument();
  });

  it("renders expense type badge", () => {
    render(<TransactionLog transactions={[expense]} />);
    expect(screen.getByText(/expense/i)).toBeInTheDocument();
  });

  it("renders a bill link for expense with billDocumentUrl", () => {
    render(<TransactionLog transactions={[expense]} />);
    const link = screen.getByRole("link", { name: /view bill/i });
    expect(link).toHaveAttribute("href", "https://storage.example.com/bill.pdf");
  });

  it("renders multiple transactions", () => {
    render(<TransactionLog transactions={[pledge, expense]} />);
    expect(screen.getByText("Tata Consultancy Services")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders projectName for each transaction row", () => {
    render(<TransactionLog transactions={[pledge]} />);
    expect(screen.getAllByText("Rural Health Camp").length).toBeGreaterThan(0);
  });
});
