
export default function EvidencePanel({ app }) {
  return (
    <section className="section-box">
      <h2 className="section-title mb-4">Evidence Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
        {/* Loan history */}
        <div className="card p-4 space-y-2">
          <p className="font-semibold text-govBlue">Loan History</p>
          <p>
            <span className="font-medium">Past Loans:</span>{" "}
            {app.history.numPastLoans}
          </p>
          <p>
            <span className="font-medium">Defaults:</span>{" "}
            {app.history.pastDefaults}
          </p>
          <p>
            <span className="font-medium">Late Payments:</span>{" "}
            {app.history.latePaymentsCount} (avg {app.history.avgDaysPastDue}{" "}
            days)
          </p>
          <p>
            <span className="font-medium">EMI Bounces:</span>{" "}
            {app.history.emiBounceCount}
          </p>
          <p>
            <span className="font-medium">Field Officer Rating:</span>{" "}
            {app.history.fieldOfficerRating.toFixed(1)} / 5
          </p>
        </div>

        {/* AA summary */}
        <div className="card p-4 space-y-2">
          <p className="font-semibold text-govBlue">
            Account Aggregator Summary
          </p>
          <p>
            <span className="font-medium">Avg Monthly Inflow:</span> ₹
            {app.aaSummary.avgMonthlyInflow.toLocaleString("en-IN")}
          </p>
          <p>
            <span className="font-medium">Avg Balance:</span> ₹
            {app.aaSummary.avgBalance.toLocaleString("en-IN")}
          </p>
          <p>
            <span className="font-medium">Transaction Count:</span>{" "}
            {app.aaSummary.transactionCount}/month
          </p>
          <p>
            <span className="font-medium">Pattern:</span>{" "}
            {app.aaSummary.salaryConsistency}
          </p>
        </div>

        {/* Utility summary */}
        <div className="card p-4 space-y-2">
          <p className="font-semibold text-govBlue">
            Utility & Address Signals
          </p>
          <p>
            <span className="font-medium">Avg Units:</span>{" "}
            {app.utilitySummary.avgUnits} units/month
          </p>
          <p>
            <span className="font-medium">Last Bill:</span>{" "}
            {app.utilitySummary.lastBillPaidOnTime
              ? "Paid on time"
              : "Delayed payment"}
          </p>
          <p>
            <span className="font-medium">Address Match:</span>{" "}
            {app.utilitySummary.addressMatch
              ? "Matches application address"
              : "Mismatch detected"}
          </p>
        </div>
      </div>
    </section>
  );
}
