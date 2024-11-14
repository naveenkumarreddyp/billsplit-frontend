// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { getDatabyparams } from "../apiService/apiservice";
// import { endpoints } from "../api/api";
// import { useQuery } from "@tanstack/react-query";

// export default function ExpensesTab({ groupId }) {
//   const navigate = useNavigate();

//   const fetchGroupExpenses = async (groupid) => {
//     const response = await getDatabyparams(endpoints.expensesByGroupId, groupid);
//     return response.data;
//   };

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["groupExpenses", groupId],
//     queryFn: fetchGroupExpenses(groupId),
//   });
//   if (isLoading) {
//     return <p>Loading...</p>;
//   }
//   return (
//     <div className="space-y-4">
//       {data?.length > 0 &&
//         data?.map((expense) => (
//           <div key={expense.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow cursor-pointer" onClick={() => navigate(`/groups/${groupId}/expense/${expense.id}`)}>
//             <div className="flex items-center">
//               <div className="bg-gray-200 p-2 rounded-full mr-4">🛒</div>
//               <div>
//                 <h3 className="font-semibold">{expense.description}</h3>
//                 <p className="text-sm text-gray-600">{expense.date}</p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="font-semibold">
//                 {expense.currency} {expense.cost}
//               </p>
//               <p className="text-sm text-gray-600">{expense.paidBy} paid</p>
//             </div>
//           </div>
//         ))}
//     </div>
//   );
// }

import React from "react";
import { useNavigate } from "react-router-dom";
import { getDatabyparams } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import Loader from "./Loader";

export default function ExpensesTab({ groupId }) {
  const navigate = useNavigate();

  const fetchGroupExpenses = async () => {
    const response = await getDatabyparams(endpoints.expensesByGroupId, groupId);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["groupExpenses", groupId],
    queryFn: fetchGroupExpenses,
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader />
      </div>
    );
  }

  console.log("----Expenes list-Data-------", JSON.stringify(data));

  if (error) {
    return <div className="text-center py-4 text-red-500">An error occurred: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-500">No expenses found for this group.</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((expense) => (
        <div
          key={expense?.expenseId}
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => navigate(`/groups/${groupId}/expense/${expense?.expenseId}`, { state: { expenseId: expense?.expenseId, groupId: groupId } })}
        >
          <div className="flex items-center">
            <div className="bg-gray-200 p-2 rounded-full mr-4">🛒</div>
            <div>
              <h3 className="font-semibold">{expense?.expenseName}</h3>
              <p className="text-sm text-gray-600">{new Date(expense?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold"> ₹ {expense?.totalBill?.toFixed(2)}</p>
            <p className="text-sm text-gray-600">{expense?.paidByuserName} paid</p>
          </div>
        </div>
      ))}
    </div>
  );
}
