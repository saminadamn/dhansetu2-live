
// Risk band thresholds (you can tweak later)
export const RISK_BANDS = [
  {
    id: "low-risk-high-need",
    label: "Low Risk – High Need",
    minScore: 75,
    maxScore: 100,
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "low-risk-low-need",
    label: "Low Risk – Moderate Need",
    minScore: 60,
    maxScore: 74,
    color: "bg-sky-100 text-sky-800 border-sky-300",
  },
  {
    id: "high-risk-high-need",
    label: "High Risk – High Need",
    minScore: 45,
    maxScore: 59,
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "high-risk-low-need",
    label: "High Risk – Low Need",
    minScore: 0,
    maxScore: 44,
    color: "bg-rose-100 text-rose-800 border-rose-300",
  },
];

// Single detailed mock application (used in ApplicationDetailPage)
export const MOCK_APPLICATION = {
  id: "APP-2025-0001",
  applicantName: "Sita Devi",
  age: 37,
  gender: "Female",
  district: "Dhanbad",
  address: "Village Rampur, Block Baliapur, Dhanbad, Jharkhand",
  occupation: "Small Kirana Shop Owner",
  householdSize: 5,
  rationCategory: "AAY",
  scheme: "NBCFDC Micro-Credit",
  requestedAmount: 50000,
  status: "Under Review",
  score: {
    repaymentScore: 82,
    incomeProxyScore: 76,
    compositeScore: 80,
    confidence: "Medium-High",
    topContributors: [
      "Timely repayments in previous NBCFDC loan",
      "Stable monthly inflows in AA-linked account",
      "Consistent electricity consumption pattern",
    ],
  },
  history: {
    numPastLoans: 2,
    pastDefaults: 0,
    latePaymentsCount: 3,
    avgDaysPastDue: 4,
    emiBounceCount: 1,
    activeLoansCount: 1,
    fieldOfficerRating: 4.3,
  },
  aaSummary: {
    avgMonthlyInflow: 18000,
    avgBalance: 7500,
    transactionCount: 45,
    salaryConsistency: "Irregular but sufficient inflows",
  },
  utilitySummary: {
    avgUnits: 85,
    lastBillPaidOnTime: true,
    addressMatch: true,
  },
  sarpanch: {
    name: "Ramesh Prasad",
    approvalStatus: "Recommended",
  },
};

// Mock list of applications for dashboards
export const MOCK_APPLICATIONS = [
  {
    id: "APP-2025-0001",
    applicantName: "Sita Devi",
    district: "Dhanbad",
    scheme: "NBCFDC Micro-Credit",
    requestedAmount: 50000,
    status: "Under Review",
    compositeScore: 80,
    bandId: "low-risk-high-need",
    lastUpdated: "2025-12-01",
    assignedTo: "FO-101",
  },
  {
    id: "APP-2025-0002",
    applicantName: "Rahul Kumar",
    district: "Ranchi",
    scheme: "NBCFDC Education Loan",
    requestedAmount: 120000,
    status: "Pending Field Verification",
    compositeScore: 67,
    bandId: "low-risk-low-need",
    lastUpdated: "2025-12-02",
    assignedTo: "FO-101",
  },
  {
    id: "APP-2025-0003",
    applicantName: "Meena Kumari",
    district: "Hazaribagh",
    scheme: "NBCFDC Self-Employment",
    requestedAmount: 80000,
    status: "Approved",
    compositeScore: 78,
    bandId: "low-risk-high-need",
    lastUpdated: "2025-11-28",
    assignedTo: "FO-102",
  },
  {
    id: "APP-2025-0004",
    applicantName: "Vijay Singh",
    district: "Giridih",
    scheme: "NBCFDC Micro-Credit",
    requestedAmount: 40000,
    status: "Rejected",
    compositeScore: 42,
    bandId: "high-risk-low-need",
    lastUpdated: "2025-11-30",
    assignedTo: "FO-101",
  },
  {
    id: "APP-2025-0005",
    applicantName: "Shanti Devi",
    district: "Bokaro",
    scheme: "NBCFDC Micro-Credit",
    requestedAmount: 60000,
    status: "In Queue",
    compositeScore: 55,
    bandId: "high-risk-high-need",
    lastUpdated: "2025-12-01",
    assignedTo: "FO-103",
  },
];

// High-level dashboard stats (for Admin)
export const DASHBOARD_STATS = {
  totalApplications: MOCK_APPLICATIONS.length,
  approved: MOCK_APPLICATIONS.filter((a) => a.status === "Approved").length,
  rejected: MOCK_APPLICATIONS.filter((a) => a.status === "Rejected").length,
  underReview: MOCK_APPLICATIONS.filter(
    (a) => a.status === "Under Review" || a.status === "Pending Field Verification"
  ).length,
};
