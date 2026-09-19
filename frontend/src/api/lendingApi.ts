import type {
  CreateLoanApplicationRequest,
  DashboardSummary,
  DecisionStatus,
  LoanApplication,
} from "../types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";
const mockStorageKey = "thrive-lending-demo-applications:v1";

const seedApplications: LoanApplication[] = [
  {
    id: "demo-approved",
    loanAmount: 450_000,
    assetValue: 650_000,
    creditScore: 842,
    loanToValue: 69.23,
    status: "Approved",
    reason: "The application meets the 800 credit score requirement for loans with an LTV from 60% to below 80%.",
    requiredCreditScore: 800,
    submittedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: "demo-declined",
    loanAmount: 920_000,
    assetValue: 1_000_000,
    creditScore: 910,
    loanToValue: 92,
    status: "Declined",
    reason: "The requested loan represents 90% or more of the secured asset value. This exceeds the permitted LTV for facilities below £1 million.",
    requiredCreditScore: null,
    submittedAt: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
  },
];

const parseResponse = async <T>(responsePromise: Response | Promise<Response>): Promise<T> => {
  const response = await responsePromise;
  if (!response.ok) {
    const problem = response.headers.get("content-type")?.includes("application/json")
      ? await response.json().catch(() => null)
      : null;
    const validationMessage = problem?.errors
      ? Object.values(problem.errors).flat().join(" ")
      : null;
    const fallbackMessage = response.status >= 500
      ? "The lending service encountered an internal error. Check the API logs and try again."
      : "The service could not complete your request.";
    throw new Error(validationMessage || problem?.title || fallbackMessage);
  }

  return response.json() as Promise<T>;
};

const readMockApplications = (): LoanApplication[] => {
  const stored = localStorage.getItem(mockStorageKey);
  if (stored) return JSON.parse(stored) as LoanApplication[];
  localStorage.setItem(mockStorageKey, JSON.stringify(seedApplications));
  return seedApplications;
};

const evaluateMockApplication = (request: CreateLoanApplicationRequest): LoanApplication => {
  const ltv = (request.loanAmount / request.assetValue) * 100;
  let status: DecisionStatus = "Declined";
  let reason = "";
  let requiredCreditScore: number | null = null;

  if (request.loanAmount < 100_000) {
    reason = "The loan amount is below the minimum of £100,000.";
  } else if (request.loanAmount > 1_500_000) {
    reason = "The loan amount exceeds the maximum of £1,500,000.";
  } else if (request.loanAmount >= 1_000_000) {
    if (ltv > 60) {
      reason = "Loans of £1 million or more require an LTV of 60% or less.";
    } else {
      requiredCreditScore = 950;
    }
  } else if (ltv >= 90) {
    reason = "The requested loan represents 90% or more of the secured asset value. This exceeds the permitted LTV for facilities below £1 million.";
  } else {
    requiredCreditScore = ltv < 60 ? 750 : ltv < 80 ? 800 : 900;
  }

  if (requiredCreditScore !== null) {
    const band = request.loanAmount >= 1_000_000
      ? "high-value loans with an LTV of 60% or less"
      : ltv < 60
        ? "loans with an LTV below 60%"
        : ltv < 80
          ? "loans with an LTV from 60% to below 80%"
          : "loans with an LTV from 80% to below 90%";
    status = request.creditScore >= requiredCreditScore ? "Approved" : "Declined";
    reason = status === "Approved"
      ? `The application meets the ${requiredCreditScore} credit score requirement for ${band}.`
      : `A minimum credit score of ${requiredCreditScore} is required for ${band}.`;
  }

  return {
    ...request,
    id: crypto.randomUUID(),
    loanToValue: Number(ltv.toFixed(2)),
    status,
    reason,
    requiredCreditScore,
    submittedAt: new Date().toISOString(),
  };
};

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 480));

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (!useMockApi) {
    return parseResponse(fetch(`${apiBaseUrl}/api/dashboard/summary`));
  }

  await mockDelay();
  const applications = readMockApplications();
  const approved = applications.filter((item) => item.status === "Approved");
  const meanLtv = applications.length
    ? applications.reduce((sum, item) => sum + item.loanToValue, 0) / applications.length
    : 0;

  return {
    totalApplicants: applications.length,
    approvedApplicants: approved.length,
    declinedApplicants: applications.length - approved.length,
    totalApprovedLoanValue: approved.reduce((sum, item) => sum + item.loanAmount, 0),
    meanLoanToValue: Number(meanLtv.toFixed(2)),
  };
};

export const getRecentApplications = async (limit = 10): Promise<LoanApplication[]> => {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);

  if (!useMockApi) {
    return parseResponse(fetch(`${apiBaseUrl}/api/applications?limit=${safeLimit}`));
  }

  await mockDelay();
  return [...readMockApplications()]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, safeLimit);
};

export const submitLoanApplication = async (
  request: CreateLoanApplicationRequest,
): Promise<LoanApplication> => {
  if (!useMockApi) {
    return parseResponse(
      fetch(`${apiBaseUrl}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }),
    );
  }

  await mockDelay();
  const application = evaluateMockApplication(request);
  const applications = readMockApplications();
  localStorage.setItem(mockStorageKey, JSON.stringify([application, ...applications]));
  return application;
};
