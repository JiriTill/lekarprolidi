import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">O projektu</h1> {/* Added text-center and increased mb */}

        <p className="mb-4 text-gray-800 leading-relaxed">
          Jmenuji se Jirka — a vsadím se, že většina z vás to má podobně: lékařská zprává je pro vás jako španělská vesnice. Plná zkratek, latinských výrazů a odborných formulací, kterým nikdo nerozumí. Lékařskou zprávu tedy vezmete a založíte ji někde doma a už se k ní nikdy nevrátite. Jenže teprve nedávno jsem si uvědomil, že by bylo fajn si přečíst, co mi tam doktor píše. Samozřejmě jsem skoro vůbec nevěděl, co tam vlastně zmiňuje. Říkal jsem si, proč nemůže doktor napsat, co mi vlastně je, lidsky.
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          A tak vznikl nápad: vytvořit jednoduchý nástroj, který přeloží lékařské zprávy do srozumitelné řeči. Nástroj, který pomůže každému pochopit, co přesně lékař napsal — bez diagnóz, bez domněnek, jen čisté vysvětlení.
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          <strong>Lékař pro lidi</strong> využívá umělou inteligenci a rozpoznávání textu z PDF nebo obrázků, aby přeložil lékařskou zprávu či rozbor krve do jazyka, kterému rozumí i laik. Cílem je, abyste věděli, co se děje s vaším tělem — bez zbytečného stresu.
        </p>

        <div className="flex justify-center my-6">
          <img
            src="/lekar.png"
            alt="Lékař pro lidi"
            className="max-w-full md:max-w-md rounded-lg shadow"
          />
        </div>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Tento projekt je nezávislý a bez ukládání dat. Vše stavím sám, za pomocí AI nástrojů. Chci, aby byl dostupný pro každého, kdo nechce tápat v lékařských výrazech a z rozborů krve se dozvědět více než jen: "Jo, je to v pořádku."
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Pokud se nástroj osvědčí, chci ho dále rozšiřovat — přidat vysvětlení laboratorních hodnot, vytvořit přehled běžných zkratek a výkladový slovníček. A hlavně: aby se lékařská komunikace stala srozumitelnější pro nás obyčejné lidi.
        </p>

        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md" // Updated class for consistency
        >
          Zpět k překladu do lidské řeči
        </Link>

        {/* --- Kontaktní formulář sekce s vylepšeným odsazením --- */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900">📬 Napište mi</h2>

        <form
          action="https://formspree.io/f/mdkznadv"
          method="POST"
          className="bg-white p-6 rounded-lg shadow-md space-y-4 mb-8" // Added mb-8 for spacing before footer
        >
          <div>
            <label htmlFor="name" className="block font-medium mb-1 text-gray-700">Jméno</label> {/* Added htmlFor and text-gray-700 */}
            <input
              type="text"
              id="name" // Added id
              name="name"
              required
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" // Updated class for consistency and focus style
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium mb-1 text-gray-700">E-mail</label> {/* Added htmlFor and text-gray-700 */}
            <input
              type="email"
              id="email" // Added id
              name="email"
              required
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" // Updated class
            />
          </div>
          <div>
            <label htmlFor="message" className="block font-medium mb-1 text-gray-700">Zpráva</label> {/* Added htmlFor and text-gray-700 */}
            <textarea
              id="message" // Added id
              name="message"
              required
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" // Updated class
            />
          </div>
          <input type="text" name="_gotcha" className="hidden" />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md" // Updated class
          >
            Odeslat zprávu
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
