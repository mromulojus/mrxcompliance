import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Redirect to auth page
export default function Login() {
  return <Navigate to="/auth" replace />;
}
