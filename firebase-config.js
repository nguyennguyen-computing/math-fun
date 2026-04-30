// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxJVGZca1r3ew9vs3l8qGR8jev6t1Ko3Q",
    authDomain: "mathfun-50e77.firebaseapp.com",
    projectId: "mathfun-50e77",
    storageBucket: "mathfun-50e77.firebasestorage.app",
    messagingSenderId: "61490439561",
    appId: "1:61490439561:web:e6096252ca21c316fc2d58"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
