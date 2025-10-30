// src/context/AuthContext.js
// ✅ VERSIÓN UNIFICADA - Combina lo mejor de ambas versiones

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listener de cambios en autenticación
  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          const docRef = doc(db, 'users', user.uid);

          // Usa onSnapshot para updates en tiempo real de userData
          unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              console.warn('No user data found in Firestore for:', user.uid);
              setUserData(null);
            }
          });
        } else {
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error en onAuthStateChanged:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Signup: crea usuario en Auth y Firestore
  const signup = async (email, password, name) => {
    setError(null);
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crear documento en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        name: name,
        createdAt: new Date().toISOString(),
        admin: false, // Por defecto no admin
        subscription: 'free', // Plan por defecto
      });

      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login: autentica usuario
  const login = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout: cierra sesión
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Actualizar perfil del usuario en Firestore
  const updateProfile = async (updates) => {
    setError(null);
    if (!currentUser) throw new Error('No user logged in');

    try {
      await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
      // userData se actualizará automáticamente por el listener
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    isAdmin: userData?.admin === true,
    isSubscribed: userData?.subscription === 'premium',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};