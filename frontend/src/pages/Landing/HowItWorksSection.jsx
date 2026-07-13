export default function HowItWorksSection() {
  const steps = [
    "Applicant submits identity, household and occupation details.",
    "Uploads electricity bill and optional income/business proof.",
    "System fetches internal NBCFDC loan history.",
    "AA integration retrieves verified banking behavior.",
    "ML engine computes repayment score + income proxy score.",
    "Final risk band generated & sent for officer review.",
  ];

  return (
    <section className="section-box">
      <h2 className="section-title mb-6">How It Works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((text, index) => (
          <div key={index} className="relative card p-4 flex gap-4 items-start">
            <div className="h-9 w-9 rounded-full bg-govBlue text-white flex items-center justify-center font-bold text-base flex-shrink-0">
              {index + 1}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{text}</p>

            {index % 3 !== 2 && index !== steps.length - 1 && (
              <span className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 h-6 w-6 items-center justify-center text-govBlue/50 text-lg select-none">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}