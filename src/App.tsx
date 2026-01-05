import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LinkInterceptor } from "@/components/LinkInterceptor";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import OwnerDashboard from "./pages/OwnerDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import CreateProperty from "./pages/CreateProperty";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <LinkInterceptor />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/new" element={<CreateProperty />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/dashboard/owner" element={<OwnerDashboard />} />
            <Route path="/dashboard/tenant" element={<TenantDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

