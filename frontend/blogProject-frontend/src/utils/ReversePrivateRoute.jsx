import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

export default function ReversePrivateRoute() {
  const { user } = useAuth();
  const location = useLocation();

  return !user ? <Outlet /> : <Navigate to="/" state={{ prevUrl: location }} />;
}
