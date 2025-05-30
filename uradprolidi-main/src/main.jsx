import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';       // Import komponenty App
import './style.css';              // Import stylů (např. Tailwind)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
