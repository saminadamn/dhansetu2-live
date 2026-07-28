import { useTranslation } from "react-i18next";

export default function FAQSection() {
  const { t } = useTranslation();

  return (
    <section className="section-box">
      <h2 className="section-title mb-6">{t("landing.faq.title")}</h2>

      <div className="space-y-4">
        <div className="card p-4 border-l-4 border-govBlue">
          <p className="font-semibold text-govBlue dark:text-blue-300 mb-2">{t("landing.faq.q1")}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t("landing.faq.a1")}
          </p>
        </div>

        <div className="card p-4 border-l-4 border-sky-600">
          <p className="font-semibold text-sky-700 dark:text-sky-300 mb-2">
            {t("landing.faq.q2")}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t("landing.faq.a2")}
          </p>
        </div>
      </div>
    </section>
  );
}
