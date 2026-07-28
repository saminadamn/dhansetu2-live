import { useTranslation } from "react-i18next";

export default function ContactSection() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="section-box scroll-mt-6">
      <h2 className="section-title mb-4">{t("landing.contact.title")}</h2>

      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
        {t("landing.contact.body")}
      </p>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {t("landing.contact.note")}
      </p>
    </section>
  );
}
