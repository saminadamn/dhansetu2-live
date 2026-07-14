export default function BenefitsSection() {
  return (
    <section className="section-box">
      <h2 className="section-title mb-6">Key Benefits</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 border-l-4 border-govBlue">
          <h3 className="font-semibold text-govBlue mb-3">For Beneficiaries</h3>
          <ul className="list-disc ml-5 text-sm space-y-2 text-slate-700 dark:text-slate-300">
            <li>Simple, guided loan application flow.</li>
            <li>Less paperwork due to AA data integration.</li>
            <li>Clear status updates and risk band transparency.</li>
          </ul>
        </div>

        <div className="card p-5 border-l-4 border-sky-700">
          <h3 className="font-semibold text-sky-700 mb-3">For Field Officers</h3>
          <ul className="list-disc ml-5 text-sm space-y-2 text-slate-700 dark:text-slate-300">
            <li>Queue of verifications with clear priorities.</li>
            <li>Unified document & evidence view per beneficiary.</li>
            <li>Support for on-ground verification remarks.</li>
          </ul>
        </div>

        <div className="card p-5 border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-700 mb-3">
            For NBCFDC & Administration
          </h3>
          <ul className="list-disc ml-5 text-sm space-y-2 text-slate-700 dark:text-slate-300">
            <li>Uniform scoring across districts.</li>
            <li>Powerful audit trail for decisions.</li>
            <li>Data insights for scheme monitoring.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}