import { useState, useEffect, useMemo } from 'react';

const THRESHOLDS = {
    DANGER: 90,
    WARNING: 70
};

/**
 * Hook personalizado para manejar la lógica de estado y tiempo de los límites de tasa.
 * @param {Object} params
 * @param {number} params.remainingCallsMinute
 * @param {number} params.remainingCallsHour
 * @param {Object} params.limits
 * @param {Date} params.nextResetMinute
 * @returns {Object} Estado calculado y formateado
 */
export const useRateLimitStatus = ({
    remainingCallsMinute,
    remainingCallsHour,
    limits,
    nextResetMinute
}) => {
    const [timeUntilReset, setTimeUntilReset] = useState('');

    // Lógica del temporizador
    useEffect(() => {
        const updateTimer = () => {
            if (!nextResetMinute) return;

            const now = new Date();
            const diff = nextResetMinute - now;

            if (diff <= 0) {
                setTimeUntilReset('Reseteando...');
                return;
            }

            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;

            if (minutes > 0) {
                setTimeUntilReset(`${minutes}m ${remainingSeconds}s`);
            } else {
                setTimeUntilReset(`${remainingSeconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [nextResetMinute]);

    // Cálculos de porcentaje memoizados
    const minutePercentage = useMemo(() => {
        if (!limits?.perMinute) return 0;
        return ((limits.perMinute - remainingCallsMinute) / limits.perMinute) * 100;
    }, [limits?.perMinute, remainingCallsMinute]);

    const hourPercentage = useMemo(() => {
        if (!limits?.perHour) return 0;
        return ((limits.perHour - remainingCallsHour) / limits.perHour) * 100;
    }, [limits?.perHour, remainingCallsHour]);

    // Determinación de color
    const getColorClass = (percentage) => {
        if (percentage >= THRESHOLDS.DANGER) return 'danger';
        if (percentage >= THRESHOLDS.WARNING) return 'warning';
        return 'success';
    };

    const minuteColor = useMemo(() => getColorClass(minutePercentage), [minutePercentage]);
    const hourColor = useMemo(() => getColorClass(hourPercentage), [hourPercentage]);

    return {
        timeUntilReset,
        minutePercentage,
        hourPercentage,
        minuteColor,
        hourColor
    };
};
