// src/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);

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
        return () => unsubscribeFirestore();
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const signup = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        name: name,
        createdAt: new Date(),
      });

      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};