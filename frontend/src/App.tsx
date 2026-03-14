import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/AppContext";
import { LobbyProvider } from "@/hooks/useLobby";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Generating from "./pages/Generating";
import Lobby from "./pages/Lobby";
import Play from "./pages/Play";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { username, isOnboarded } = useApp();

  return (
    <LobbyProvider username={isOnboarded ? username : ""}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/generating" element={<Generating />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/play" element={<Play />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LobbyProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
