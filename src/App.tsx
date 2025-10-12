import { Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import EtymologyPage from './pages/EtymologyPage';
import DefinerPage from './pages/DefinerPage';
import NotFound from "./pages/NotFound";
import { useAppContext } from "./contexts/AppContext";
import AboutPage from "./pages/AboutPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import ApiKeyInput from "./components/ApiKeyInput";
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Import our guard

export default function App() {
  const { isApiKeyModalOpen, closeApiKeyModal, apiKey, setApiKey } = useAppContext();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* --- These routes are now protected --- */}
        <Route
          path="/etymology"
          element={
            <ProtectedRoute>
              <EtymologyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/definer"
          element={
            <ProtectedRoute>
              <DefinerPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />

        <Route path="*" element={<NotFound />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
      </Routes>

      {isApiKeyModalOpen && (
        <ApiKeyInput
          initialApiKey={apiKey || ''}
          onApiKeySaved={(key) => {
            setApiKey(key);
            closeApiKeyModal();
          }}
          onCancel={apiKey ? closeApiKeyModal : undefined}
        />
      )}
    </>
  );
}