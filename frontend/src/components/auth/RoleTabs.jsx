import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TABS = [
  { key: "beneficiary", href: "/login/beneficiary" },
  { key: "officer", href: "/login/officer" },
  { key: "channel", href: "/login/channel" },
];

export default function RoleTabs({ active }) {
  const { t } = useTranslation();
  return (
    <div className="p-4 pb-0">
      {/* Sits on the govBlue login card, so the palette is white-on-blue
          rather than the slate used elsewhere in the app. */}
      <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-xl p-1">
        {TABS.map((tab) =>
          tab.key === active ? (
            <span
              key={tab.key}
              className="flex-1 text-center text-xs font-semibold py-2.5 px-2 rounded-lg bg-white text-govBlue shadow transition-all"
            >
              {t(`auth.tabs.${tab.key}`)}
            </span>
          ) : (
            <Link
              key={tab.key}
              to={tab.href}
              className="flex-1 text-center text-xs font-medium py-2.5 px-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
            >
              {t(`auth.tabs.${tab.key}`)}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
