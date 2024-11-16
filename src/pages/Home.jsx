import React from "react";
import { Plus } from "lucide-react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { pieChartData, barChartData } from "../commondata";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { getDatabyparams, postData } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import { useSelector } from "react-redux";

const fetchHomeData = async (userId) => {
  const response = await getDatabyparams(endpoints.getHomeUserData, userId);

  return response.data;
};

const fetchHomeBarChartData = async (userId) => {
  const response = await getDatabyparams(endpoints.barGraphHome, userId);

  return response.data;
};

const fetchHomePieChartData = async (userId) => {
  const response = await getDatabyparams(endpoints.pieChartHome, userId);

  return response.data;
};

export default function Home() {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const { data, isLoading, error } = useQuery({
    queryKey: ["homeData", authUser?.userId],
    queryFn: () => fetchHomeData(authUser?.userId),
    enabled: !!authUser?.userId,
  });
  const {
    data: barChartData,
    isLoading: barLoading,
    error: barError,
  } = useQuery({
    queryKey: ["homebarGraphData", authUser?.userId],
    queryFn: () => fetchHomeBarChartData(authUser?.userId),
    enabled: !!authUser?.userId,
  });
  const {
    data: pieChartData,
    isLoading: pieLoading,
    error: pieError,
  } = useQuery({
    queryKey: ["homepieChartData", authUser?.userId],
    queryFn: () => fetchHomePieChartData(authUser?.userId),
    enabled: !!authUser?.userId,
  });
  //if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  if (error) return <div className="text-center py-4 text-red-500">An error occurred: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Link to="/groups" className="text-2xl font-bold text-blue-600 hover:underline">
                {data?.totalGroups}
              </Link>
              <p className="text-sm text-gray-600">Total Groups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">₹{data?.amountOwing * -1}</p>
              <p className="text-sm text-gray-600">You Owe</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">₹{data?.amountOwed}</p>
              <p className="text-sm text-gray-600">Owed to You</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center" onClick={() => navigate("/groups/create")}>
            <Plus className="w-5 h-5 mr-2" />
            New Group
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center justify-center" onClick={() => navigate("/friends/addfriend")}>
            <Plus className="w-5 h-5 mr-2" />
            Add Friend
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-center">Overall Overview</h2>
          {pieChartData && pieChartData.length > 0 && pieChartData?.some((item) => item?.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="value" data={pieChartData} fill="#8884d8" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">No expenses made yet</p>
              </div>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4 text-center">Expense Trend</h2>
          {barChartData && barChartData?.length > 0 && barChartData?.some((item) => item["You Paid"] > 0 || item["Your Expenses"] > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="MonthName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Your Expenses" fill="#f87171" />
                <Bar dataKey="You Paid" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">No expenses made yet</p>
              </div>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
