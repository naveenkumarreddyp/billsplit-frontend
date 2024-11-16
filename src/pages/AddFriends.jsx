import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { postData } from "../apiService/apiservice";
import { endpoints } from "../api/api";

export default function AddFriend() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notificationMethod, setNotificationMethod] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authUser = useSelector((state) => state.auth?.user);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      let response = await postData(endpoints?.addFriend, data);
      return response;
    },
    onSuccess: (responseData) => {
      if (!responseData?.success) {
        toast.error(responseData?.message);
      } else {
        toast.success("Friend added successfully!");
        navigate("/friends");
      }
    },
    onError: () => {
      toast.error("Failed to add friend. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (notificationMethod.length === 0) {
      toast.error("Please select at least one notification method");
      return;
    }
    mutate({ user1Id: authUser?.userId, user2Name: name, user2Email: email, requestMethod: notificationMethod });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/friends")} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Add Friend</h1>
        <div className="w-8"></div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit phone number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notification Method</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                value="sms"
                checked={notificationMethod.includes("sms")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setNotificationMethod([...notificationMethod, "sms"]);
                  } else {
                    setNotificationMethod(notificationMethod.filter((m) => m !== "sms"));
                  }
                }}
                className="mr-2"
              />
              SMS
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                value="email"
                checked={notificationMethod.includes("email")}
                onChange={(e) => {
                  if (e.target.checked) {
                    setNotificationMethod([...notificationMethod, "email"]);
                  } else {
                    setNotificationMethod(notificationMethod.filter((m) => m !== "email"));
                  }
                }}
                className="mr-2"
              />
              Email
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
        >
          {isPending ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Adding...
            </>
          ) : (
            "Add Friend"
          )}
        </button>
      </form>
    </div>
  );
}
