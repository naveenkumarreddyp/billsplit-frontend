import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { postData, getDatabyparams } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import { useQuery } from "@tanstack/react-query";

export default function BalancesTab({ groupDetails }) {
  const [openUserId, setOpenUserId] = useState(null);

  const fetchUserOweorOwedDetails = async (groupId, userId) => {
    const response = await postData(endpoints.userOweorOwed, { groupId, userId });
    return response.data;
  };

  const {
    data: usersOwesDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["UserOweorOwed", groupDetails?.groupId, openUserId],
    queryFn: () => fetchUserOweorOwedDetails(groupDetails?.groupId, openUserId),
    enabled: !!openUserId,
  });

  const handleChevronClick = (userId) => {
    if (openUserId === userId) {
      setOpenUserId(null);
    } else {
      setOpenUserId(userId);
      // refetch();
    }
  };

  return (
    <div className="space-y-4">
      {groupDetails?.groupUsers?.length > 0 &&
        groupDetails?.groupUsers.map((groupUser) => (
          <div key={groupUser?.userId} className="bg-gray-800 text-white p-4 rounded-lg">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => handleChevronClick(groupUser?.userId)}>
              <p className="text-lg font-semibold">
                {groupUser?.balance > 0 ? `${groupUser?.userName} gets back ₹ ${Math.abs(groupUser?.balance)} in total` : `${groupUser?.userName} owes ₹ ${Math.abs(groupUser?.balance)} in total`}
              </p>
              <span>{openUserId === groupUser?.userId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </div>
            {openUserId === groupUser?.userId && (
              <div className="mt-2 space-y-2">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {usersOwesDetails?.map(
                  (owesUser) =>
                    groupUser?.userId !== owesUser?.userId && (
                      <div key={owesUser?.userId} className="flex justify-between items-center">
                        <span>{owesUser.userName}</span>
                        {owesUser.balance > 0 ? <span className="text-green-400">₹ {Math.abs(owesUser.balance)}</span> : <span className="text-red-400">₹ {Math.abs(owesUser.balance)}</span>}
                      </div>
                    )
                )}

                <div className="flex justify-end space-x-2 mt-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm">Remind</button>
                  <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm">Settle up</button>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
