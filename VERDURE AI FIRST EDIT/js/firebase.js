 // Import the functions we need from Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js';

// Your web app's Firebase configuration
// You'll get this from your Firebase Console
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-name.firebaseapp.com",
    projectId: "your-project-name",
    storageBucket: "your-project-name.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export these so we can use them in other files
export { auth, db, storage };