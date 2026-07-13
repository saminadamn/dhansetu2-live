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

      <p className="text-xs md:text-sm text-slate-700 mb-4">
        The portal provides a dedicated view for each type of user.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.role}
            className="card p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-[2px] transition"
          >
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                {item.tag}
              </p>
              <h3 className="text-sm md:text-base font-semibold text-slate-900">
                {item.role}
              </h3>
              <p className="text-xs md:text-sm text-slate-700">
                {item.description}
              </p>
            </div>
            <div className="mt-3">
              <a
                href={item.link}
                className="inline-flex items-center text-xs md:text-sm text-blue-800 hover:text-blue-900 underline"
              >
                Open {item.role.replace(" Dashboard", "")} →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}