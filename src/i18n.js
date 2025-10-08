// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traducciones
const resources = {
  es: {
    translation: {
      // --- Navegación ---
      nav: {
        home: "Inicio",
        subjects: "Asignaturas",
        aiTools: "Herramientas IA",
        login: "Iniciar Sesión",
        register: "Registrarse",
        logout: "Cerrar Sesión",
        profile: "Perfil"
      },
      // --- Página de inicio ---
      home: {
        heroTitle: "La plataforma de apoyo educativo para estudiantes de ESO",
        heroSubtitle: "Encuentra recursos, apuntes y ayuda para todas tus asignaturas de 1º de la ESO",
        ctaTitle: "¿Listo para mejorar tus notas?",
        ctaSubtitle: "Únete a miles de estudiantes que ya estudian con SmartStudIA.",
        featuresTitle: "¿Por qué usar nuestra plataforma?",
        testimonialsTitle: "Lo que dicen nuestros usuarios"
      },
      // --- Asignaturas ---
      subjects: {
        title: "Asignaturas de 1º de la ESO"
      },
      // --- Herramientas IA ---
      aiTools: {
        title: "Herramientas de Inteligencia Artificial",
        subtitle: "Potencia tus estudios con IA: resume textos, genera cuestionarios o explica conceptos.",
        resume: {
          title: "Crea un Resumen",
          description: "Convierte textos largos en resúmenes claros y estructurados."
        },
        quiz: {
          title: "Genera un Cuestionario",
          description: "Crea preguntas de estudio con 4 opciones cada una."
        },
        flashcards: {
          title: "Genera Tarjetas Didácticas",
          description: "Crea tarjetas interactivas para memorizar conceptos."
        },
        explain: {
          title: "Explica un Concepto",
          description: "Pregunta cualquier duda y recibe una explicación sencilla."
        },
        uploadPdf: "Sube un archivo PDF",
        changePdf: "Cambiar archivo PDF",
        orText: "o escribe tu pregunta/concepto:",
        generate: "Generar Contenido",
        generating: "Generando con IA...",
        viewHistory: "📚 Ver mi historial de IA"
      },
      // --- Botones y acciones ---
      actions: {
        download: "Descargar",
        copy: "Copiar",
        showAnswers: "Mostrar Respuestas",
        hideAnswers: "Ocultar Respuestas"
      },
      // --- Footer ---
      footer: {
        title: "SmartStudIA",
        description: "La plataforma de apoyo educativo con tecnología de IA.",
        copyright: "© 2025 SmartStudIA - Todos los derechos reservados"
      }
    }
  },
  en: {
    translation: {
      // --- Navigation ---
      nav: {
        home: "Home",
        subjects: "Subjects",
        aiTools: "AI Tools",
        login: "Log In",
        register: "Sign Up",
        logout: "Log Out",
        profile: "Profile"
      },
      // --- Home Page ---
      home: {
        heroTitle: "The educational support platform for ESO students",
        heroSubtitle: "Find resources, notes, and help for all your 1st-year ESO subjects",
        ctaTitle: "Ready to improve your grades?",
        ctaSubtitle: "Join thousands of students already studying with SmartStudIA.",
        featuresTitle: "Why use our platform?",
        testimonialsTitle: "What our users say"
      },
      // --- Subjects ---
      subjects: {
        title: "1st Year ESO Subjects"
      },
      // --- AI Tools ---
      aiTools: {
        title: "Artificial Intelligence Tools",
        subtitle: "Boost your studies with AI: summarize texts, generate quizzes, or explain concepts.",
        resume: {
          title: "Create a Summary",
          description: "Turn long texts into clear, structured summaries."
        },
        quiz: {
          title: "Generate a Quiz",
          description: "Create study questions with 4 options each."
        },
        flashcards: {
          title: "Generate Flashcards",
          description: "Create interactive cards to memorize concepts."
        },
        explain: {
          title: "Explain a Concept",
          description: "Ask any question and get a simple explanation."
        },
        uploadPdf: "Upload a PDF file",
        changePdf: "Change PDF file",
        orText: "or write your question/concept:",
        generate: "Generate Content",
        generating: "Generating with AI...",
        viewHistory: "📚 View my AI history"
      },
      // --- Buttons and actions ---
      actions: {
        download: "Download",
        copy: "Copy",
        showAnswers: "Show Answers",
        hideAnswers: "Hide Answers"
      },
      // --- Footer ---
      footer: {
        title: "SmartStudIA",
        description: "The educational support platform powered by AI technology.",
        copyright: "© 2025 SmartStudIA - All rights reserved"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;