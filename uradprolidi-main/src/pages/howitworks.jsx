import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Jak to funguje</h1>

        <p className="mb-4 text-gray-800 leading-relaxed">
          <strong>Lékař pro lidi</strong> je jednoduchý nástroj, který pomocí umělé inteligence přeloží lékařské zprávy a krevní rozbory do srozumitelné řeči – tak, aby jim rozuměl opravdu každý.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📥 1. Nahrajte dokument nebo vložte text</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Můžete:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>vložit text lékařské zprávy ručně,</li>
          <li>nahrát PDF soubor,</li>
          <li>přiložit fotku nebo sken zprávy,</li>
          <li>vyfotit dokument přímo z mobilu.</li>
        </ul>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Nástroj si poradí i s fotkami nebo skeny – vše se automaticky převede na čitelný text pomocí nejnovější technologie.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🛡️ 2. Potvrďte souhlas</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Než zahájíte překlad, požádáme vás o dvě jednoduchá potvrzení:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-800">
          <li>souhlas s tím, že výstup není lékařská rada,</li>
          <li>souhlas se zpracováním dat během překladu.</li>
        </ul>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Bez těchto souhlasů překlad neproběhne – je to základní ochrana vás i provozovatele.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">⚙️ 3. Klikněte na „Přelož do lidské řeči“</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Po kliknutí se váš text nebo dokument odešle k umělé inteligenci, která během několika sekund vytvoří srozumitelný výklad bez odborných pojmů.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📄 4. Výstup: přehledně a lidsky</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Výstupem je přehledný a jednoduchý výklad: <em>co je napsáno, co se po vás chce, kdy to případně udělat a proč.</em> Nic víc, nic míň – bez diagnóz a bez doporučení.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🔒 Soukromí a bezpečnost</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Vaše dokumenty se <strong>neukládají</strong>. Nepoužíváme žádné trackery, cookies ani reklamy. Výstup se zobrazí pouze vám a po dokončení se nikde neuchovává.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Obsah dokumentu je automaticky odesílán k překladu do služby OpenAI, kde dojde ke zpracování pomocí umělé inteligence. Žádný člověk obsah nečte, vše probíhá strojově.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Přesto doporučuji – nejen zde, ale obecně na internetu – <strong>nikdy neposílejte osobní údaje</strong> jako rodné číslo, datum narození, adresu nebo jiné citlivé informace, pokud to není nezbytně nutné. Je to základní pravidlo digitální bezpečnosti.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Zpět k překladu do lidské řeči
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
