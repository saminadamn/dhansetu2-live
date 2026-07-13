export default function ScoreCard({
  title = "Composite Score",
  score = 0,
  subtitle,
  bandLabel,
}) {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <div className="card p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-[3px]">
      {/* Circular score */}
      <div className="relative h-24 w-24 flex items-center justify-center rounded-full shadow-sm">
        <svg className="h-24 w-24 -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="42"
            className="text-slate-200"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            className="text-govBlue"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={
              2 * Math.PI * 42 * (1 - safeScore / 100)
            }
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-slate-900">
              {safeScore}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              / 100
            </p>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.15em]">
          {title}
        </p>
        <p className="text-sm md:text-base text-slate-800">
          {subtitle ||
            "Composite ML-based score combining repayment and income proxy models."}
        </p>
        {bandLabel && (
          <p className="mt-1 text-xs font-medium text-govBlue">
            Risk Band: <span className="font-semibold">{bandLabel}</span>
          </p>
        )}
      </div>
    </div>
  );
}