import { BarChart3, Building2, LayoutDashboard } from "lucide-react";
import type { AppPage } from "../types";

interface AppHeaderProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navigation: Array<{ page: AppPage; label: string; href: string; icon: typeof LayoutDashboard }> = [
  { page: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { page: "statistics", label: "Statistics", href: "/statistics", icon: BarChart3 },
  { page: "about", label: "About", href: "/about", icon: Building2 },
];

export function AppHeader({ activePage, onNavigate }: AppHeaderProps) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="/"
        aria-label="Thrive Lending dashboard"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("dashboard");
        }}
      >
        <span className="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" role="img">
            <path d="M6 22c7-12 18-15 27-7-6-1-10 2-12 6 5-1 9 0 12 3-10 9-21 8-27-2Z" />
            <circle cx="27" cy="14" r="1.4" />
          </svg>
        </span>
        <span className="brand__wordmark">thrive<span>lending</span></span>
      </a>

      <nav className="primary-nav" aria-label="Primary navigation">
        {navigation.map(({ page, label, href, icon: Icon }) => (
          <a
            key={page}
            href={href}
            className={`primary-nav__link ${activePage === page ? "primary-nav__link--active" : ""}`}
            aria-current={activePage === page ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(page);
            }}
          >
            <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
