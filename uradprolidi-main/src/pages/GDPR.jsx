import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function GDPR() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Zásady ochrany osobních údajů (GDPR)</h1>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Aplikace <strong>Lékař pro lidi</strong> je navržena s maximálním důrazem na ochranu soukromí. Nepotřebuje žádnou registraci a neshromažďuje ani neukládá žádná data z nahraných zpráv nebo obrázků.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🔄 Jak probíhá zpracování</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Vaše vstupní data, ať už se jedná o text z nahraného dokumentu nebo fotografii pořízenou kamerou, jsou nejprve zpracována přímo ve vašem prohlížeči pomocí technologie **OCR (Optical Character Recognition)**, která převede text z obrázku do digitální podoby. 
          Následně je tento digitální text odeslán přes zabezpečené připojení na servery **OpenAI**, kde proběhne analýza a přepis do srozumitelné lidské řeči pomocí umělé inteligence.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          OpenAI je mezinárodní technologická společnost se sídlem v USA, která se zavázala k dodržování přísných bezpečnostních pravidel a zásad zpracování dat, včetně **GDPR kompatibility**. Více informací naleznete zde: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Privacy Policy</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📊 Google Ads a sledování</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Na stránce se zobrazují reklamy třetích stran prostřednictvím služby <strong>Google Ads</strong>. Tyto reklamy mohou používat tzv. cookies nebo jiné sledovací technologie za účelem zobrazování relevantního obsahu. S těmito údaji nijak nenakládám a nejsou spojeny s nahrávanými dokumenty.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Více o tom, jak Google pracuje s daty, se můžete dočíst zde: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zásady reklamy Google</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🗂️ Uchovávání dat</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          <strong>Lékař pro lidi</strong> žádná data <strong>neukládá</strong>, nepoužívá žádné vlastní cookies, a po překladu nejsou nahrané dokumenty ani výstupy nijak uchovávány. Vše probíhá jednorázově.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">✉️ Zpětná vazba</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Pokud pošlete zpětnou vazbu prostřednictvím formuláře, může být uložena spolu s informací o zařízení nebo prohlížeči. Tyto informace slouží výhradně pro zlepšování služby a nejsou předávány třetím stranám.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🛡️ Váš souhlas</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Použitím této aplikace dáváte souhlas s jednorázovým zpracováním vašich vstupních dat výhradně pro účely překladu nebo zpětné vazby. Tento souhlas je dobrovolný a nezbytný pro fungování služby.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">🚫 Upozornění na citlivé údaje</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Ačkoliv aplikace neukládá žádná data, <strong>nedoporučuji nahrávat osobní údaje</strong>, jako je rodné číslo, adresa, telefon nebo celé jméno. Není to nutné pro funkčnost nástroje.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Pokud se tyto údaje nacházejí ve zprávě, doporučuji je <strong>před odesláním anonymizovat nebo začernit</strong>.
        </p>
        <p className="mb-4 text-gray-800 leading-relaxed">
          Toto doporučení platí obecně pro jakýkoli nástroj na internetu: <strong>citlivé osobní údaje sdílejte pouze tehdy, pokud je to opravdu nezbytné.</strong>
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">📧 Kontakt na správce</h2>
        <p className="mb-4 text-gray-800 leading-relaxed">
          V případě dotazů mě můžete kontaktovat prostřednictvím formuláře na stránce <Link to="/o-projektu" className="text-blue-600 hover:underline">O projektu</Link>.
        </p>

          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Zpět k překladu do lidské řeči
          </Link>
      </main>

      <Footer />
    </div>
  );
}
