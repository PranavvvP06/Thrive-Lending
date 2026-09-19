export type DecisionStatus = "Approved" | "Declined";
export type AppPage = "dashboard" | "statistics" | "about";

export interface CreateLoanApplicationRequest {
  loanAmount: number;
  assetValue: number;
  creditScore: number;
}

export interface LoanApplication extends CreateLoanApplicationRequest {
  id: string;
  loanToValue: number;
  status: DecisionStatus;
  reason: string;
  requiredCreditScore: number | null;
  submittedAt: string;
}

export interface DashboardSummary {
  totalApplicants: number;
  approvedApplicants: number;
  declinedApplicants: number;
  totalApprovedLoanValue: number;
  meanLoanToValue: number;
}
