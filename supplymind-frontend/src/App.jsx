
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/landing";
import DiscoveryPage from "./pages/Discovery";
import "./index.css";

export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/discover" element={<DiscoveryPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

  );
}