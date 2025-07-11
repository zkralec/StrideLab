import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
// eslint-disable-next-line
import html2pdf from "html2pdf.js";
import "../styles/PlanGenerator.css";

export default function PlanGenerator() {
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const planRef = useRef(null); // For PDF export
  const [loadingDots, setLoadingDots] = useState(".");

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
Return a JSON object structured like this:

{
  "workoutPlan": [
    {
      "week": 1,
      "days": [
        {
          "day": "Monday",
          "focus": "Sprint technique + acceleration",
          "warmup": "Dynamic warmup: light jog (5-8 minutes), leg swings, A-skips, B-skips, high knees, butt kicks, hip mobility, sprint drills (e.g. bounding, straight leg runs), and 3 progressive accelerations.",
          "workout": "4x60m sprints at 100%. 3x30m sled pushes. 3x flying 20s. 3x block starts.",
          "cooldown": "10-minute jog. Full body static stretching (especially hamstrings, calves, hip flexors). Foam rolling.",
          "notes": "Ensure full recovery between reps."
        },
        ...
      ]
    },
    ...
  ],
  ${includeWeights ? `
  "weightPlan": [
    {
      "week": 1,
      "days": [
        {
          "day": "Monday",
          "exercises": "5x5 back squat, 3x8 deadlift, 3x12 hamstring curls, core circuit."
        }
      ]
    }
  ]
  ` : ""}
}

### IMPORTANT GUIDELINES ###
- Warm-ups must include at least **7–10 structured elements**, especially for sprint/jump/hurdle athletes.
- ✅ The 'workout' section must ONLY include **running workouts (sprints, intervals, technique drills)** or **field event-specific drills**.
- ❌ DO NOT include **any weightlifting, gym-based strength training, or resistance work** in the 'workout' section — these belong ONLY in the \`weightPlan\` (if enabled).
- Field event drills must be specific and technically accurate. Avoid incorrect reps/distances. Example:
  - ✔️ "3x3-step javelin throws", ❌ "3x50m javelin throws"
  - ✔️ "High bar swing drills for pole vault", ❌ "Pole vault 200m runs"
- Cooldowns must include light movement and stretching or rolling.
- Weight plans must include at least **6–10 compound lifts or relevant strength movements** each day, and must only appear in the \`weightPlan\`.
- Workouts should be practical and realistic, tailored to the athlete's goals and events.
- Do not duplicate sessions across days. Be intentional with recovery.
- Assign sessions only on available days.
- Ensure the JSON structure is correct and parseable.

Output only valid JSON.
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

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev === "..." ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  const renderWeeklyPlans = (title, weeklyData, type = "days") => (
    <div className="plan-section">
      <h2>{title}</h2>
      {weeklyData.map((week, idx) => (
        <div key={idx}>
          <h3>Week {week.week}</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(week[type][0]).map((key) => (
                  <th key={key}>{key.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week[type].map((entry, i) => (
                <tr key={i}>
                  {Object.values(entry).map((val, j) => (
                    <td key={j}>
                      {typeof val === "string"
                        ? val.split(". ").map((line, k) => <div key={k}>{line.trim()}</div>)
                        : JSON.stringify(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
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

      <h1>Your Personalized Training Plan</h1>
      {loading && <div className="loading">Generating your plan{loadingDots}</div>}
      {error && <div className="error">{error}</div>}

      <div ref={planRef}>
        {plan?.workoutPlan && renderWeeklyPlans("Workout Plan", plan.workoutPlan)}
        {plan?.weightPlan && renderWeeklyPlans("Weight Training Plan", plan.weightPlan, "days")}
      </div>
    </div>
  );
}
