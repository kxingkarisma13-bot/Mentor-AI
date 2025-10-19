import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // --- Shake detection code ---
    async function enableShakeFeedback() {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        try {
          await DeviceMotionEvent.requestPermission();
        } catch (err) {
          console.warn("Motion permission denied:", err);
        }
      }

      let last = 0,
        shakes = 0;
      const THRESHOLD_G = 2.2;
      const WINDOW_MS = 800;
      const COOLDOWN_MS = 4000;
      let cooling = false;

      window.addEventListener(
        "devicemotion",
        (e) => {
          const a = e.accelerationIncludingGravity || e.acceleration;
          if (!a) return;
          const g =
            Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2) /
            9.80665;
          const now = performance.now();

          if (g > THRESHOLD_G) {
            if (now - last < WINDOW_MS) shakes++;
            else shakes = 1;
            last = now;

            if (!cooling && shakes >= 2) {
              cooling = true;
              shakes = 0;

              // 🔔 Trigger your feedback modal or send API request
              openFeedbackModal();

              fetch("/api/feedback/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: "shake",
                  ts: Date.now(),
                  ua: navigator.userAgent,
                  url: location.href,
                }),
              });

              setTimeout(() => (cooling = false), COOLDOWN_MS);
            }
          }
        },
        { passive: true }
      );
    }

    // Wait for a user click before enabling motion events
    document.addEventListener("click", function once() {
      document.removeEventListener("click", once);
      enableShakeFeedback();
    });
  }, []);

  // Simple feedback modal example (can replace with your own)
  function openFeedbackModal() {
    alert("👋 Thanks! Feedback mode activated — shake detected.");
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Mentor AI</h1>
      <p>Your Personal Growth Companion</p>
      <p>Shake your phone to send quick feedback!</p>
    </div>
  );
}
