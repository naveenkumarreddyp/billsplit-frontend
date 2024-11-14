import React, { useEffect, useRef, useState, useCallback } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Filter, ChevronDown } from "lucide-react";
import Loader from "../components/Loader";
import { postData } from "../apiService/apiservice";
import { endpoints } from "../api/api";
import { useSelector } from "react-redux";
import { debounce } from "lodash";

export default function Groups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const authUser = useSelector((state) => state.auth?.user);
  const queryClient = useQueryClient();

  const fetchGroups = async ({ pageParam = 0 }) => {
    const response = await postData(endpoints.fetchGroups, {
      userId: authUser?.userId,
      filter: filter,
      page: pageParam,
      searchTerm,
      limit: 10, // Adjust this value as needed
    });
    return response.data;
  };

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error, refetch } = useInfiniteQuery({
    queryKey: ["groups", filter, authUser?.userId, searchTerm],
    queryFn: fetchGroups,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!authUser?.userId,
  });

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      if (value.length > 0) {
        queryClient.resetQueries(["groups"]);
      }
    }, 500),
    [queryClient]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchTerm("");
    queryClient.resetQueries(["groups"]);
  };

  const filteredGroups = data?.pages.flatMap((page) => page.groups) || [];

  const renderGroupCard = useCallback(
    (group) => {
      const userBalance = group.groupUsers.find((user) => user.userId === authUser?.userId)?.balance || 0;
      const totalExpense = group.groupAmount || 0;

      return (
        <div key={group.groupId} className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer flex justify-between items-center" onClick={() => navigate(`/groups/${group.groupId}`)}>
          <div>
            <h3 className="text-lg font-semibold">{group.groupName}</h3>
            <p className="text-sm text-gray-600">{group.totalNumberofUsers} members</p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${userBalance < 0 ? "text-red-500" : "text-green-500"} font-semibold`}>
              {userBalance < 0 ? `You owe: ₹${Math.abs(userBalance).toFixed(2)}` : `Owed to you: ₹${userBalance.toFixed(2)}`}
            </p>
            <p className="text-sm text-gray-600">Total: ₹{totalExpense.toFixed(2)}</p>
          </div>
        </div>
      );
    },
    [authUser?.userId, navigate]
  );

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    refetch();
  }, [filter, refetch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button onClick={() => navigate("/groups/create")} className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Group
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input type="text" placeholder="Search groups..." className="w-full p-2 pl-10 pr-10 border rounded-md" value={inputValue} onChange={handleInputChange} />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          {inputValue && (
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" onClick={clearSearch} aria-label="Clear search">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="relative">
          <button className="p-2 border rounded-md flex items-center" onClick={() => setShowFilterMenu(!showFilterMenu)} aria-label="Filter groups">
            <Filter size={20} className="mr-2" />
            <span className="hidden md:inline">{filter === "all" ? "All Groups" : filter === "owe" ? "Groups You Owe" : "Groups That Owe You"}</span>
            <ChevronDown size={20} className="ml-2" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setFilter("all");
                  setShowFilterMenu(false);
                }}
              >
                All Groups
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setFilter("owe");
                  setShowFilterMenu(false);
                }}
              >
                Groups You Owe
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setFilter("owed");
                  setShowFilterMenu(false);
                }}
              >
                Groups That Owe You
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Loader />
        </div>
      )}
      {error && <div className="text-center py-4 text-red-500">An error occurred: {error.message}</div>}
      {filteredGroups.map(renderGroupCard)}

      {hasNextPage && (
        <div ref={observerRef} className="h-10 flex items-center justify-center">
          {isFetchingNextPage ? <Loader /> : ""}
        </div>
      )}
    </div>
  );
}
