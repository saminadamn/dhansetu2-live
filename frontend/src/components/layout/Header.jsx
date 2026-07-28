// src/components/layout/Header.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ashoka from "./ashoka.png";
import { useTheme } from "../../lib/useTheme";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext.jsx";

const DASHBOARD_PATH = {
  beneficiary: "/dashboard/beneficiary",
  officer: "/dashboard/officer",
  channel: "/dashboard/channel",
};

const navLinkClass =
  "text-white/90 hover:text-white transition-colors font-medium border-b-2 border-transparent hover:border-govGold pb-0.5";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentLang = i18n.resolvedLanguage || i18n.language || "en";
  const isDark = theme === "dark";

  function handleLangChange(e) {
    const value = e.target.value;
    localStorage.setItem("dhansetu-language", value);
    i18n.changeLanguage(value);
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="bg-govBlue text-white shadow-md print:hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="h-15 w-10 overflow-hidden border border-white/40 bg-white/20 flex items-center justify-center rounded-sm">
            <img
              src={ashoka}
              alt="Ashoka Emblem"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wide text-white/80">
              {t("header.ministry")}
            </p>
            <p className="font-semibold text-sm md:text-base text-white">
              {t("header.title")}
            </p>
            <p className="text-[11px] text-white/70">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-5 text-xs md:text-sm">
          <nav className="flex items-center gap-4 md:gap-5">
            {user ? (
              <>
                <Link to={DASHBOARD_PATH[user.role] || "/"} className={navLinkClass}>
                  {t("header.dashboard")}
                </Link>
                <button type="button" onClick={handleLogout} className={navLinkClass}>
                  {t("dashboard.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass}>
                  {t("header.home")}
                </Link>

                <Link to="/login/beneficiary" className={navLinkClass}>
                  {t("header.login")}
                </Link>

                {/* Plain anchor on purpose: hash scroll to the landing page's
                    contact section works via native browser behavior. */}
                <a href="/#contact" className={navLinkClass}>
                  {t("header.contact")}
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="flex items-center bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/20 hover:border-white/40 transition-colors">
              <select
                value={currentLang}
                onChange={handleLangChange}
                aria-label="Select language"
                className="bg-transparent outline-none text-xs md:text-sm text-white cursor-pointer"
              >
                <option value="en" className="text-slate-900">English</option>
                <option value="hi" className="text-slate-900">हिन्दी</option>
              </select>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? t("header.lightMode") : t("header.darkMode")}
              title={isDark ? t("header.lightMode") : t("header.darkMode")}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 transition-colors"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 4a5 5 0 100 10 5 5 0 000-10zm7 5a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4 11a1 1 0 011 1H4a1 1 0 110-2h1a1 1 0 01-1 1zm13.66-6.66a1 1 0 011.41 0l.71.71a1 1 0 11-1.41 1.41l-.71-.71a1 1 0 010-1.41zM4.22 17.66a1 1 0 011.41 0l.71.71a1 1 0 11-1.41 1.41l-.71-.71a1 1 0 010-1.41zm13.44 0a1 1 0 010 1.41l-.71.71a1 1 0 11-1.41-1.41l.71-.71a1 1 0 011.41 0zM6.34 4.34a1 1 0 010 1.41l-.71.71A1 1 0 013.22 5.05l.71-.71a1 1 0 011.41 0zM12 19a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98A10.503 10.503 0 0112.25 22C6.588 22 2 17.412 2 11.75c0-4.638 3.088-8.55 7.32-9.813a.75.75 0 01.208-.219z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
