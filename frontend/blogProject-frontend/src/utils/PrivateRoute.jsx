import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { userToken } = useAuth();

  return userToken ? <Outlet /> : <Navigate to="/login" />;
}
