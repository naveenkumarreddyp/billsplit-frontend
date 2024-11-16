import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, User, Loader } from "lucide-react";
import { getDatabyparams, postData } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import { useSelector } from "react-redux";

export default function FriendRequests() {
  const [pendingActions, setPendingActions] = useState({});
  const queryClient = useQueryClient();
  const observerRef = useRef(null);
  const userId = useSelector((state) => state.auth?.user?.userId);

  const fetchFriendRequests = async ({ pageParam = 0 }) => {
    const response = await postData(endpoints.getfrndRequests, {
      userId,
      page: pageParam,
    });
    return response.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ["friendRequests", userId],
    queryFn: fetchFriendRequests,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (data) => postData(endpoints.updateFriendRequest, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      setPendingActions((prev) => ({ ...prev, [variables.requestId]: false }));
    },
    onError: (_, variables) => {
      setPendingActions((prev) => ({ ...prev, [variables.requestId]: false }));
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

  const handleAction = (id, action) => {
    if (!pendingActions[id]) {
      setPendingActions((prev) => ({ ...prev, [id]: true }));
      mutation.mutate({ requestId: id, status: action });
    }
  };

  const friendRequestsData = data?.pages.flatMap((page) => page.friendRequests) || [];

  //if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (error) return <div className="text-red-500 text-center">An error occurred: {error.message}</div>;
  if (!friendRequestsData?.length > 0) {
    return <div className="text-center py-4 text-gray-500">No friend requests found.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 md:max-w-lg lg:max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Friend Requests</h1>
      {isLoading && (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      )}
      <div className="space-y-4">
        {!isLoading &&
          friendRequestsData?.map((request) => (
            <div key={request.friendRequestId} className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
              <User />
              <div className="flex-grow">
                <h2 className="font-semibold">{request.user1Email}</h2>
              </div>
              <div className="flex space-x-2">
                {pendingActions[request.friendRequestId] ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(request.friendRequestId, "accepted")}
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                      disabled={pendingActions[request.friendRequestId]}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleAction(request.friendRequestId, "rejected")}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                      disabled={pendingActions[request.friendRequestId]}
                    >
                      <XCircle size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
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
