const firebaseConfig = {
    apiKey: "AIzaSyCErcd7tm63380hGfUcsAKiOOKw8zRBiEw",
    authDomain: "studyverse-d81e4.firebaseapp.com",
    projectId: "studyverse-d81e4",
    storageBucket: "studyverse-d81e4.firebasestorage.app",
    messagingSenderId: "227083369228",
    appId: "1:227083369228:web:e6caa3e485a4e121816729",
    databaseURL: "https://studyverse-d81e4-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();