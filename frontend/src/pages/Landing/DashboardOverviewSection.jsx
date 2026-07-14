import { Link } from "react-router-dom";

export default function DashboardOverviewSection() {
  const items = [
    {
      role: "Beneficiary Dashboard",
      description:
        "View your submitted applications, track status, and see your risk band and score.",
      link: "/dashboard/beneficiary",
      tag: "Citizens / Beneficiaries",
    },
    {
      role: "Channel Partner Dashboard",
      description:
        "Access assigned applications, plan field visits, and upload verification details.",
      link: "/dashboard/channel",
      tag: "District / Block Officers",
    },
    {
      role: "Officer / Reviewer Dashboard",
      description:
        "Monitor all applications, review high-risk cases, and oversee scheme performance.",
      link: "/dashboard/officer",
      tag: "State / Central Admins",
    },
  ];

  return (
    <section className="section-box">
      <h2 className="section-title">Role-based Dashboards</h2>

      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 mb-4">
        The portal provides a dedicated view for each type of user.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.role}
            className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-[2px] transition"
          >
            <div className="space-y-2">
              <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-govBlue dark:text-blue-300 bg-govSoftBlue dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {item.tag}
              </span>
              <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100">
                {item.role}
              </h3>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
                {item.description}
              </p>
            </div>
            <div className="mt-3">
              <Link
                to={item.link}
                className="group inline-flex items-center text-xs md:text-sm font-medium text-govBlue dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
              >
                Open {item.role.replace(" Dashboard", "")}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}