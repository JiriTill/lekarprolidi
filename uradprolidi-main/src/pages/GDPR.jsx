import React from 'react';
import { Link } from 'react-router-dom';

export default function GDPR() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Zásady ochrany osobních údajů (GDPR)</h1>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Aplikace <strong>Úřad pro lidi</strong> je navržena tak, aby respektovala vaše soukromí. Nevyžaduje žádnou registraci a neuchovává žádná osobní data ani nahrané dokumenty.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🔄 Jak probíhá zpracování</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Vámi zadaný text, nahraný dokument nebo fotka jsou odeslány přes zabezpečené připojení na servery <strong>OpenAI</strong>, kde proběhne přepis nebo překlad do srozumitelného jazyka.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Společnost OpenAI, která provozuje tuto umělou inteligenci, je subjektem se sídlem v USA a zavázala se k dodržování přísných bezpečnostních a etických standardů včetně <strong>GDPR kompatibility</strong>. Více o jejich zásadách naleznete zde: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Privacy Policy</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🗂️ Uchovávání dat</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Úřad pro lidi žádná data <strong>neukládá</strong>, nesleduje uživatele a nepoužívá cookies ani analytické nástroje. Po překladu nejsou soubory ani texty nikde uchovávány — data se okamžitě „zapomenou“.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">✉️ Zpětná vazba</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Pokud nám pošlete zpětnou vazbu prostřednictvím formuláře, ukládám ji spolu s informacemi o zařízení a prohlížeči, ze kterého byla odeslána. Tyto informace slouží výhradně k analýze a ke zlepšení aplikace. Nejsou předávány třetím stranám ani využívány k marketingovým účelům.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🛡️ Váš souhlas</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Použitím této aplikace dáváte souhlas s jednorázovým zpracováním dat výhradně pro účely zjednodušení úředního dokumentu, nebo v případě zpětné vazby pro účely vylepšení služby. Tento souhlas je dobrovolný a nezbytný pro fungování aplikace.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📧 Kontakt na správce</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          V případě dotazů ke zpracování údajů mě kontaktujte prostřednictvím formuláře na stránce <a href="/o-projektu" className="text-blue-600 hover:underline">O projektu</a>.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Zpět k překladu do člověčiny
        </Link>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🚫 Upozornění na citlivé údaje</h2>
            <p className="mb-4 text-gray-800 leading-relaxed">
              Ačkoliv aplikace <strong>Úřad pro lidi</strong> neukládá žádná data a neslouží k ověřování totožnosti, <strong>nedoporučuji zadávat osobní údaje</strong>, jako je rodné číslo, datum narození, adresa trvalého bydliště nebo jiné citlivé informace.
            </p>
            <p className="mb-4 text-gray-800 leading-relaxed">
              Tyto údaje aplikace <strong>nepotřebuje, nezpracovává a ani nechce zpracovávat</strong>. Pokud se nacházejí na úředním dokumentu, doporučuji je před nahráním <strong>začernit nebo anonymizovat</strong>.
            </p>
            <p className="mb-4 text-gray-800 leading-relaxed">
              Toto je mé obecné doporučení jako člověka, který se ve veřejné správě dlouhodobě věnuje také bezpečnosti: <strong>osobní údaje nepatří na internet, pokud to není nezbytně nutné.</strong>
            </p>
        
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
