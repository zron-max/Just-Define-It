import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getApiKey, saveApiKey } from '@/components/shared/utils';

// Define the shape of our context data
interface AppContextType {
    apiKey: string | null;
    setApiKey: (key: string | null) => void;
    isApiKeyModalOpen: boolean;
    openApiKeyModal: () => void;
    closeApiKeyModal: () => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [apiKey, setApiKeyInternal] = useState<string | null>(null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    // Load the API key from local storage on initial app load
    useEffect(() => {
        const storedKey = getApiKey();
        if (storedKey) {
            setApiKeyInternal(storedKey);
        }
    }, []);

    const setApiKey = (key: string | null) => {
        if (key) {
            saveApiKey(key);
            setApiKeyInternal(key);
        }
    };

    const openApiKeyModal = () => setIsApiKeyModalOpen(true);
    const closeApiKeyModal = () => setIsApiKeyModalOpen(false);

    const value = {
        apiKey,
        setApiKey,
        isApiKeyModalOpen,
        openApiKeyModal,
        closeApiKeyModal,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook for easy access to the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};