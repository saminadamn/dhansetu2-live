export default function AboutSection() {
  return (
    <section className="section-box">
      <h2 className="section-title mb-4">About the Portal</h2>

      <p className="text-sm md:text-base text-slate-700 leading-relaxed">
        This national credit-screening prototype is designed to modernize how NBCFDC
        evaluates beneficiaries. It integrates verified identity data, internal loan
        behavior, Account Aggregator financial signals, and utility consumption metrics
        to generate a transparent and explainable credit-worthiness score.
      </p>
    </section>
  );
}