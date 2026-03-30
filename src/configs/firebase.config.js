import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBX_W2k0XGG9EwPP8TuNYyp35JU8hsTZUE",
  authDomain: "you-calendy-7f51e.firebaseapp.com",
  projectId: "you-calendy-7f51e",
  storageBucket: "you-calendy-7f51e.firebasestorage.app",
  messagingSenderId: "1010640953933",
  appId: "1:1010640953933:web:1ea19e758b70c4255a3204",
  measurementId: "G-GL1N373307"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope('profile');
googleProvider.addScope('email');

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    localStorage.setItem("user", JSON.stringify({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid
    }));
    localStorage.setItem("token", await user.getIdToken());
    return {
      success: true,
      user: {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid
      }
    };
  } catch (error) {
    console.error("Error during Google sign in:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    
    console.log("Facebook auth result:", result);
    console.log("Facebook user info:", user);
    
    localStorage.setItem("user", JSON.stringify({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid
    }));
    localStorage.setItem("token", await user.getIdToken());
    
    return {
      success: true,
      user: {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        accessToken: accessToken
      }
    };
  } catch (error) {
    console.error("Error during Facebook sign in:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export { auth, googleProvider, facebookProvider, analytics };
export default app; 