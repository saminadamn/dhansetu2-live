// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageShell from "./components/layout/PageShell";
import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/Landing/LandingPage";
import BeneficiaryLogin from "./pages/Auth/BeneficiaryLogin";
import OfficerLogin from "./pages/Auth/OfficerLogin";
import ChannelLogin from "./pages/Auth/ChannelLogin";
import ApplicationFormPage from "./pages/Application/ApplicationFormPage";
import MyApplicationStatus from "./pages/Application/MyApplicationStatus";
import BeneficiaryDashboard from "./pages/Dashboard/BeneficiaryDashboard";
import OfficerDashboard from "./pages/Dashboard/OfficerDashboard";
import ApplicationDetails from "./pages/Application/ApplicationDetails";
import ChannelPartnerDashboard from "./pages/Landing/ChannelPartnerDashboard";
import GeminiTools from "./pages/AI/GeminiTools";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-semibold mb-2">404 – Page Not Found</h1>
      <p className="text-slate-600 mb-4">The page you are looking for does not exist.</p>
      <a href="/" className="text-govBlue underline">Go back to Home</a>
    </div>
  );
}

function App() {
  return (
    // BrowserRouter wraps PageShell so the Header/Footer can use <Link> —
    // plain <a> tags here previously forced a full page reload on every
    // nav click, which made navigation feel dead for a second or two.
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <PageShell>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth */}
            <Route path="/login/beneficiary" element={<BeneficiaryLogin />} />
            <Route path="/login/officer" element={<OfficerLogin />} />
            <Route path="/login/channel" element={<ChannelLogin />} />

            {/* Beneficiary */}
            <Route
              path="/loans/apply"
              element={<ProtectedRoute role="beneficiary"><ApplicationFormPage /></ProtectedRoute>}
            />
            <Route
              path="/application/new"
              element={<ProtectedRoute role="beneficiary"><ApplicationFormPage /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/beneficiary"
              element={<ProtectedRoute role="beneficiary"><BeneficiaryDashboard /></ProtectedRoute>}
            />
            <Route
              path="/my-applications/:id"
              element={<ProtectedRoute role="beneficiary"><MyApplicationStatus /></ProtectedRoute>}
            />

            {/* Officer */}
            <Route
              path="/dashboard/officer"
              element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/applications/:id"
              element={<ProtectedRoute role="officer"><ApplicationDetails /></ProtectedRoute>}
            />

            {/* Third-party / channel partner */}
            <Route
              path="/dashboard/channel"
              element={<ProtectedRoute role="channel"><ChannelPartnerDashboard /></ProtectedRoute>}
            />

            {/* GEMINI API */}
            <Route path="/ai-tools" element={<GeminiTools />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageShell>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
