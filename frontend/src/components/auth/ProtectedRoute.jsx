import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const LOGIN_PATH = {
  beneficiary: "/login/beneficiary",
  officer: "/login/officer",
  channel: "/login/channel",
};

export default function ProtectedRoute({ role, children }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token || !user || user.role !== role) {
    return <Navigate to={LOGIN_PATH[role]} replace />;
  }

  return children;
}
