import { humanizeFeature } from "../../lib/featureLabels.js";

export default function ShapExplainability({ explanation }) {
  if (!explanation || (!explanation.repayment_contributors?.length && !explanation.income_contributors?.length)) {
    return null;
  }

  const combined = [
    ...(explanation.repayment_contributors || []).map((c) => ({ ...c, group: "Repayment" })),
    ...(explanation.income_contributors || []).map((c) => ({ ...c, group: "Income Proxy" })),
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 6);

  const maxAbsImpact = Math.max(...combined.map((c) => Math.abs(c.impact)), 0.0001);

  return (
    <div className="card p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-govBlue dark:text-blue-300 text-sm mb-1">
          Why this score? (Explainability)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Feature impact on the model's output, computed via SHAP — positive bars pushed the score up, negative bars pulled it down.
        </p>
      </div>

      <div className="space-y-2">
        {combined.map((c, i) => {
          const isPositive = c.impact > 0;
          const widthPct = (Math.abs(c.impact) / maxAbsImpact) * 100;
          return (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-40 shrink-0 text-slate-600 dark:text-slate-400 truncate" title={humanizeFeature(c.feature)}>
                {humanizeFeature(c.feature)}
              </span>
              <span className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex items-center">
                <span
                  className={`h-full rounded ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${widthPct}%` }}
                />
              </span>
              <span className={`w-16 shrink-0 text-right font-mono ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {isPositive ? "+" : ""}{c.impact.toFixed(2)}
              </span>
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {c.group}
              </span>
            </div>
          );
        })}
      </div>

      {explanation.insights?.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          {explanation.insights.map((text, i) => (
            <p key={i} className="text-xs text-slate-600 dark:text-slate-400">
              • {text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
