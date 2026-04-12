import { useEffect } from 'react';
import { auth } from './firebase'; // Tu config de Firebase
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const useAuthSync = () => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Al loguearse, sincronizamos con nuestro Backend
        try {
          await axios.post(`${API_URL}/users/sync`, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "Usuario Nuevo",
          });
          console.log("Perfil sincronizado con Postgres");
        } catch (error) {
          console.error("Error sincronizando perfil:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);
};