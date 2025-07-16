import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-center text-sm text-gray-500 py-6 border-t mt-8">
      <div className="space-x-4">
        <Link to="/o-projektu" className="hover:underline">O projektu</Link>
        <Link to="/jak-to-funguje" className="hover:underline">Jak to funguje</Link>
        <Link to="/gdpr" className="hover:underline">Zpracování dat</Link>
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
