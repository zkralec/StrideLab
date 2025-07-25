import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AthleteSignup from "./pages/AthleteSignup";
import AthleteOnboarding from "./pages/AthleteOnboarding";
import AthleteDashboard from "./pages/AthleteDashboard";
import AthleteSettings from "./pages/AthleteSettings";
import PlanGenerator from "./components/PlanGenerator";
import ForgotPassword from "./pages/ForgotPassword";
import InviteManager from "./pages/InviteManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<AthleteSignup />} />
        <Route path="/onboarding" element={<AthleteOnboarding />} />
        <Route path="/dashboard" element={<AthleteDashboard />} />
        <Route path="/settings" element={<AthleteSettings />} />
        <Route path="/plan" element={<PlanGenerator />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/manage-invites" element={<InviteManager />} />
      </Routes>
    </Router>
  );
}

export default App;
