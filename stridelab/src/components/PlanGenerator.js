import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/PlanGenerator.css";

export default function PlanGenerator() {
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const duration = searchParams.get("duration");
  const includeWeights = searchParams.get("weights") === "true";

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log("🟡 Fetching plan...");
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) throw new Error("User data not found");

        const userData = docSnap.data();

        const prompt = `Generate a ${duration}-week track and field training plan.
User Info:
Name: ${userData.name}
Age: ${userData.age}
Events: ${userData.events?.join(", ")}
Availability: ${userData.availability?.join(", ")}
Goals: ${userData.goals?.join(", ")}
Include weight training: ${includeWeights ? "Yes" : "No"}

Please return a JSON object structured as follows:
{
  "workoutPlan": [
    {
      "day": "Monday",
      "focus": "Speed + Acceleration",
      "warmup": "800m jog. 4x20m high knees. 4x20m A skips.",
      "workout": "4x60m sprints. 4x20m sled pushes.",
      "cooldown": "10min jog. Foam roll.",
      "notes": "Focus on form at max speed."
    },
    ...
  ],
  ${includeWeights ? '"weightPlan": [{ "day": "Monday", "exercises": "5x5 squats. 3x10 lunges." }],' : ""}
}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        console.log("🟢 GPT response:", data);

        const text = data.choices?.[0]?.message?.content?.trim();
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const cleaned = text.slice(jsonStart, jsonEnd);

        const parsed = JSON.parse(cleaned);
        setPlan(parsed);
      } catch (err) {
        console.error("🔴 Error generating plan:", err);
        setError("❌ Failed to generate plan. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [duration, includeWeights]);

  const renderTable = (title, data) => (
    <div className="plan-section">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th key={key}>{key.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((day, idx) => (
            <tr key={idx}>
              {Object.values(day).map((val, k) => (
                <td key={k}>
                  {typeof val === "string"
                    ? val.split(". ").map((line, i) => <div key={i}>{line.trim()}</div>)
                    : JSON.stringify(val)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="plan-container">
      <h1>Your Training Plan</h1>
      {loading && <div className="loading">Generating your plan... Please wait.</div>}
      {error && <div className="error">{error}</div>}
      {plan?.workoutPlan && renderTable("Workout Plan", plan.workoutPlan)}
      {plan?.weightPlan && renderTable("Weight Training Plan", plan.weightPlan)}
    </div>
  );
}
