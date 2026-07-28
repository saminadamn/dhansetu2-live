import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Keys map into landing.dashboards.<key> in the translation files.
const ROLES = [
  { key: "beneficiary", link: "/dashboard/beneficiary" },
  { key: "channel", link: "/dashboard/channel" },
  { key: "officer", link: "/dashboard/officer" },
];

export default function DashboardOverviewSection() {
  const { t } = useTranslation();

  return (
    <section className="section-box">
      <h2 className="section-title">{t("landing.dashboards.title")}</h2>

      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 mb-4">
        {t("landing.dashboards.subtitle")}
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <div
            key={role.key}
            className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-[2px] transition"
          >
            <div className="space-y-2">
              <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-govBlue dark:text-blue-300 bg-govSoftBlue dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {t(`landing.dashboards.${role.key}.tag`)}
              </span>
              <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100">
                {t(`landing.dashboards.${role.key}.name`)}
              </h3>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
                {t(`landing.dashboards.${role.key}.description`)}
              </p>
            </div>
            <div className="mt-3">
              <Link
                to={role.link}
                className="group inline-flex items-center text-xs md:text-sm font-medium text-govBlue dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
              >
                {t("landing.dashboards.open")} {t(`landing.dashboards.${role.key}.shortName`)}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
