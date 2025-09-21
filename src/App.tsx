import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// --- FIX: requiredRole is now typed with the uppercase UserRole ---
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: UserRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // --- FIX: Show a loading state while authentication is being checked ---
  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // --- FIX: The comparison now works correctly with uppercase roles ---
  if (requiredRole && user?.role !== requiredRole) {
    // If roles don't match, redirect to their correct dashboard
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/citizen'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/citizen'} replace /> : <Login />} />
      <Route path="/citizen/*" element={<ProtectedRoute requiredRole="CITIZEN"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
