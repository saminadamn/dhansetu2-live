import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function InfoBanner() {
  const { t } = useTranslation();

  return (
    <section className="relative -mx-4 md:-mx-6 lg:-mx-8 mb-10">
      <div className="absolute inset-0 bg-linear-to-br from-[#0d3862] via-[#154c84] to-[#1a5ca2]" />
      <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-govGold font-semibold">
              {t("landing.hero.eyebrow")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {t("landing.hero.title")}
            </h1>
            <p className="text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 min-w-fit">
            <Link
              to="/application/new"
              className="px-6 py-3 rounded-xl bg-white text-govBlue font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-govGold focus:ring-offset-govBlue transition-all duration-200 text-center"
            >
              {t("landing.hero.applyCta")}
            </Link>
            <Link
              to="/login/officer"
              className="px-6 py-3 rounded-xl border border-white/60 text-white font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-govBlue transition-all duration-200 text-center"
            >
              {t("landing.hero.officerCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
