import { useEffect } from 'react';
import { auth } from './firebase'; // Tu config de Firebase
import axios from 'axios';

export const useAuthSync = () => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Al loguearse, sincronizamos con nuestro Backend
        try {
          await axios.post('http://localhost:3001/api/users/sync', {
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