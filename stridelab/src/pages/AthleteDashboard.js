import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/AthleteDashboard.css";

export default function AthleteDashboard() {
  const [userData, setUserData] = useState(null);
  const [includeWeights, setIncludeWeights] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleGenerate = (duration) => {
    navigate(`/plan?duration=${duration}&weights=${includeWeights}`);
  };

  if (!userData) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to StrideLab</h1>
        <button className="settings-button" onClick={() => navigate("/settings")}>
          Settings
        </button>
      </div>

      <div className="dashboard-content">
        <p>Select an option to generate your workout plan:</p>

        <div className="plan-buttons">
          <button onClick={() => handleGenerate(1)}>1 Week Plan</button>
          <button onClick={() => handleGenerate(2)}>2 Week Plan</button>
          <button onClick={() => handleGenerate(4)}>4 Week Plan</button>
        </div>

        <div className="weights-toggle">
          <label>
            <input
              type="checkbox"
              checked={includeWeights}
              onChange={(e) => setIncludeWeights(e.target.checked)}
            />
            Include Weight Training
          </label>
        </div>
      </div>
    </div>
  );
}
