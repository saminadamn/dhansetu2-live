
import ScoreCard from "../ui/ScoreCard.jsx";

export default function ScorePanel({ app }) {
  const { repaymentScore, incomeProxyScore, compositeScore, confidence } =
    app.score;

  return (
    <section className="section-box">
      <h2 className="section-title mb-4">Model Scorecard</h2>

      <ScoreCard
        score={compositeScore}
        title="Composite Credit Score"
        subtitle="Overall credit-worthiness as assessed by combined repayment and income proxy models."
        bandLabel={`${compositeScore} / 100 · Confidence: ${confidence}`}
      />

      <div className="h-[1px] bg-slate-200 my-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
        <div className="card p-4 space-y-2">
          <p className="font-semibold text-govBlue">
            Repayment Behaviour Score
          </p>
          <p>
            <span className="font-medium">Score:</span> {repaymentScore} / 100
          </p>
          <p className="text-slate-600 text-xs">
            Based on past loan performance, delays, EMI bounces and field
            officer ratings.
          </p>
        </div>
        <div className="card p-4 space-y-2">
          <p className="font-semibold text-govBlue">
            Income Proxy Score
          </p>
          <p>
            <span className="font-medium">Score:</span> {incomeProxyScore} / 100
          </p>
          <p className="text-slate-600 text-xs">
            Estimated from Account Aggregator inflows, average balances and
            utility consumption.
          </p>
        </div>
      </div>

      <div className="h-[1px] bg-slate-200 my-6"></div>

      <div className="card p-4">
        <p className="font-semibold text-govBlue mb-3">
          Top Contributing Factors (Explainability)
        </p>
        <ul className="list-disc ml-5 text-xs md:text-sm text-slate-700 space-y-1">
          {app.score.topContributors.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
