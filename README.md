# 🎓 SmartStudia - Plataforma Educativa con IA

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-success)](https://smartstudia.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-purple)](#licencia)

> **Estudia más inteligente, no más duro.** Una plataforma educativa moderna que combina resúmenes, vídeos, exámenes y herramientas de IA para ayudarte a dominar cualquier tema.

🔗 **[Visita SmartStudia](https://www.smartstudia.com/)** | 📧 **[Contacto](mailto:contact@smartstudia.com)**

---

## ✨ Características Principales

### 📚 **Contenidos Educativos**
- ✅ Resúmenes claros y concisos de cada tema
- ✅ Vídeos explicativos paso a paso
- ✅ Exámenes resueltos con explicaciones
- ✅ Contenido premium disponible

### 🤖 **Herramientas IA Gratis**
- ✅ **Generador de Tarjetas**: Crea tarjetas de estudio automáticamente
- ✅ **Exámenes Personalizados**: Genera exámenes de práctica ilimitados
- ✅ **Chat Educativo**: Haz preguntas sobre cualquier tema
- ✅ **Resolución de Problemas**: Obtén soluciones paso a paso

### 📊 **Características Avanzadas**
- ✅ Autenticación con Firebase
- ✅ Google Analytics para tracking
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ SEO optimizado
- ✅ Interfaz intuitiva y moderna

---

## 📱 Asignaturas Disponibles

| Asignatura | Estado | Premium |
|-----------|--------|---------|
| Matemáticas | ✅ Disponible | 📖 Sí |
| Lengua y Literatura | ✅ Disponible | 📖 Sí |
| Biología y Geología | ✅ Disponible | 📖 Sí |
| Geografía e Historia | ✅ Disponible | 📖 Sí |
| Inglés | ✅ Disponible | 📖 Sí |

*Más asignaturas en desarrollo...*

---

## 💰 Planes de Precios

### 🎓 Plan Gratuito
- ✅ Generador de tarjetas
- ✅ Exámenes personalizados
- ✅ Chat con IA
- **Precio**: Gratis

### 📖 Plan Premium
- ✅ Todo del plan gratuito
- ✅ Resúmenes completos
- ✅ Vídeos explicativos
- ✅ Exámenes resueltos
- **Precio**: €4.99/mes

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/rabagoAI/smartstudy-app.git
cd smartstudy-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GA_MEASUREMENT_ID=your_ga_id
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

5. **Build para producción**
```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
smartstudy-app/
├── public/
│   ├── index.html          # HTML principal con GA4
│   └── favicon.ico         # Favicon
├── src/
│   ├── components/
│   │   ├── common/         # Componentes reutilizables
│   │   ├── home/           # Landing page
│   │   ├── auth/           # Autenticación
│   │   ├── subjects/       # Asignaturas
│   │   └── ai-tools/       # Herramientas IA
│   ├── context/
│   │   └── AuthContext.jsx # Contexto de autenticación
│   ├── utils/
│   │   └── errorHandler.js # Manejo de errores
│   ├── analytics.js        # Google Analytics tracking
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Punto de entrada
├── package.json            # Dependencias
├── vite.config.js          # Configuración Vite
└── README.md               # Este archivo
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería UI
- **React Router v6** - Enrutamiento
- **Vite** - Build tool
- **Tailwind CSS / CSS Modules** - Estilos
- **Lucide React** - Iconos
- **React Helmet Async** - SEO y meta tags

### Backend & Auth
- **Firebase** - Autenticación y Realtime Database
- **Firebase Storage** - Almacenamiento de archivos

### Analytics & Tracking
- **Google Analytics 4** - Tracking de usuarios
- **gtag** - Event tracking

### Deployment
- **Vercel** - Hosting y CI/CD

---

## 📊 Google Analytics

SmartStudia rastreaa eventos clave para mejorar la experiencia:

```javascript
// Eventos rastreados
trackEvent('landing', 'click_cta', 'signup_button')
trackEvent('auth', 'signup_success', 'user@email.com')
trackEvent('auth', 'login_success', 'user@email.com')
trackEvent('auth', 'logout', 'user@email.com')
trackEvent('ai_tools', 'generate_flashcards', 'topic_name')
trackEvent('ai_tools', 'generate_exam', 'topic_name')
```

Panel Analytics: [Google Analytics Dashboard](https://analytics.google.com/)

---

## 🔐 Seguridad

- ✅ Autenticación segura con Firebase Authentication
- ✅ Encriptación de datos en tránsito (HTTPS)
- ✅ Cumplimiento RGPD
- ✅ Variables de entorno protegidas
- ✅ Control de acceso basado en roles

---

## 📈 Estadísticas

- **Usuarios Registrados**: [Desde GA4]
- **Herramientas IA Utilizadas**: [Tracking activo]
- **Tasa de Conversión Premium**: [Monitoreado]
- **Asignaturas Disponibles**: 5+

---

## 🐛 Reportar Bugs

¿Encontraste un bug? Abre un [issue en GitHub](https://github.com/rabagoAI/smartstudy-app.git/issues)

Por favor incluye:
- Descripción del problema
- Pasos para reproducir
- Navegador y versión
- Screenshots si es posible

---

## 💡 Roadmap

### Q4 2025
- [ ] Más asignaturas (Química, Física)
- [ ] Modo oscuro
- [ ] Aplicación móvil nativa
- [ ] Sistema de badges/gamificación

### Q1 2026
- [ ] Tutorías en línea con expertos
- [ ] Comunidad de estudiantes
- [ ] Sistema de recomendaciones IA mejorado
- [ ] Integración con Slack/Teams

### Q2 2026
- [ ] Cursos avanzados
- [ ] Certificaciones
- [ ] Análisis de progreso avanzado
- [ ] API pública

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Por favor, sigue el [Código de Conducta](CODE_OF_CONDUCT.md).

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💼 Autor

**Paco Rabago**
- GitHub: [@rabagoAI](https://github.com/rabagoAI)
- Email: contact@smartstudia.com

---

## 🙏 Agradecimientos

- React community
- Firebase team
- Vercel
- Todos los usuarios y contribuidores

---

## 📞 Contacto & Soporte

- 💬 **Discord**: [Únete a nuestra comunidad](#)
- 📧 **Email**: support@smartstudia.com
- 🐦 **Twitter**: [@smartstudia](#)
- 📱 **Instagram**: [@smartstudia](#)

---

## 📝 Changelog

### [1.0.0] - 2025-01-10
- ✅ Lanzamiento inicial
- ✅ Autenticación con Firebase
- ✅ 5 asignaturas disponibles
- ✅ Herramientas IA gratis
- ✅ Plan Premium disponible
- ✅ Google Analytics integrado
- ✅ SEO optimizado

Ver [CHANGELOG.md](CHANGELOG.md) para más detalles.

---

<div align="center">

### ⭐ Si te gusta SmartStudia, dale una estrella en GitHub

**[⭐ Star on GitHub](https://github.com/rabagoAI/smartstudy-app)**

</div>

---

**Hecho con ❤️ por [Paco Rabago](https://github.com/rabagoAI)**