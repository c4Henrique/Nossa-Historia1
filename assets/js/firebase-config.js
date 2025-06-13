// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzK_rAy6q8zXJhvWPOxZXuXHJ1kDNVWfo",
  authDomain: "nossa-historia-b61c2.firebaseapp.com",
  projectId: "nossa-historia-b61c2",
  storageBucket: "nossa-historia-b61c2.firebasestorage.app",
  messagingSenderId: "399188444768",
  appId: "1:399188444768:web:c3045524baf3d881276505",
  measurementId: "G-5ST7M7EDJ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database, analytics };
