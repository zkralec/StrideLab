import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/AthleteSettings.css";

const allEvents = {
  Sprints: ["60m", "100m", "200m", "400m"],
  Hurdles: ["60m Hurdles", "100m Hurdles", "110m Hurdles", "400m Hurdles"],
  "Middle Distance": ["800m", "1500m", "1600m"],
  Distance: ["3000m", "3200m", "5000m", "10000m"],
  Relays: ["4x100m", "4x200m", "4x400m", "4x800m", "DMR", "SMR"],
  Jumps: ["Long Jump", "Triple Jump", "High Jump", "Pole Vault"],
  Throws: ["Shot Put", "Discus", "Javelin", "Hammer"],
};

const goalOptions = [
  "Explosive Power", "Stamina", "Speed Endurance",
  "Injury Prevention", "Mobility", "Strength",
  "Recovery Focused", "Event-Specific Training", "Top Speed"
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AthleteSettings() {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setName(data.name || "");
        setAge(data.age || "");
        setEvents(data.events || []);
        setAvailability(data.availability || []);
        setGoals(data.goals || []);
      }
    };

    fetchUserData();
  }, []);

  const toggleSelection = (item, state, setter) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      name,
      age,
      events,
      availability,
      goals
    }, { merge: true });

    navigate("/dashboard");
  };

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>

      <div className="settings-section">
        <label>Name:</label>
        <input
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="settings-section">
        <label>Age:</label>
        <input
          type="number"
          value={age}
          placeholder="Enter your age"
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      <div className="settings-section">
        <h3>Events</h3>
        {Object.entries(allEvents).map(([group, list]) => (
          <div key={group} className="subsection">
            <strong>{group}</strong>
            <div className="button-grid">
              {list.map((event) => (
                <button
                  type="button"
                  key={event}
                  className={`selectable-button ${events.includes(event) ? "selected" : ""}`}
                  onClick={() => toggleSelection(event, events, setEvents)}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h3>Availability</h3>
        <div className="button-grid">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              type="button"
              className={`selectable-button ${availability.includes(day) ? "selected" : ""}`}
              onClick={() => toggleSelection(day, availability, setAvailability)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Goals</h3>
        <div className="button-grid">
          {goalOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              className={`selectable-button ${goals.includes(goal) ? "selected" : ""}`}
              onClick={() => toggleSelection(goal, goals, setGoals)}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <button className="submit-button" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
