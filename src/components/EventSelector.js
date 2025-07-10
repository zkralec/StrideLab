import React, { useState } from "react";
import "./EventSelector.css"; // optional styling

const EVENT_OPTIONS = [
  {
    label: "Short Sprints",
    description: "60m, 100m, 200m"
  },
  {
    label: "Long Sprints",
    description: "300m, 400m"
  },
  {
    label: "Mid Distance",
    description: "600m, 800m, 1000m"
  },
  {
    label: "Distance",
    description: "1500m, 3K, 5K, XC"
  },
  {
    label: "High Jump",
    description: "High Jump"
  },
  {
    label: "Pole Vault",
    description: "Pole Vault"
  },
  {
    label: "Long Jump",
    description: "Long Jump"
  },
  {
    label: "Triple Jump",
    description: "Triple Jump"
  },
  {
    label: "Javelin",
    description: "Javelin Throw"
  },
  {
    label: "Shot Put",
    description: "Shot Put"
  },
  {
    label: "Discus",
    description: "Discus Throw"
  },
  {
    label: "Hammer Throw",
    description: "Hammer/Weight Throw"
  }
];

export default function EventSelector({ selectedEvents, setSelectedEvents }) {
  const toggleEvent = (event) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  return (
    <div>
      <h2>Select Your Events</h2>
      <div className="event-grid">
        {EVENT_OPTIONS.map(({ label, description }) => (
            <div key={label} className="event-option">
                <button
                    className={`event-button ${
                        selectedEvents.includes(label) ? "selected" : ""
                    }`}
                    onClick={() => toggleEvent(label)}
                >
                    {label}
                </button>
                <div className="event-description">{description}</div>
            </div>
        ))}
      </div>
    </div>
  );
}
