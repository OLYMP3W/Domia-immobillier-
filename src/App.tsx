import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PWAInstallBanner } from "./hooks/usePWAInstall";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import OwnerDashboard from "./pages/OwnerDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import CreateProperty from "./pages/CreateProperty";
import EditProperty from "./pages/EditProperty";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Install from "./pages/Install";
import PublicProfile from "./pages/PublicProfile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/new" element={<CreateProperty />} />
              <Route path="/property/edit/:id" element={<EditProperty />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/dashboard/owner" element={<OwnerDashboard />} />
              <Route path="/dashboard/tenant" element={<TenantDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/install" element={<Install />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallBanner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
