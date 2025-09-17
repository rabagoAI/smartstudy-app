// src/components/common/TourGuide.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TourGuide.css'; // Archivo CSS que crearemos

const steps = [
  {
    selector: '.hero-content',
    title: '¡Bienvenido a SmartStudy!',
    content: 'Aquí encontrarás todo lo que necesitas para potenciar tu aprendizaje.',
    position: 'bottom'
  },
  {
    selector: '.subjects-grid',
    title: 'Tus Asignaturas',
    content: 'Explora tus asignaturas organizadas de manera intuitiva.',
    position: 'top'
  },
  {
    selector: '.ai-tools-teaser',
    title: 'Herramientas de IA',
    content: 'Potencia tu estudio con nuestras herramientas de inteligencia artificial.',
    position: 'top'
  },
  {
    selector: '.features',
    title: 'Características',
    content: 'Descubre todos los beneficios exclusivos que tenemos para ti.',
    position: 'top'
  },
  {
    selector: '.footer',
    title: '¡Listo para empezar!',
    content: 'Ya estás preparado para comenzar tu aventura de aprendizaje.',
    position: 'top'
  },
];

const TourGuide = () => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [hasCheckedTour, setHasCheckedTour] = useState(false);

  // Detectar si es usuario nuevo (recién registrado)
  useEffect(() => {
    const checkForNewUser = () => {
      if (currentUser && !hasCheckedTour) {
        const hasSeenTour = localStorage.getItem(`hasSeenTour_${currentUser.uid}`);
        const isNewRegistration = sessionStorage.getItem('newUserRegistration');
        
        // Si es un registro nuevo O nunca ha visto el tour
        if (isNewRegistration || !hasSeenTour) {
          // Limpiar la marca de nuevo registro
          sessionStorage.removeItem('newUserRegistration');
          
          // Esperar a que todos los elementos estén renderizados
          setTimeout(() => {
            // Verificar que los elementos existen antes de iniciar
            const firstElement = document.querySelector(steps[0].selector);
            if (firstElement) {
              setIsActive(true);
              localStorage.setItem(`hasSeenTour_${currentUser.uid}`, 'true');
            } else {
              // Si no existe, reintentar varias veces
              let retries = 0;
              const maxRetries = 3;
              
              const retryInterval = setInterval(() => {
                const retryElement = document.querySelector(steps[0].selector);
                if (retryElement || retries >= maxRetries) {
                  clearInterval(retryInterval);
                  if (retryElement) {
                    setIsActive(true);
                    localStorage.setItem(`hasSeenTour_${currentUser.uid}`, 'true');
                  }
                }
                retries++;
              }, 1000);
            }
          }, 2000);
        }
        setHasCheckedTour(true);
      }
    };

    // Ejecutar inmediatamente y también después de un delay
    checkForNewUser();
    const timeoutId = setTimeout(checkForNewUser, 500);
    
    return () => clearTimeout(timeoutId);
  }, [currentUser, hasCheckedTour]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].selector);
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isActive]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setTargetElement(null);
  };

  const skipTour = () => {
    closeTour();
  };

  if (!isActive || !steps[currentStep] || !targetElement) return null;

  const step = steps[currentStep];
  const rect = targetElement.getBoundingClientRect();
  
  const getTooltipStyle = () => {
  const tooltipWidth = 300;
  const tooltipHeight = 200;
  let top, left;

  // Calcular la posición basada en el selector
  switch (step.position) {
    case 'top':
      top = rect.top - tooltipHeight - 10;
      left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      break;
    case 'bottom':
      top = rect.bottom + 10;
      left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      left = rect.left - tooltipWidth - 10;
      break;
    case 'right':
    default:
      top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      left = rect.right + 10;
      break;
  }

  // ✅ Ajustar la posición para evitar que se salga de la pantalla
  const adjustedTop = Math.max(
    10,
    Math.min(
      top,
      window.innerHeight - tooltipHeight - 10
    )
  );

  const adjustedLeft = Math.max(
    10,
    Math.min(
      left,
      window.innerWidth - tooltipWidth - 10
    )
  );

  return {
    position: 'fixed',
    top: adjustedTop,
    left: adjustedLeft,
    zIndex: 10001,
  };
};

  return (
    <>
      {/* Overlay oscuro */}
      <div className="tour-overlay" onClick={closeTour}>
        {/* Spotlight en el elemento target */}
        <div 
          className="tour-spotlight"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      </div>
      
      {/* Tooltip del tour */}
      <div className="tour-tooltip" style={getTooltipStyle()}>
        <div className="tour-header">
          <h3>{step.title}</h3>
          <button className="tour-close" onClick={closeTour}>×</button>
        </div>
        
        <div className="tour-content">
          <p>{step.content}</p>
        </div>
        
        <div className="tour-footer">
          <div className="tour-progress">
            <span>{currentStep + 1} de {steps.length}</span>
            <div className="tour-progress-bar">
              <div 
                className="tour-progress-fill"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="tour-buttons">
            <button onClick={skipTour} className="tour-skip">
              Saltar tour
            </button>
            {currentStep > 0 && (
              <button onClick={prevStep} className="tour-prev">
                Anterior
              </button>
            )}
            <button onClick={nextStep} className="tour-next">
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourGuide;