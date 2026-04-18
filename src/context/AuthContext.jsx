import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Check if Firebase is configured with real credentials
const DEMO_MODE = true; // Set to false once you add real Firebase credentials

// Demo user object
const DEMO_USER = {
  uid: "demo-user-001",
  email: "jane.doe@bizinsight.com",
  displayName: "Jane Doe",
};

let firebaseAuth = null;
let firebaseFns = {};

// Only import Firebase if not in demo mode
if (!DEMO_MODE) {
  import("../services/firebase").then((mod) => {
    firebaseAuth = mod.auth;
  });
  import("firebase/auth").then((mod) => {
    firebaseFns = mod;
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_MODE ? null : undefined);
  const [loading, setLoading] = useState(!DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) {
      // Check localStorage for demo session
      const saved = localStorage.getItem("bizinsight-demo-user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
      setLoading(false);
      return;
    }

    // Firebase auth listener
    if (firebaseAuth && firebaseFns.onAuthStateChanged) {
      const unsub = firebaseFns.onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return unsub;
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (DEMO_MODE) {
      const demoUser = { ...DEMO_USER, email };
      localStorage.setItem("bizinsight-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return { user: demoUser };
    }
    return firebaseFns.signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signup = async (email, password, name) => {
    if (DEMO_MODE) {
      const demoUser = { ...DEMO_USER, email, displayName: name || "User" };
      localStorage.setItem("bizinsight-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return { user: demoUser };
    }
    const cred = await firebaseFns.createUserWithEmailAndPassword(firebaseAuth, email, password);
    await firebaseFns.updateProfile(cred.user, { displayName: name });
    return cred;
  };

  const loginWithGoogle = async () => {
    if (DEMO_MODE) {
      const demoUser = { ...DEMO_USER };
      localStorage.setItem("bizinsight-demo-user", JSON.stringify(demoUser));
      setUser(demoUser);
      return { user: demoUser };
    }
    const provider = new firebaseFns.GoogleAuthProvider();
    return firebaseFns.signInWithPopup(firebaseAuth, provider);
  };

  const logout = async () => {
    if (DEMO_MODE) {
      localStorage.removeItem("bizinsight-demo-user");
      setUser(null);
      return;
    }
    return firebaseFns.signOut(firebaseAuth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
