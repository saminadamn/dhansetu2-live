const TABS = [
  { key: "beneficiary", label: "Beneficiary / Citizen", href: "/login/beneficiary" },
  { key: "officer", label: "Internal Officer", href: "/login/officer" },
  { key: "channel", label: "Third-Party / SHG", href: "/dashboard/channel" },
];

export default function RoleTabs({ active }) {
  return (
    <div className="p-4 pb-0">
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 rounded-xl p-1">
        {TABS.map((tab) =>
          tab.key === active ? (
            <span
              key={tab.key}
              className="flex-1 text-center text-xs font-semibold py-2.5 px-2 rounded-lg bg-govBlue dark:bg-blue-600 text-white shadow transition-all"
            >
              {tab.label}
            </span>
          ) : (
            <a
              key={tab.key}
              href={tab.href}
              className="flex-1 text-center text-xs font-medium py-2.5 px-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-900/60 transition-colors"
            >
              {tab.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}
