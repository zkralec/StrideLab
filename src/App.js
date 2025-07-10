import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile, saveUserProfile } from "./utils/firestore";
import AthleteOnboarding from "./components/AthleteOnboarding";
import AthleteDashboard from "./components/AthleteDashboard";
import CoachDashboard from "./components/CoachDashboard";
import AuthForm from "./components/AuthForm";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const fetchedProfile = await getUserProfile(user.uid);
        if (!fetchedProfile) {
          setNeedsRoleSelection(true);
        } else {
          setProfile(fetchedProfile);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleSelect = async (role) => {
    await saveUserProfile(auth.currentUser.uid, { role });
    const fetchedProfile = await getUserProfile(auth.currentUser.uid);
    setProfile(fetchedProfile);
    setNeedsRoleSelection(false);
  };

  const handleProfileComplete = async () => {
    const fetchedProfile = await getUserProfile(auth.currentUser.uid);
    setProfile(fetchedProfile);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <AuthForm />;

  if (needsRoleSelection) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>Select Your Role</h2>
        <button onClick={() => handleRoleSelect("athlete")}>I'm an Athlete</button>
        <button onClick={() => handleRoleSelect("coach")}>I'm a Coach</button>
      </div>
    );
  }

  if (profile?.role === "athlete" && (!profile.age || !profile.events || profile.events.length === 0)) {
    return <AthleteOnboarding onComplete={handleProfileComplete} />;
  }

  if (profile?.role === "athlete") {
    return <AthleteDashboard profile={profile} />;
  }

  if (profile?.role === "coach") {
    return <CoachDashboard athletes={profile.athletes || []} setAthletes={() => {}} />;
  }

  return <div>Unknown role. Please contact support.</div>;
}

export default App;
