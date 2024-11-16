import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./components/AuthProvider";
import { useSelector } from "react-redux";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import ExpenseDetails from "./pages/ExpenseDetails";
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import Activity from "./pages/Activity";
import AddGroupPage from "./pages/AddGroupPage";
import AddExpense from "./pages/AddExpense";
import AddFriend from "./pages/AddFriends";
import LoginPage from "./pages/Login";
import RegisterForm from "./pages/Register";
import PageNotFound from "./pages/PageNotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => {
    //console.log("----State Auth-----", state.auth);
    return state.auth;
  });
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AuthProvider>
                      <Layout />
                    </AuthProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/create" element={<AddGroupPage />} />
                <Route path="groups/:groupId" element={<GroupDetails />} />
                <Route path="groups/:groupId/expense/:expenseId" element={<ExpenseDetails />} />
                <Route path="groups/:groupId/createexpense" element={<AddExpense />} />
                <Route path="friends" element={<Friends />} />
                <Route path="friends/addfriend" element={<AddFriend />} />
                <Route path="settings" element={<Settings />} />
                <Route path="activity" element={<Activity />} />
              </Route>

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterForm />
                  </PublicRoute>
                }
              />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Toaster position="top-center" />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
