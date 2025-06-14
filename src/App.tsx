import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Pages
import Login from "./pages/Login";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import Courses from "./pages/Courses";
import DietPlans from "./pages/DietPlans";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Utils
import { initializeSampleData, getAuthState } from "./lib/storage";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);

  const authState = getAuthState();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to appropriate page based on auth */}
            <Route
              path="/"
              element={
                authState.isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Login page */}
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Default dashboard route goes to members */}
              <Route index element={<Members />} />
              <Route path="members" element={<Members />} />
              <Route path="add-member" element={<AddMember />} />
              <Route path="courses" element={<Courses />} />
              <Route path="diet-plans" element={<DietPlans />} />
              <Route path="inventory" element={<Inventory />} />
            </Route>

            {/* Catch all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
