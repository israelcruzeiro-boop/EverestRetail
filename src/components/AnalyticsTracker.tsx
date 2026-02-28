import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

/**
 * Componente invisível que monitora a navegação e registra Page Views.
 */
export default function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        // Registrar o Page View
        analytics.track('page_view', {
            path: location.pathname,
            search: location.search,
            title: document.title
        });

    }, [location]);

    return null;
}
