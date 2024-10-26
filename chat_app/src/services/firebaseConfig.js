import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, update, push, get } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, ref, onValue, set, update, push, get };
