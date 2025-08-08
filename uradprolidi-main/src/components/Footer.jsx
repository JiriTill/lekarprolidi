import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="text-center text-sm text-gray-500 py-6 border-t mt-8">
      <div className="space-x-4">
        <button onClick={() => handleClick('/o-projektu')} className="hover:underline">O projektu</button>
        <button onClick={() => handleClick('/jak-to-funguje')} className="hover:underline">Jak to funguje</button>
        <button onClick={() => handleClick('/gdpr')} className="hover:underline">Zpracování dat</button>
        <a
          href="https://uradprolidi.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Úřad pro lidi (BETA)
        </a>
      </div>
      <p className="mt-2">&copy; {new Date().getFullYear()} Lékař pro lidi</p>
    </footer>
  );
}
