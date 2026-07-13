export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/80 mt-6 print:hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-4 text-[11px] md:text-xs text-slate-600 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="font-medium text-govInk">
            © {new Date().getFullYear()} NBCFDC – Smart Loan Screening System
          </p>
          <p>
            Prototype interface inspired by official MoSJE standards.
          </p>
        </div>
        <div className="text-right space-y-1">
          <p>
            Designed &amp; developed as part of{" "}
            <span className="font-semibold text-govBlue">
              Smart India Hackathon
            </span>
            .
          </p>
          <p className="text-[10px] text-slate-500">
            Team: DORA DORA
          </p>
        </div>
      </div>
    </footer>
  );
}