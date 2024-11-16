import { Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useApiQuery } from "../hooks/useApi";
import { endpoints } from "../api/api";
import { clearUser } from "../redux/authSlice";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isError } = useApiQuery(endpoints.checkAuth, {
    queryKey: "auth",
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !isAuthenticated,
    onError: () => {
      dispatch(clearUser());
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader />
      </div>
    );
  }

  if (isError || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
