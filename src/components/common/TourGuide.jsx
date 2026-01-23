// src/components/common/TourGuide.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePopper } from 'react-popper';
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

  // Popper state
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);

  const step = steps[currentStep];

  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: step?.position || 'bottom',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 15] } },
      {
        name: 'preventOverflow',
        options: {
          padding: 10,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top', 'bottom', 'right', 'left'],
        },
      },
    ],
  });

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

        // Scroll to element
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

  return (
    <>
      <div className="tour-overlay" onClick={closeTour}>
        {/* Spotlight effect can be improved or kept simple */}
        {targetElement && (() => {
          const rect = targetElement.getBoundingClientRect();
          return (
            <div
              className="tour-spotlight"
              style={{
                top: rect.top + window.scrollY - 4,
                left: rect.left + window.scrollX - 4,
                width: rect.width + 8,
                height: rect.height + 8,
                position: 'absolute'
              }}
            />
          );
        })()}
      </div>

      <div
        className="tour-tooltip"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        <div
          className="tour-arrow"
          ref={setArrowElement}
          style={styles.arrow}
        />

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