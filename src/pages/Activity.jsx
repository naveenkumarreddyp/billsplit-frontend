// import React from "react";
// import ComingSoon from "../components/ComingSoon";

// const Activity = () => {
//   return <ComingSoon pageName="Activity" />;
// };

// export default Activity;

import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, RotateCcw, User } from "lucide-react";
import { getDatabyparams, postData } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import { useSelector } from "react-redux";

// // Dummy API functions
// const fetchFriendRequests = async ({ pageParam = 0 }) => {
//   // Simulate API call
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   const pageSize = 10;
//   const startIndex = pageParam * pageSize;
//   const endIndex = startIndex + pageSize;
//   const requests = Array.from({ length: pageSize }, (_, i) => ({
//     id: `request-${startIndex + i + 1}`,
//     name: `User ${startIndex + i + 1}`,
//     avatar: `https://i.pravatar.cc/150?img=${startIndex + i + 1}`,
//   }));
//   return {
//     requests,
//     nextPage: endIndex < 100 ? pageParam + 1 : undefined,
//   };
// };

// const updateFriendRequests = async (actions) => {
//   // Simulate API call
//   await new Promise((resolve) => setTimeout(resolve, 500));
//   console.log("Friend request actions:", actions);
//   return { success: true };
// };

export default function FriendRequests() {
  const [pendingActions, setPendingActions] = useState({
    accepted: [],
    rejected: [],
  });
  const queryClient = useQueryClient();
  const observerRef = useRef(null);
  const userId = useSelector((state) => state.auth?.user?.userId);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ["friendRequests"],
    queryFn: ({ pageParam = 0 }) => getDatabyparams(endpoints.getfrndRequests, userId),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  const mutation = useMutation({
    mutationFn: (data) => postData(endpoints.updateFriendRequest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // useEffect(() => {
  //   // console.log(pendingActions)
  //   return () => {
  //     // Send pending actions on unmount
  //     console.log(pendingActions);
  //     if (pendingActions.accepted.length > 0 || pendingActions.rejected.length > 0) {
  //       const actionsToSend = [
  //         { status: "accepted", requestIds: pendingActions.accepted },
  //         { status: "rejected", requestIds: pendingActions.rejected },
  //       ].filter((action) => action.requestIds.length > 0);

  //       mutation.mutate(actionsToSend);
  //     }
  //   };
  // }, []);
  // pendingActions.accepted.length,  pendingActions.rejected.length add in useEffect above dependency

  const handleAction = (id, action) => {
    //-------------------------------------------
    mutation.mutate({ requestId: id, status: action });
    //----------------------------------------------

    // setPendingActions((prev) => {
    //   const newState = {
    //     accepted: [...prev.accepted],
    //     rejected: [...prev.rejected],
    //   };

    //   if (action === "accept") {
    //     newState.accepted = newState.accepted.includes(id) ? newState.accepted.filter((reqId) => reqId !== id) : [...newState.accepted, id];
    //     newState.rejected = newState.rejected.filter((reqId) => reqId !== id);
    //   } else if (action === "reject") {
    //     newState.rejected = newState.rejected.includes(id) ? newState.rejected.filter((reqId) => reqId !== id) : [...newState.rejected, id];
    //     newState.accepted = newState.accepted.filter((reqId) => reqId !== id);
    //   }
    // else {
    //   // Undo action
    //   newState.accepted = newState.accepted.filter((reqId) => reqId !== id);
    //   newState.rejected = newState.rejected.filter((reqId) => reqId !== id);
    // }

    //   return newState;
    // });
  };

  const getRequestStatus = (id) => {
    if (pendingActions.accepted.includes(id)) return "accepted";
    if (pendingActions.rejected.includes(id)) return "rejected";
    return null;
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">An error occurred: {error.message}</div>;
  if (!data?.pages?.[0]?.data?.length) {
    return <div className="text-center py-4 text-gray-500">No friend requests found.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 md:max-w-lg lg:max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Friend Requests</h1>
      <div className="space-y-4">
        {data?.pages?.map((page, i) => (
          <React.Fragment key={i}>
            {page?.data?.map((request) => {
              const status = getRequestStatus(request.friendRequestId);
              return (
                <div key={request.friendRequestId} className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
                  {/* <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-full" /> */}
                  <User />
                  <div className="flex-grow">
                    <h2 className="font-semibold">{request.user1Email}</h2>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleAction(request.friendRequestId, "accepted")} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                      <CheckCircle size={20} />
                    </button>
                    <button onClick={() => handleAction(request.friendRequestId, "rejected")} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                      <XCircle size={20} />
                    </button>
                    {/** 
                    {status ? (
                      <button onClick={() => handleAction(request.friendRequestId, undefined)} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                        <RotateCcw size={20} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleAction(request.friendRequestId, "accept")} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => handleAction(request.friendRequestId, "reject")} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                          <XCircle size={20} />
                        </button>
                      </>
                    )}
                      */}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {hasNextPage && (
        <div ref={observerRef} className="h-10 flex items-center justify-center mt-4">
          {isFetchingNextPage ? "Loading more..." : ""}
        </div>
      )}
    </div>
  );
}
