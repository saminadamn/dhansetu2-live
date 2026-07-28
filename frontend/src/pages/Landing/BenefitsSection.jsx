import { useTranslation } from "react-i18next";

// Keys map into landing.benefits.<key>; accent keeps each column's colour.
const GROUPS = [
  { key: "beneficiaries", border: "border-govBlue", text: "text-govBlue dark:text-blue-300" },
  { key: "officers", border: "border-sky-700", text: "text-sky-700 dark:text-sky-300" },
  { key: "administration", border: "border-blue-500", text: "text-blue-700 dark:text-blue-300" },
];

export default function BenefitsSection() {
  const { t } = useTranslation();

  return (
    <section className="section-box">
      <h2 className="section-title mb-6">{t("landing.benefits.title")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GROUPS.map((group) => {
          const items = t(`landing.benefits.${group.key}.items`, { returnObjects: true });
          return (
            <div key={group.key} className={`card p-5 border-l-4 ${group.border}`}>
              <h3 className={`font-semibold mb-3 ${group.text}`}>
                {t(`landing.benefits.${group.key}.title`)}
              </h3>
              <ul className="list-disc ml-5 text-sm space-y-2 text-slate-700 dark:text-slate-300">
                {(Array.isArray(items) ? items : []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
