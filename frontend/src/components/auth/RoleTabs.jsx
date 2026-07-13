const TABS = [
  { key: "beneficiary", label: "Beneficiary / Citizen", href: "/login/beneficiary" },
  { key: "officer", label: "Internal Officer", href: "/login/officer" },
  { key: "channel", label: "Third-Party / SHG", href: "/dashboard/channel" },
];

export default function RoleTabs({ active }) {
  return (
    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2 gap-2">
      {TABS.map((tab) =>
        tab.key === active ? (
          <span
            key={tab.key}
            className="flex-1 py-2.5 text-center text-sm font-medium rounded-xl bg-white dark:bg-slate-900 text-govBlue dark:text-blue-300 shadow-sm border border-slate-200/70 dark:border-slate-700"
          >
            {tab.label}
          </span>
        ) : (
          <a
            key={tab.key}
            href={tab.href}
            className="flex-1 py-2.5 text-center text-sm font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-900/60 transition"
          >
            {tab.label}
          </a>
        )
      )}
    </div>
  );
}
