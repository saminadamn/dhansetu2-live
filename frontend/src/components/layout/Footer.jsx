import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 mt-6 print:hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-4 text-[11px] md:text-xs text-slate-600 dark:text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="font-medium text-govInk dark:text-slate-200">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p>{t("footer.inspired")}</p>
        </div>
        <div className="text-right space-y-1">
          <p>
            {t("footer.developedAs")}{" "}
            <span className="font-semibold text-govBlue dark:text-blue-300">
              {t("footer.hackathon")}
            </span>
            .
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500">
            {t("footer.team")}
          </p>
        </div>
      </div>
    </footer>
  );
}
