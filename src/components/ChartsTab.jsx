import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDatabyparams } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import Loader from "./Loader";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ChartsTab({ groupDetails }) {
  const fetchGroupExpenses = async () => {
    const response = await getDatabyparams(endpoints.expensesByGroupId, groupDetails?.groupId);
    return response.data;
  };

  const {
    data: expensesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groupExpenses", groupDetails?.groupId],
    queryFn: fetchGroupExpenses,
    enabled: !!groupDetails?.groupId,
  });

  if (isLoading) return <Loader />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const expensesByName = expensesData.reduce((acc, expense) => {
    acc[expense.expenseName] = (acc[expense.expenseName] || 0) + expense.totalBill;
    return acc;
  }, {});

  const totalExpenses = Object.values(expensesByName).reduce((sum, value) => sum + value, 0);
  const pieChartData = Object.entries(expensesByName).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalExpenses) * 100).toFixed(2),
  }));

  const barChartData = groupDetails.groupUsers.map((user) => ({
    name: user.userName,
    balance: user.balance,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow">
          <p className="label">{`${data.name} : ₹ ${data.value} (${data.percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center list-none p-0">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="inline-flex items-center mr-4 mb-2">
            <svg width="10" height="10" className="mr-1">
              <rect width="10" height="10" fill={entry.color} />
            </svg>
            <span className="text-sm">{`${entry.value} (${entry.payload.percentage}%)`}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">User Balances</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="balance" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
