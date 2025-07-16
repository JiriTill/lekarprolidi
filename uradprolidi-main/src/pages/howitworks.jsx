import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Jak to funguje</h1>

        <p className="mb-4 text-gray-800 leading-relaxed">
          <strong>Lékař pro lidi</strong> je nástroj, který pomocí umělé inteligence překládá složité lékařské zprávy a krevní rozbory do srozumitelné lidské řeči.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📥 1. Vložte nebo nahrajte dokument</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Můžete:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>vložit text ručně,</li>
          <li>nahrát PDF soubor,</li>
          <li>nahrát fotku nebo použít fotoaparát v mobilu.</li>
        </ul>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Díky GPT-4o nástroj rozumí i obrázkům a skenům – žádné převody ani OCR nejsou potřeba.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🛡️ 2. Potvrďte souhlas</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Před překladem je potřeba:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>potvrdit, že výstup není lékařská rada,</li>
          <li>souhlasit se zpracováním dat během překladu.</li>
        </ul>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Data se nikam neukládají a po překladu jsou zapomenuta.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">⚙️ 3. Klikněte na „Přelož do lidské řeči“</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Umělá inteligence přečte text nebo obrázek a během pár vteřin připraví jasné a srozumitelné vysvětlení.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📄 4. Výstup: jasný a lidský</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Dostanete přehledný výstup, kterému porozumí každý – bez latiny a složitých zkratek.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🔒 Soukromí a bezpečnost</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Žádné trackery, žádné reklamy, žádné ukládání dat. Váš dokument je pouze váš – a hned po překladu mizí.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Zpět k překladu
        </Link>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6 border-t mt-8">
        <div className="space-x-4">
          <Link to="/o-projektu" className="hover:underline">O projektu</Link>
          <Link to="/jak-to-funguje" className="hover:underline">Jak to funguje</Link>
          <Link to="/gdpr" className="hover:underline">Zpracování dat</Link>
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Lékař pro lidi</p>
      </footer>
    </div>
  );
}

