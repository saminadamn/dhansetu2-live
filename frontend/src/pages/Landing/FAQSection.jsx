
export default function FAQSection() {
  return (
    <section className="section-box">
      <h2 className="section-title mb-6">Frequently Asked Questions</h2>

      <div className="space-y-4">
        <div className="card p-4 border-l-4 border-govBlue">
          <p className="font-semibold text-govBlue mb-2">Is my data safe?</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            All information is processed through secure channels. Banking data is
            shared only through Account Aggregator with user consent and is never
            stored in raw form.
          </p>
        </div>

        <div className="card p-4 border-l-4 border-sky-600">
          <p className="font-semibold text-sky-700 mb-2">
            Does a high score guarantee loan approval?
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            The score is advisory. Final approval depends on NBCFDC scheme rules and
            officer verification.
          </p>
        </div>
      </div>
    </section>
  );
}
