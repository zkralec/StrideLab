import React, { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const FOCUS_OPTIONS = [
  "Explosive Power",
  "Speed Endurance",
  "Stamina",
  "Strength",
  "Injury Prevention",
  "Acceleration",
  "Top-end Speed",
  "Mobility / Flexibility",
  "Event Technique Focus",
];

export default function AthleteDashboard({ profile }) {
  const [planLength, setPlanLength] = useState("1 week");
  const [customFocus, setCustomFocus] = useState(profile.focusAreas || []);
  const [generatedPlan, setGeneratedPlan] = useState("");

  const toggleFocus = (focus) => {
    setCustomFocus((prev) =>
      prev.includes(focus)
        ? prev.filter((f) => f !== focus)
        : [...prev, focus]
    );
  };

  const handleGenerate = async () => {
    const payload = {
      name: profile.name || "Athlete",
      age: profile.age,
      gender: profile.gender,
      experience: profile.experience,
      events: profile.events,
      focusAreas: customFocus,
      duration: planLength,
    };

    try {
      const res = await fetch("http://localhost:5000/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setGeneratedPlan(data.plan);
    } catch (err) {
      console.error("Failed to generate plan:", err);
      setGeneratedPlan("Error generating plan. Please try again.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Welcome, {profile.name || "Athlete"}!</h2>
      <p><strong>Age:</strong> {profile.age}</p>
      <p><strong>Gender:</strong> {profile.gender}</p>
      <p><strong>Experience:</strong> {profile.experience}</p>
      <p><strong>Events:</strong> {profile.events.join(", ")}</p>

      <hr style={{ margin: "2rem 0" }} />

      <h3>Generate a New Training Plan</h3>

      <label><strong>Plan Length:</strong></label>
      <select
        value={planLength}
        onChange={(e) => setPlanLength(e.target.value)}
        style={{ marginLeft: "0.5rem" }}
      >
        <option value="1 week">1 Week</option>
        <option value="2 weeks">2 Weeks</option>
        <option value="4 weeks">4 Weeks</option>
      </select>

      <div style={{ marginTop: "1rem" }}>
        <label><strong>Focus Areas:</strong></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          {FOCUS_OPTIONS.map((focus) => (
            <button
              key={focus}
              onClick={() => toggleFocus(focus)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                border: customFocus.includes(focus) ? "2px solid #007bff" : "1px solid #ccc",
                background: customFocus.includes(focus) ? "#e6f0ff" : "white",
                cursor: "pointer",
              }}
            >
              {focus}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        style={{ marginTop: "2rem", padding: "0.75rem 1.5rem", fontWeight: "bold" }}
      >
        Generate Plan
      </button>

      {generatedPlan && (
        <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
          <h4>Generated Plan</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>{generatedPlan}</pre>
        </div>
      )}

      <div style={{ marginTop: "3rem" }}>
        <button onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    </div>
  );
}
