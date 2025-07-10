// src/components/CheckoutButton.js
import React from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../utils/firebase";

export default function CheckoutButton() {
  const createCheckoutSession = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first.");
      return;
    }

    try {
      const checkoutSessionRef = await addDoc(
        collection(db, "customers", user.uid, "checkout_sessions"),
        {
          price: "price_1Qn8UwHYgolSBA35WXL7aXcq", // Replace with your actual Stripe price ID
          success_url: window.location.origin,
          cancel_url: window.location.origin,
        }
      );

      // Wait for the extension to set the session URL
      onSnapshot(checkoutSessionRef, (snap) => {
        const { error, url } = snap.data();

        if (error) {
          alert(`An error occurred: ${error.message}`);
        }
        if (url) {
          window.location.assign(url);
        }
      });
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      alert("Failed to create checkout session.");
    }
  };

  return <button onClick={createCheckoutSession}>Upgrade to Premium</button>;
}
