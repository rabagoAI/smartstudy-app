// src/context/AuthContext.js

import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Verificar si el usuario existe en Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCurrentUser(user);
        setUserData(docSnap.data());
      } else {
        // Usuario no existe en Firestore → cerrar sesión
        await signOut(auth);
        setCurrentUser(null);
        setUserData(null);
      }
    } else {
      setCurrentUser(null);
      setUserData(null);
    }
    setLoading(false);
  });

  return () => unsubscribeAuth();
}, []);

  const value = {
    currentUser,
    userData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};