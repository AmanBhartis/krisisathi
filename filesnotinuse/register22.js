// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Your Firebase config
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

// Email OTP (magic link) config
const actionCodeSettings = {
  url: window.location.origin + window.location.pathname, // Redirect back to this page
  handleCodeInApp: true
};

window.onload = function () {
  document.getElementById('send-otp-btn').onclick = function (e) {
    e.preventDefault();
    onSendEmailOTP();
  };

  // Hide verify-otp-btn (not needed for email link flow)
  document.getElementById('verify-otp-btn').style.display = 'none';

  // If user clicked the link in their email, complete sign-in
  if (isSignInWithEmailLink(auth, window.location.href)) {
    const msgDiv = document.getElementById('register-msg');
    document.getElementById('otp-section').style.display = 'none';
    document.getElementById('userpass-section').style.display = 'block';
    document.getElementById('register-btn').disabled = false;
    // Optionally, you can auto-fill the email if you stored it in localStorage
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    signInWithEmailLink(auth, email, window.location.href)
      .then((result) => {
        msgDiv.textContent = "Email verified! Now set your username and password.";
        document.getElementById('userpass-section').style.display = 'block';
        document.getElementById('register-btn').disabled = false;
        document.getElementById('email').readOnly = true;
        document.getElementById('send-otp-btn').disabled = true;
      })
      .catch((error) => {
        msgDiv.textContent = "Verification failed: " + error.message;
      });
  }
};

function onSendEmailOTP() {
  const emailInput = document.getElementById('email');
  const msgDiv = document.getElementById('register-msg');
  const email = emailInput.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msgDiv.textContent = "Please enter a valid email address.";
    return;
  }

  sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      window.localStorage.setItem('emailForSignIn', email);
      msgDiv.textContent = "OTP link sent to your email. Please check your inbox and click the link to continue registration.";
      document.getElementById('send-otp-btn').disabled = true;
    })
    .catch((error) => {
      msgDiv.textContent = error.message;
    });
}

// Password eye toggle function
window.togglePassword = function(fieldId, btn) {
  const input = document.getElementById(fieldId);
  const icon = btn.querySelector('.eye-icon');
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈";
  } else {
    input.type = "password";
    icon.textContent = "👁️";
  }
};