import { useCallback, useEffect, useState } from "react";
import {
  getDashboardSummary,
  getRecentApplications,
  submitLoanApplication,
} from "./api/lendingApi";
import { AppHeader } from "./components/AppHeader";
import { AboutPage } from "./pages/AboutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import type {
  AppPage,
  CreateLoanApplicationRequest,
  DashboardSummary,
  LoanApplication,
} from "./types";

const emptySummary: DashboardSummary = {
  totalApplicants: 0,
  approvedApplicants: 0,
  declinedApplicants: 0,
  totalApprovedLoanValue: 0,
  meanLoanToValue: 0,
};

const pathByPage: Record<AppPage, string> = {
  dashboard: "/",
  statistics: "/statistics",
  about: "/about",
};

const getPageFromPath = (): AppPage => {
  if (window.location.pathname.startsWith("/statistics")) return "statistics";
  if (window.location.pathname.startsWith("/about")) return "about";
  return "dashboard";
};

function App() {
  const [activePage, setActivePage] = useState<AppPage>(getPageFromPath);
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [latestDecision, setLatestDecision] = useState<LoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextSummary, recentApplications] = await Promise.all([
        getDashboardSummary(),
        getRecentApplications(),
      ]);
      setSummary(nextSummary);
      setApplications(recentApplications);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The dashboard could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handlePopState = () => setActivePage(getPageFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const titles: Record<AppPage, string> = {
      dashboard: "Thrive Lending | Dashboard",
      statistics: "Thrive Lending | Statistics",
      about: "Thrive Lending | About",
    };
    document.title = titles[activePage];
  }, [activePage]);

  const navigate = (page: AppPage) => {
    const nextPath = pathByPage[page];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus());
  };

  const handleSubmit = async (request: CreateLoanApplicationRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const application = await submitLoanApplication(request);
      setLatestDecision(application);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The application could not be assessed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`app-shell app-shell--${activePage}`}>
      <AppHeader activePage={activePage} onNavigate={navigate} />

      {activePage === "dashboard" && (
        <DashboardPage
          summary={summary}
          applications={applications}
          latestDecision={latestDecision}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          onRetry={() => void loadDashboard()}
          onSubmit={handleSubmit}
        />
      )}
      {activePage === "statistics" && (
        <StatisticsPage
          summary={summary}
          isLoading={isLoading}
          error={error}
          onRetry={() => void loadDashboard()}
        />
      )}
      {activePage === "about" && <AboutPage />}

      <footer>
        <span>Thrive Lending</span>
        <span>Consistent decisions, clearly explained.</span>
      </footer>
    </div>
  );
}

export default App;
