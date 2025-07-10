import React from "react";
import "./RoleSelector.css";

export default function RoleSelector({ role, setRole }) {
  return (
    <div>
      <h2>Who are you?</h2>
      <div className="role-buttons">
        <button
          className={`role-button ${role === "athlete" ? "selected" : ""}`}
          onClick={() => setRole("athlete")}
        >
          Athlete
        </button>
        <button
          className={`role-button ${role === "coach" ? "selected" : ""}`}
          onClick={() => setRole("coach")}
        >
          Coach
        </button>
      </div>
    </div>
  );
}
