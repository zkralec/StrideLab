import React, { useState } from "react";
import EventSelector from "./EventSelector";
import { saveCoachAthletes } from "../utils/firestore";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function CoachDashboard({ athletes, setAthletes }) {
  const [newName, setNewName] = useState("");

  const addAthlete = () => {
    if (!newName.trim()) return;
    const updated = [
      ...athletes,
      {
        id: Date.now(),
        name: newName.trim(),
        events: [],
      },
    ];
    setAthletes(updated);
    saveCoachAthletes(auth.currentUser.uid, updated);
    setNewName("");
  };

  const updateAthleteEvents = (id, newEvents) => {
    const updated = athletes.map((ath) =>
      ath.id === id ? { ...ath, events: newEvents } : ath
    );
    setAthletes(updated);
    saveCoachAthletes(auth.currentUser.uid, updated);
  };

  return (
    <div>
      <h2>Coach Dashboard</h2>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Athlete name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={addAthlete}>Add Athlete</button>
      </div>

      {athletes.map((athlete) => (
        <div key={athlete.id} style={{ marginBottom: "2rem" }}>
          <h3>{athlete.name}</h3>
          <EventSelector
            selectedEvents={athlete.events}
            setSelectedEvents={(evts) =>
              updateAthleteEvents(athlete.id, evts)
            }
          />
        </div>
      ))}

      <pre>{JSON.stringify(athletes, null, 2)}</pre>
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
}
