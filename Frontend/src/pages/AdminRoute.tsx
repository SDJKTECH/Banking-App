import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

// Render a route guard component that restricts access exclusively to admin users
export const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // Extract user session data, authentication status, and auth loading state
  const { user, isAuthenticated, isLoading } = useAuth();

  // Render a centered loading spinner while session verification is in progress
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect unauthenticated visitors to the login screen and replace history entry
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect authenticated non-admin users to the standard customer dashboard
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Render protected admin children components if verification succeeds
  return children;
};