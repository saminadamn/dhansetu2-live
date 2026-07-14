import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const DASHBOARD_PATH = {
  beneficiary: "/dashboard/beneficiary",
  officer: "/dashboard/officer",
  channel: "/dashboard/channel",
};

// Prevent an authenticated session from navigating back to public landing and
// login pages through the address bar or a stale browser history entry.
export default function PublicOnlyRoute({ children }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (token && user) {
    return <Navigate to={DASHBOARD_PATH[user.role] || "/"} replace />;
  }

  return children;
}
