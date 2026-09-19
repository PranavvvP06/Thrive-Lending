import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { recentApplications } = vi.hoisted(() => ({
  recentApplications: [
    {
      id: "application-1",
      loanAmount: 450_000,
      assetValue: 650_000,
      creditScore: 840,
      loanToValue: 69.23,
      status: "Approved" as const,
      reason: "Application meets the lending policy.",
      requiredCreditScore: null,
      submittedAt: new Date().toISOString(),
    },
  ],
}));

vi.mock("./api/lendingApi", () => ({
  getDashboardSummary: vi.fn().mockResolvedValue({
    totalApplicants: 12,
    approvedApplicants: 8,
    declinedApplicants: 4,
    totalApprovedLoanValue: 5_250_000,
    meanLoanToValue: 68.41,
  }),
  getRecentApplications: vi.fn().mockResolvedValue(recentApplications),
  submitLoanApplication: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("renders the lending dashboard and portfolio summary", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /clear decisions/i })).toBeInTheDocument();
    const navigation = screen.getByRole("navigation", { name: /primary/i });
    expect(within(navigation).getByRole("link", { name: /dashboard/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /run eligibility check/i })).toBeEnabled();

    await waitFor(() => {
      expect(screen.getByText("£5,250,000")).toBeInTheDocument();
      expect(screen.getByText("68.41%")).toBeInTheDocument();
    });
  });

  it("navigates to the statistics and about pages", async () => {
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: /primary/i });
    fireEvent.click(within(navigation).getByRole("link", { name: /statistics/i }));
    expect(screen.getByRole("heading", { name: "Statistics" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/statistics");
    expect(await screen.findByRole("button", { name: /£450,000 across 1 approved application/i })).toBeInTheDocument();

    fireEvent.click(within(navigation).getByRole("link", { name: /about/i }));
    expect(screen.getByRole("heading", { name: /transparent decisions/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/about");
  });
});
