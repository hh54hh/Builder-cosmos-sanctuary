import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthState } from "@/lib/storage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  const authState = getAuthState();
  if (!authState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
