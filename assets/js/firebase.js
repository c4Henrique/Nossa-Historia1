// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, remove, query, orderByChild, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  authDomain: "nossa-historia-b61c2.firebaseapp.com",
  databaseURL: "https://nossa-historia-b61c2-default-rtdb.firebaseio.com",
  projectId: "nossa-historia-b61c2",
  storageBucket: "nossa-historia-b61c2.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, remove, query, orderByChild, onValue }; 