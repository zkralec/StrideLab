# StrideLab
StrideLab is a web app I built that creates personalized training plans for track and field athletes. It uses Firebase for user accounts and OpenAI's GPT to generate detailed, structured workouts based on the athlete's info.

Athletes can pick their events, training goals, which days they’re available, and whether they want weight training included. The GPT returns a clean JSON object with warmups, workouts, and cooldowns — all based on real track and field logic (not random sets or reps). There’s also a separate weight plan if selected.

Everything is built with React and hosted on Firebase. It works fully in the browser — no subscriptions, no locked features.

In order to update this code and deploy to firebase:
1. git add .
2. git commit -m "Commit message"
3. git push
4. npm run build
5. firebase deploy