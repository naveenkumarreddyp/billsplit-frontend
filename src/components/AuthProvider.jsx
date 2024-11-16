import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthCheckApiCall, useApiQuery } from "../hooks/useApi";
import { setUser, clearUser, setLoading } from "../redux/authSlice";
import { endpoints } from "../api/api";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getData, postData } from "../apiService/apiservice";
import { useQuery } from "@tanstack/react-query";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useSelector((state) => {
    return state.auth;
  });

  const {
    data: userData,
    isLoading: apiLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["checkAuth"],
    queryFn: () => getData(endpoints.checkAuth),
    retry: false,
  });

  const userInfoData = userData?.data || null;

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(userInfoData));
      dispatch(setLoading(false));
    }

    if (isError) {
      dispatch(clearUser());
      dispatch(setLoading(false));
      navigate("/login");
    }
  }, [isSuccess, isError, userInfoData]);

  // if (isLoading) {
  //   return <Loader />;
  // }
  {
    isLoading && (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }
  return children;
};
