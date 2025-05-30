import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Jak to funguje</h1>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Nástroj <strong>Úřad pro lidi</strong> je jednoduchý překladač, který pomocí umělé inteligence přeloží složité úřední dopisy do srozumitelné řeči.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📥 1. Nahrajte dokument</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Můžete:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>vložit text dokumentu ručně,</li>
          <li>nahrát PDF soubor (fungují i skeny!),</li>
          <li>vyfotit fotku dokumentu přímo z mobilu.</li>
        </ul>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Systém automaticky rozpozná text i ze skenů a obrázků pomocí OCR.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🛡️ 2. Potvrďte souhlas</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Aby bylo vše v pořádku, požádáme vás o:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>souhlas s tím, že výstup není právní rada,</li>
          <li>souhlas se zpracováním dat během překladu.</li>
        </ul>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Žádná data se neukládají a dokumenty jsou ihned po překladu zapomenuty.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">⚙️ 3. Klikněte na „Přelož do člověčiny“</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Po kliknutí se dokument odešle k umělé inteligenci, která během několika sekund vytvoří přehledný a lidský souhrn.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📄 4. Výstup: co, kdo, kdy a jak</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Výstupem je jednoduché vysvětlení: <em>o co jde, co se po vás chce, do kdy a jak to máte udělat.</em>
          Vše zůstává pouze na obrazovce, nikde jinde.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🔒 Soukromí a bezpečnost</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Vaše dokumenty se neukládají. Nepoužíváme žádné trackery, cookies ani reklamy. Cílem je čistá pomoc — bez háčků.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Zpět k překladu do člověčiny
        </Link>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6 border-t mt-8">
        <div className="space-x-4">
          <Link to="/o-projektu" className="hover:underline">O projektu</Link>
          <Link to="/jak-to-funguje" className="hover:underline">Jak to funguje</Link>
          <Link to="/gdpr" className="hover:underline">Zpracování dat</Link>
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Úřad pro lidi</p>
      </footer>
    </div>
  );
}

