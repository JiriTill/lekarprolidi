import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/home.jsx';
import AboutPage from './pages/about.jsx';
import HowItWorksPage from './pages/howitworks.jsx';
import GDPRPage from './pages/GDPR.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/o-projektu" element={<AboutPage />} />
        <Route path="/jak-to-funguje" element={<HowItWorksPage />} />
        <Route path="/gdpr" element={<GDPRPage />} />
      </Routes>
    </Router>
  );
}
