// Firebase module imports (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARFZNkjX3_zkKKs4iw2VdNqiB6xHmy1QU",
  authDomain: "krishi-satrhi.firebaseapp.com",
  projectId: "krishi-satrhi",
  storageBucket: "krishi-satrhi.firebasestorage.app",
  messagingSenderId: "466756576499",
  appId: "1:466756576499:web:0199e9a73822f5d9c9c386",
  measurementId: "G-SV54NEQNW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Add event listener to form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const emailInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const msgDiv = document.getElementById("login-msg") || createMsgDiv();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      msgDiv.textContent = "✅ Login successful!";
      msgDiv.className = "text-success";

      // Redirect after 1 second
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (err) {
      msgDiv.textContent = getErrorMessage(err.code);
      msgDiv.className = "text-danger";
    }
  });
});

// Create message div if missing
function createMsgDiv() {
  const div = document.createElement("div");
  div.id = "login-msg";
  div.className = "mt-3 text-danger";
  document.querySelector("form").appendChild(div);
  return div;
}

// Return user-friendly Firebase error message
function getErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
      return "User not found.";
    case "auth/wrong-password":
      return "Incorrect password.";
    default:
      return "Login failed: " + code;
  }
}
