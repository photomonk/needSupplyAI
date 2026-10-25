
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/landing";

import "./index.css";
import SupplierPage from "./pages/SupPage";


export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<LandingPage />} />

        
        <Route path="/supplier" element={<SupplierPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

  );
}