import React, { useState } from "react";
import { saveUserProfile } from "../utils/firestore";
import { auth } from "../firebase";

export default function AthleteOnboarding({ onComplete }) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [events, setEvents] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);

  const categories = {
    "Short Sprints": ["60m", "100m", "200m"],
    "Long Sprints": ["300m", "400m"],
    "Hurdles": ["60mh", "100mh", "110mh", "400mh"],
    "Mid Distance": ["800m", "1000m", "1500m"],
    "Distance": ["1600m", "3200m", "5k", "10k", "Steeplechase"],
    "Vertical Jumps": ["High Jump", "Pole Vault"],
    "Horizontal Jumps": ["Long Jump", "Triple Jump"],
    "Throws": ["Shot Put", "Discus", "Javelin", "Hammer", "Weight"]
  };

  const focusOptions = [
    "Explosive Power",
    "Speed Endurance",
    "Stamina",
    "Strength",
    "Injury Prevention",
    "Acceleration",
    "Top-end Speed",
    "Mobility / Flexibility",
    "Event Technique Focus"
  ];

  const toggleEvent = (event) => {
    if (events.includes(event)) {
      setEvents(events.filter((e) => e !== event));
    } else {
      setEvents([...events, event]);
    }
  };

  const toggleFocus = (focus) => {
    if (focusAreas.includes(focus)) {
      setFocusAreas(focusAreas.filter((f) => f !== focus));
    } else {
      setFocusAreas([...focusAreas, focus]);
    }
  };

  const handleSubmit = async () => {
    if (!age || !gender || events.length === 0) {
      alert("Please complete all required fields and select at least one event.");
      return;
    }

    await saveUserProfile(auth.currentUser.uid, {
      role: "athlete",
      age,
      gender,
      events,
      focusAreas
    });

    onComplete();
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Set Up Your Athlete Profile</h2>

      <label>Age:</label>
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <br />

      <label>Gender:</label>
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">-- Select --</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="nonbinary">Non-Binary</option>
        <option value="preferNot">Prefer not to say</option>
      </select>

      <h3>Select Your Events</h3>
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} style={{ marginBottom: "1rem" }}>
          <strong>{category}</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px" }}>
            {items.map((event) => (
              <button
                key={event}
                onClick={() => toggleEvent(event)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: events.includes(event) ? "2px solid black" : "1px solid gray",
                  backgroundColor: events.includes(event) ? "#d0f0d0" : "white",
                  cursor: "pointer"
                }}
              >
                {event}
              </button>
            ))}
          </div>
        </div>
      ))}

      <h3>Focus Areas (Optional)</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {focusOptions.map((focus) => (
          <button
            key={focus}
            onClick={() => toggleFocus(focus)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: focusAreas.includes(focus) ? "2px solid black" : "1px solid gray",
              backgroundColor: focusAreas.includes(focus) ? "#d0e0ff" : "white",
              cursor: "pointer"
            }}
          >
            {focus}
          </button>
        ))}
      </div>

      <button onClick={handleSubmit} style={{ marginTop: "1.5rem" }}>
        Continue
      </button>
    </div>
  );
}