// src/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Importa las funciones de Firestore

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null); // Nuevo estado para los datos del usuario

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);

      // Si hay un usuario conectado, escucha su documento en Firestore
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const unsubscribeFirestore = onSnapshot(docRef, docSnap => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("No user data found in Firestore.");
            setUserData(null);
          }
        });
        // Devuelve la función de limpieza de Firestore
        return () => unsubscribeFirestore();
      } else {
        setUserData(null); // Limpia los datos si el usuario cierra sesión
      }
    });

    // Devuelve la función de limpieza de Authentication
    return () => unsubscribeAuth();
  }, []);

  const value = {
    currentUser,
    userData, // Expone los datos del usuario
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};