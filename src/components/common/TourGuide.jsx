// src/components/common/TourGuide.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TourGuide.css';

const steps = [
  {
    selector: '.hero-content',
    title: '¡Bienvenido a SmartStudIA!',
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
        
        if (isNewRegistration || !hasSeenTour) {
          sessionStorage.removeItem('newUserRegistration');
          
          setTimeout(() => {
            const firstElement = document.querySelector(steps[0].selector);
            if (firstElement) {
              setIsActive(true);
              localStorage.setItem(`hasSeenTour_${currentUser.uid}`, 'true');
            } else {
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

    checkForNewUser();
    const timeoutId = setTimeout(checkForNewUser, 500);
    return () => clearTimeout(timeoutId);
  }, [currentUser, hasCheckedTour]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].selector);
      if (element) {
        setTargetElement(element);
        
        // ✅ Scroll corregido para dejar espacio al tooltip
        setTimeout(() => {
          const elementRect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Espacio necesario para el tooltip (altura + margen)
          const tooltipSpace = 220; // Ajustado para tooltip + botones
          
          // Si el elemento está fuera de la vista o muy cerca de los bordes
          if (
            elementRect.top < tooltipSpace || 
            elementRect.bottom > viewportHeight - tooltipSpace
          ) {
            // Calcular nueva posición de scroll
            const elementTop = element.offsetTop;
            const scrollPosition = elementTop - (viewportHeight / 2) + (elementRect.height / 2) - (tooltipSpace / 2);
            
            window.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }, 150); // Ligero retraso para asegurar renderizado
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
  
  // Calcular posición del tooltip
  const getTooltipStyle = () => {
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const margin = 20; // Aumentado para más espacio
    
    let top, left;
    
    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - margin;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - margin;
        break;
      case 'right':
      default:
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + margin;
        break;
    }
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // ✅ Ajuste vertical mejorado
    if (top < margin) {
      top = rect.bottom + margin;
    } else if (top + tooltipHeight > viewportHeight - margin) {
      const topPosition = rect.top - tooltipHeight - margin;
      if (topPosition >= margin) {
        top = topPosition;
      } else {
        // Centrar en pantalla si no cabe
        top = Math.max(margin, (viewportHeight - tooltipHeight) / 2);
      }
    }
    
    // Ajuste horizontal
    if (left < margin) {
      left = margin;
    } else if (left + tooltipWidth > viewportWidth - margin) {
      left = viewportWidth - tooltipWidth - margin;
    }
    
    left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));
    
    return {
      position: 'fixed',
      top,
      left,
      zIndex: 10001,
    };
  };

  // Calcular posición de la flecha
  const getArrowStyle = () => {
    const tooltipStyle = getTooltipStyle();
    const tooltipRect = {
      top: tooltipStyle.top,
      left: tooltipStyle.left,
      width: 320,
      height: 180
    };
    
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;
    const tooltipCenterX = tooltipRect.left + tooltipRect.width / 2;
    const tooltipCenterY = tooltipRect.top + tooltipRect.height / 2;
    
    const angle = Math.atan2(targetCenterY - tooltipCenterY, targetCenterX - tooltipCenterX);
    const degrees = (angle * 180 / Math.PI) + 90;
    
    return {
      position: 'absolute',
      top: '10px',
      right: '15px',
      transform: `rotate(${degrees}deg)`,
      fontSize: '20px',
      color: '#4361ee',
    };
  };

  return (
    <>
      <div className="tour-overlay" onClick={closeTour}>
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
      
      <div className="tour-tooltip" style={getTooltipStyle()}>
        <div className="tour-arrow" style={getArrowStyle()} />
        
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