import {initializeApp} from "firebase/app";
import {getAnalytics, isSupported} from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBOthhewBfyLIuk7jXnFiMtd5Py0yPEQts",
    authDomain: "ai-code-review-23524.firebaseapp.com",
    projectId: "ai-code-review-23524",
    storageBucket: "ai-code-review-23524.appspot.com",
    messagingSenderId: "857160621092",
    appId: "1:857160621092:web:0d36ac9d34a704b5ccccb1",
    measurementId: "G-GEFMS4E98T"
};

const app = initializeApp(firebaseConfig);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default analytics