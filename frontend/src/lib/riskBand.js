export const RISK_BAND_STYLES = {
  "Low Risk – High Priority": {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    note: "Priority Sanction Available",
  },
  "Low Risk – Low Priority": {
    badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
    note: "Standard Digital Lending Route",
  },
  "High Risk – High Need": {
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    note: "Manual Review Recommended",
  },
  "High Risk – Low Need": {
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    note: "Not Recommended",
  },
};

export function riskBandStyle(band) {
  return (
    RISK_BAND_STYLES[band] || {
      badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      note: "Awaiting Assessment",
    }
  );
}

export const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  REJECTED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  CLARIFICATION: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
};

export function statusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.PENDING;
}
