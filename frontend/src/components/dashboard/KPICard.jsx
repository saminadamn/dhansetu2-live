export default function KPICard({ label, value, subtext }) {
  return (
    <div className="card p-4 md:p-5 space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {subtext && (
        <p className="text-xs text-slate-600 leading-relaxed">{subtext}</p>
      )}
    </div>
  );
}