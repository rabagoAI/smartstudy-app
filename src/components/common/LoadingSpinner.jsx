// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './LoadingSpinner.css';

function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner__icon" aria-hidden="true" />
      <span className="loading-spinner__text">{t('common.loading')}</span>
    </div>
  );
}

export default LoadingSpinner;
