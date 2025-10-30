// src/utils/errorHandler.js

/**
 * Convierte códigos de error de Firebase en mensajes amigables para el usuario
 * @param {string} errorCode - El código de error de Firebase
 * @returns {string} Mensaje de error amigable
 */
export const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    // Errores de registro
    'auth/email-already-in-use': '📧 Este email ya está registrado. ¿Intentas iniciar sesión?',
    'auth/weak-password': '🔐 La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': '❌ El email no es válido',
    'auth/invalid-password': '🚫 La contraseña no es válida',
    
    // Errores de login
    'auth/user-not-found': '👤 No encontramos una cuenta con este email',
    'auth/wrong-password': '🔑 La contraseña es incorrecta',
    'auth/invalid-credential': '⚠️ Email o contraseña incorrectos',
    
    // Errores de sesión
    'auth/user-disabled': '🚫 Esta cuenta ha sido deshabilitada',
    'auth/too-many-requests': '⏳ Demasiados intentos fallidos. Intenta más tarde',
    'auth/operation-not-allowed': '❌ Esta operación no está permitida',
    
    // Errores generales
    'auth/network-request-failed': '🌐 Error de conexión. Verifica tu internet',
    'auth/internal-error': '⚠️ Error interno. Intenta de nuevo más tarde',
    'auth/firebase-app-not-initialized': '❌ Error de configuración. Contacta con soporte',
  };

  return errorMessages[errorCode] || '❌ Algo salió mal. Intenta de nuevo.';
};

/**
 * Valida email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida contraseña
 * @param {string} password
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    };
  }

  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Incluye mayúsculas y números para mayor seguridad',
    };
  }

  return {
    isValid: true,
    message: 'Contraseña segura',
  };
};

/**
 * Valida nombre
 * @param {string} name
 * @returns {boolean}
 */
export const isValidName = (name) => {
  return name.trim().length >= 2;
};

/**
 * Genera un resumen de errores de validación
 * @param {object} errors - { field: errorMessage }
 * @returns {string[]}
 */
export const getValidationErrors = (errors) => {
  return Object.values(errors).filter(Boolean);
};