import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Finance from "./pages/Finance";
import Wellness from "./pages/Wellness";
import Skills from "./pages/Skills";
import Fitness from "./pages/Fitness";
import Progress from "./pages/Progress";
import Professionals from "./pages/Professionals";
import BecomeProfessional from "./pages/BecomeProfessional";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ConsultationChat from "./pages/ConsultationChat";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import EmergencyContacts from "./pages/EmergencyContacts";
import EmergencyAlert from "./pages/EmergencyAlert";
import SafetyMonitoring from "./pages/SafetyMonitoring";
import VoiceSettings from "./pages/VoiceSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/become-professional" element={<BecomeProfessional />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/consultation/:id" element={<ConsultationChat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/emergency-alert" element={<EmergencyAlert />} />
          <Route path="/safety-monitoring" element={<SafetyMonitoring />} />
          <Route path="/voice-settings" element={<VoiceSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
