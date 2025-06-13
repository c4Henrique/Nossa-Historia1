import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
    authDomain: "nossa-historia-b61c2.firebaseapp.com",
    databaseURL: "https://nossa-historia-b61c2-default-rtdb.firebaseio.com",
    projectId: "nossa-historia-b61c2",
    storageBucket: "nossa-historia-b61c2.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:1234567890123456789012",
    measurementId: "G-XXXXXXXXXX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// Configurar CORS para o Storage
const corsConfig = {
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAgeSeconds: 3600
};

export { database, analytics, storage, corsConfig }; 