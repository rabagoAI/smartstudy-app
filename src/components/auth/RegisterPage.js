// En tu componente de registro (ej. src/pages/Register.js)

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importa las funciones de Firestore
import { auth, db } from '../../firebase';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Paso 1: Crea el usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Paso 2: Crea el documento de perfil del usuario en Firestore
      // Usamos el UID de Authentication como el ID del documento
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        // Aquí puedes añadir más información del usuario
        createdAt: new Date(),
        // Ejemplo: nombre: "Usuario Ejemplo"
      });

      console.log("¡Usuario registrado y perfil creado con éxito!");

    } catch (error) {
      console.error("Error al registrar:", error.message);
      // Aquí puedes manejar y mostrar el error al usuario
    }
  };

  return (
    // ... tu formulario de registro
    <form onSubmit={handleRegister}>
      {/* ... tus campos de email y contraseña */}
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default RegisterPage;


