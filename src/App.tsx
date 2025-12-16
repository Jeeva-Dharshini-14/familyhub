import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import React from "react";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/onboarding/Onboarding";
import Dashboard from "./pages/dashboard/Dashboard";
import Finance from "./pages/finance/Finance";
import Tasks from "./pages/tasks/Tasks";
import Health from "./pages/health/Health";
import Kitchen from "./pages/kitchen/Kitchen";
import Study from "./pages/study/Study";
import Documents from "./pages/documents/Documents";
import Calendar from "./pages/calendar/Calendar";
import Trips from "./pages/trips/Trips";
import Wishlist from "./pages/wishlist/Wishlist";
import Memories from "./pages/memories/Memories";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Auth
import { authUtils } from "./lib/auth";
import { notificationService } from "./lib/notificationService";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authUtils.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

const App = () => {
  useEffect(() => {
    // Initialize notification service when app starts
    const initNotifications = async () => {
      if (authUtils.isAuthenticated()) {
        await notificationService.requestPermission();
        notificationService.start();
      }
    };
    
    initNotifications();
    
    // Cleanup on unmount
    return () => {
      notificationService.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              
              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="finance" element={<Finance />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="health" element={<Health />} />
                <Route path="kitchen" element={<Kitchen />} />
                <Route path="study" element={<Study />} />
                <Route path="documents" element={<Documents />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="trips" element={<Trips />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="memories" element={<Memories />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    
  );
};

export default App;
