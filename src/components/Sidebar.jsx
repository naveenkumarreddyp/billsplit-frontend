// import React from "react";
// import { NavLink } from "react-router-dom";
// import { navigationLinks } from "../data/navigationLinks";
// import * as Icons from "lucide-react";

// export default function Sidebar({ className = "" }) {
//   return (
//     <aside className={`bg-white w-64 h-full fixed left-0 top-16 bottom-0 shadow-md overflow-y-auto ${className}`}>
//       <nav className="flex flex-col h-full">
//         <ul className="flex-1 py-4">
//           {navigationLinks.map((link) => {
//             const Icon = Icons[link.icon];
//             return (
//               <li key={link.path}>
//                 <NavLink to={link.path} className={({ isActive }) => `flex items-center p-4 ${isActive ? "bg-gray-100" : ""}`}>
//                   <Icon className="w-6 h-6 mr-2" />
//                   {link.label}
//                 </NavLink>
//               </li>
//             );
//           })}
//         </ul>
//         <div className="p-4 mt-auto">
//           <button className="flex items-center text-red-500 p-2">
//             <Icons.LogOut className="w-6 h-6 mr-2" />
//             Logout
//           </button>
//         </div>
//       </nav>
//     </aside>
//   );
// }

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, UserPlus, Settings, Activity, LogOut } from "lucide-react";
import { getData } from "../apiService/apiservice";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "../api/api";
import toast from "react-hot-toast";
import { clearUser } from "../redux/authSlice";
import { useDispatch } from "react-redux";

const navigationLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/groups", label: "Groups", icon: Users },
  { path: "/friends", label: "Friends", icon: UserPlus },
  { path: "/activity", label: "Activity", icon: Activity },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ className = "" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: logout, isLoading: apiLoading } = useMutation({
    mutationFn: () => getData(endpoints.logout),
    onError: (error) => {
      if (error.response?.status === 401) {
        toast.error("Something went wrong");
      } else {
        console.log(error);
      }
    },
    onSuccess: (result) => {
      if (result?.statuscode === 200) {
        dispatch(clearUser());
        toast.success(result?.message);
        navigate("/login");
      } else {
        toast.error(result?.message);
      }
    },
  });

  const handleLogout = () => {
    // console.log("-----logout triggered-----");
    logout();
  };
  return (
    <aside className={`bg-white w-64 h-full fixed left-0 top-16 bottom-0 shadow-md overflow-y-auto ${className}`}>
      <nav className="flex flex-col h-full">
        <ul className="flex-1 py-4">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.path}>
                <NavLink to={link.path} className={({ isActive }) => `flex items-center p-4 ${isActive ? "bg-gray-100 text-blue-700" : ""}`}>
                  <Icon className="w-6 h-6 mr-2" />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
        <div className="pb-20 ml-2 ">
          <button onClick={handleLogout} className="flex items-center text-red-500 p-4  hover:bg-gray-100 w-full">
            <LogOut className="w-6 h-6 mr-2" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
