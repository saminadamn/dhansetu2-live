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

export default function Header() {
 const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentLang = i18n.resolvedLanguage || i18n.language || "en";

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
          <div className="h-15 w-10 overflow-hidden border border-white/40 bg-white/20 flex items-center justify-center">
            <img
              src={ashoka}
              alt="Ashoka Emblem"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wide text-white/90">
              {t("header.ministry")}
            </p>
            <p className="font-semibold text-sm md:text-base text-white">
              DHANSETU - Smart NBCFDC Loan Screening Portal
            </p>
            <p className="text-[11px] text-white/80">
              A pilot initiative for fair & data-driven credit access.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4 text-xs md:text-sm">
          <nav className="flex items-center gap-3 md:gap-4">
            {user ? (
              <>
                <Link
                  to={DASHBOARD_PATH[user.role] || "/"}
                  className="text-white hover:text-govGold transition font-medium border-b-2 border-transparent hover:border-govGold pb-0.5"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-white hover:text-govGold transition font-medium border-b-2 border-transparent hover:border-govGold pb-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-white hover:text-govGold transition font-medium border-b-2 border-transparent hover:border-govGold pb-0.5"
                >
                  {t("header.home")}
                </Link>

                <Link
                  to="/login/beneficiary"
                  className="text-white hover:text-govGold transition font-medium border-b-2 border-transparent hover:border-govGold pb-0.5"
                >
                  {t("header.login")}
                </Link>

                {/* Plain anchor on purpose: hash scroll to the landing page's
                    contact section works via native browser behavior. */}
                <a
                  href="/#contact"
                  className="text-white hover:text-govGold transition font-medium border-b-2 border-transparent hover:border-govGold pb-0.5"
                >
                  {t("header.contact")}
                </a>
              </>
            )}
          </nav>

          {/* Language selector */}
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded border border-white/30">
            <select
              value={currentLang}
              onChange={handleLangChange}
              className="bg-transparent outline-none text-xs md:text-sm text-white focus:outline-none"
            >
              <option value="en" className="text-slate-900">English</option>
              <option value="hi" className="text-slate-900">हिन्दी</option>
              <option value="as" className="text-slate-900">অসমীয়া</option>
              <option value="bn" className="text-slate-900">বাংলা</option>
              <option value="brx" className="text-slate-900">बरʼ (Bodo)</option>
              <option value="doi" className="text-slate-900">डोगरी</option>
              <option value="gu" className="text-slate-900">ગુજરાતી</option>
              <option value="kn" className="text-slate-900">ಕನ್ನಡ</option>
              <option value="ks" className="text-slate-900">کٲشُر</option>
              <option value="kok" className="text-slate-900">कोंकणी</option>
              <option value="mai" className="text-slate-900">मैथिली</option>
              <option value="ml" className="text-slate-900">മലയാളം</option>
              <option value="mni" className="text-slate-900">মৈতৈ</option>
              <option value="mr" className="text-slate-900">मराठी</option>
              <option value="ne" className="text-slate-900">नेपाली</option>
              <option value="or" className="text-slate-900">ଓଡ଼ିଆ</option>
              <option value="pa" className="text-slate-900">ਪੰਜਾਬੀ</option>
              <option value="sa" className="text-slate-900">संस्कृतम्</option>
              <option value="sat" className="text-slate-900">ᱥᱟᱱᱛᱟᱞᱤ</option>
              <option value="sd" className="text-slate-900">سنڌي</option>
              <option value="ta" className="text-slate-900">தமிழ்</option>
              <option value="te" className="text-slate-900">తెలుగు</option>
              <option value="ur" className="text-slate-900">اردو</option>
            </select>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="px-3 py-1 rounded border border-white/40 bg-white/10 text-white text-xs hover:bg-white/20 transition"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </header>
  );
}
