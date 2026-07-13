// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageShell from "./components/layout/PageShell";
import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/Landing/LandingPage";
import BeneficiaryLogin from "./pages/Auth/BeneficiaryLogin";
import OfficerLogin from "./pages/Auth/OfficerLogin";
import ApplicationFormPage from "./pages/Application/ApplicationFormPage";
import BeneficiaryDashboard from "./pages/Dashboard/BeneficiaryDashboard";
import OfficerDashboard from "./pages/Dashboard/OfficerDashboard";
import ApplicationDetails from "./pages/Application/ApplicationDetails";
import ChannelPartnerDashboard from "./pages/Landing/ChannelPartnerDashboard";
import GeminiTools from "./pages/AI/GeminiTools";

import { AuthProvider } from "./context/AuthContext";

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
    <PageShell>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth */}
            <Route path="/login/beneficiary" element={<BeneficiaryLogin />} />
            <Route path="/login/officer" element={<OfficerLogin />} />

            {/* Beneficiary */}
            <Route path="/loans/apply" element={<ApplicationFormPage />} />
            <Route path="/application/new" element={<ApplicationFormPage />} />
            <Route path="/dashboard/beneficiary" element={<BeneficiaryDashboard />} />

            {/* Officer */}
            <Route path="/dashboard/officer" element={<OfficerDashboard />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/dashboard/channel" element={<ChannelPartnerDashboard />} />

            
            {/* GEMINI API */}
            <Route path="/ai-tools" element={<GeminiTools />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PageShell>
  );
}

export default App;
 