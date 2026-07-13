
import { RISK_BANDS } from "../../lib/constants.js";

function getBand(score) {
  return (
    RISK_BANDS.find(
      (band) => score >= band.minScore && score <= band.maxScore
    ) || RISK_BANDS[RISK_BANDS.length - 1]
  );
}

export default function ApplicationSummaryHeader({ app }) {
  const band = getBand(app.score.compositeScore);

  return (
    <section className="section-box">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs text-slate-600">
            Application ID:{" "}
            <span className="font-mono text-govBlue font-semibold">{app.id}</span>
          </p>
          <h1 className="text-xl md:text-2xl font-semibold text-govInk">
            {app.applicantName}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {app.age} years · {app.gender} · {app.occupation}
          </p>
          <p className="text-xs md:text-sm text-slate-600">
            {app.address}
          </p>
        </div>

        <div className="space-y-2 text-xs md:text-sm">
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-semibold ${band.color}`}
          >
            Risk Band: {band.label}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1.5 rounded bg-govSoftBlue text-govBlue border border-blue-200 text-xs font-medium">
              Scheme: {app.scheme}
            </span>
            <span className="px-2.5 py-1.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium">
              Requested: ₹{app.requestedAmount.toLocaleString("en-IN")}
            </span>
            <span className="px-2.5 py-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
              Status: {app.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Sarpanch: {app.sarpanch.name} –{" "}
            <span className="font-semibold text-govBlue">
              {app.sarpanch.approvalStatus}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
