import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyC2iLIbg-ffQf43H8ziXOOZZAPESuNKzRA",
  authDomain: "chat-cipher.firebaseapp.com",
  databaseURL: "https://chat-cipher-default-rtdb.firebaseio.com",
  projectId: "chat-cipher",
  storageBucket: "chat-cipher.appspot.com",
  messagingSenderId: "508824735069",
  appId: "1:508824735069:web:925f1b755a418aa61a2cb4",
  measurementId: "G-V8EFC9WMRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Database
const database = getDatabase(app);

export {database}
export const auth = getAuth(app);
