import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import html2pdf from "html2pdf.js";
import "../styles/PlanGenerator.css";

export default function PlanGenerator() {
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const planRef = useRef(null); // For PDF export

  const duration = searchParams.get("duration");
  const includeWeights = searchParams.get("weights") === "true";

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) throw new Error("User data not found");

        const userData = docSnap.data();
        const prompt = `You are a professional track & field strength and conditioning coach.

Generate a ${duration}-week personalized training plan for the following athlete:

Athlete Info:
- Name: ${userData.name}
- Age: ${userData.age}
- Events: ${userData.events?.join(", ")}
- Weekly Availability: ${userData.availability?.join(", ")}
- Training Goals: ${userData.goals?.join(", ")}
- Include weight training: ${includeWeights ? "Yes" : "No"}

### PLAN FORMAT ###
Return a JSON object structured as:
{
  "workoutPlan": [
    {
      "day": "Monday",
      "focus": "Sprint technique + acceleration",
      "warmup": "Dynamic warmup: light jog (5-8 minutes), leg swings, A-skips, B-skips, high knees, butt kicks, hip mobility, sprint drills (e.g. bounding, straight leg runs), and 3 progressive accelerations.",
      "workout": "4x60m sprints at 100%. 3x30m sled pushes. 3x flying 20s at 100%. 3x50m block starts at 100%.",
      "cooldown": "10-minute jog. Full body static stretching (especially hamstrings, calves, hip flexors). Foam rolling.",
      "notes": "Ensure full recovery between reps to maintain form and speed."
    },
    ...
  ]
  ${includeWeights ? `,
  "weightPlan": [
    {
      "day": "Monday",
      "exercises": "Heavy compound lifts: 5x5 back squat, 3x8 deadlift, 3x12 hamstring curls, core circuit."
    }
  ]` : ""}
}

### IMPORTANT GUIDELINES ###
- For sprint/jump/hurdle/power athletes: include long and thorough warm-ups and cooldowns (as injury prevention is critical).
- For distance events: warm-ups can be lighter, but still complete and include mobility and activation.
- Each warm-up must include at least **7–10 components**, not just a jog or two drills.
- Workouts should include **varied, event-specific drills** each day.
- Cooldowns must include jog/light movement and full-body stretching or recovery tools.
- Spread intensity throughout the week, avoid doubling up multiple hard workouts on back-to-back days.
- Align with the athlete's availability. Do not assign workouts on unavailable days.
`;

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

  const downloadPDF = () => {
    if (planRef.current) {
      html2pdf().from(planRef.current).save("training_plan.pdf");
    }
  };

  return (
    <div className="plan-container">
      <div className="plan-controls">
        <button onClick={() => navigate("/dashboard")} className="back-btn">← Back to Dashboard</button>
        <button onClick={downloadPDF} className="pdf-btn">Save as PDF</button>
      </div>

      <h1>Your Training Plan</h1>
      {loading && <div className="loading">Generating your plan... Please wait.</div>}
      {error && <div className="error">{error}</div>}

      <div ref={planRef}>
        {plan?.workoutPlan && renderTable("Workout Plan", plan.workoutPlan)}
        {plan?.weightPlan && renderTable("Weight Training Plan", plan.weightPlan)}
      </div>
    </div>
  );
}
