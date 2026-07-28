import { useTranslation } from "react-i18next";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="section-box">
      <h2 className="section-title mb-4">{t("landing.about.title")}</h2>

      <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-prose">
        {t("landing.about.body")}
      </p>
    </section>
  );
}
