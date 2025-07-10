import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/AthleteOnboarding.css";

const allEvents = {
  "Sprints": ["60m", "100m", "200m", "400m"],
  "Hurdles": ["60m Hurdles", "100m Hurdles", "110m Hurdles", "400m Hurdles"],
  "Middle Distance": ["800m", "1500m", "1600m"],
  "Distance": ["3000m", "3200m", "5000m", "10000m"],
  "Relays": ["4x100m", "4x200m", "4x400m", "4x800m", "DMR", "SMR"],
  "Jumps": ["Long Jump", "Triple Jump", "High Jump", "Pole Vault"],
  "Throws": ["Shot Put", "Discus", "Javelin", "Hammer"],
};

const goalOptions = [
  "Explosive Power", "Stamina", "Speed Endurance",
  "Injury Prevention", "Mobility", "Strength",
  "Recovery Focused", "Event-Specific Training",
  "Top Speed"
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Onboarding() {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [goals, setGoals] = useState([]);
  const navigate = useNavigate();

  const toggleSelection = (item, state, setter) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      onboardingComplete: true,
      events: selectedEvents,
      availability,
      goals
    }, { merge: true });

    navigate("/dashboard");
  };

  return (
    <div className="onboarding-container">
      <h2>Tell us about your training</h2>
      <form onSubmit={handleSubmit}>
        {/* Events */}
        <div className="section">
          <h3>Select Your Events:</h3>
          {Object.entries(allEvents).map(([group, events]) => (
            <div key={group} className="subsection">
              <strong>{group}</strong>
              <div className="button-grid">
                {events.map((event) => (
                  <button
                    type="button"
                    key={event}
                    className={`selectable-button ${selectedEvents.includes(event) ? "selected" : ""}`}
                    onClick={() => toggleSelection(event, selectedEvents, setSelectedEvents)}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div className="section">
          <h3>What Days Are You Available to Train?</h3>
          <div className="button-grid">
            {daysOfWeek.map((day) => (
              <button
                type="button"
                key={day}
                className={`selectable-button ${availability.includes(day) ? "selected" : ""}`}
                onClick={() => toggleSelection(day, availability, setAvailability)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="section">
          <h3>Your Training Goals:</h3>
          <div className="button-grid">
            {goalOptions.map((goal) => (
              <button
                type="button"
                key={goal}
                className={`selectable-button ${goals.includes(goal) ? "selected" : ""}`}
                onClick={() => toggleSelection(goal, goals, setGoals)}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Finish Setup
        </button>
      </form>
    </div>
  );
}
