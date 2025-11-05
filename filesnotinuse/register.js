// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
  getAuth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

  document.getElementById('verify-otp-btn').style.display = 'none';
  document.getElementById('register-btn').disabled = true;

  // Handle email link click
  if (isSignInWithEmailLink(auth, window.location.href)) {
    const msgDiv = document.getElementById('register-msg');
    const emailField = document.getElementById('email');

    document.getElementById('otp-section').style.display = 'none';
    document.getElementById('userpass-section').style.display = 'block';

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        msgDiv.textContent = "Email verified! Now set your password to complete registration.";
        emailField.value = email;
        emailField.readOnly = true;
        document.getElementById('register-btn').disabled = false;

        // Handle password creation
        document.getElementById('register-btn').onclick = async (e) => {
          e.preventDefault();
          const password = document.getElementById('password').value.trim();

          if (password.length < 6) {
            msgDiv.textContent = "Password must be at least 6 characters.";
            return;
          }

          try {
            await createUserWithEmailAndPassword(auth, email, password);
            msgDiv.textContent = "✅ Registration successful! You can now log in.";
          } catch (error) {
            msgDiv.textContent = "Error: " + error.message;
          }
        };

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
      msgDiv.textContent = "OTP link sent to your email. Please click the link to continue.";
      document.getElementById('send-otp-btn').disabled = true;
    })
    .catch((error) => {
      msgDiv.textContent = error.message;
    });
}

// Password eye toggle
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
