import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

// This component will wrap any page we want to protect
export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { apiKey, openApiKeyModal } = useAppContext();

    useEffect(() => {
        // If the user lands here without a key, we'll trigger the modal
        // so when they are redirected to home, the popup is ready.
        if (!apiKey) {
            openApiKeyModal();
        }
    }, [apiKey, openApiKeyModal]);

    // If there's no API key, redirect the user to the homepage.
    if (!apiKey) {
        return <Navigate to="/" replace />;
    }

    // If the API key exists, show the page content.
    return <>{children}</>;
}