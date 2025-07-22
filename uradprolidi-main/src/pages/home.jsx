import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import FeedbackForm from '../components/FeedbackForm';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { pdfToImages } from '../utils/pdfToImages';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default function Home() {
  const [processedText, setProcessedText] = useState(''); // Consolidated text content
  const [output, setOutput] = useState('');
  const [uploadStatusMessage, setUploadStatusMessage] = useState(''); // For user feedback messages
  const [consentChecked, setConsentChecked] = useState(false); //
  const [gdprChecked, setGdprChecked] = useState(false); //
  const [loading, setLoading] = useState(false); //
  const [seconds, setSeconds] = useState(0); //
  const [selectedType, setSelectedType] = useState(null); //
  const hasContent = processedText.trim().length > 0; //

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timer);
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const runOCR = async (imageBase64) => {
    try {
      const result = await Tesseract.recognize(imageBase64, 'ces'); // čeština
      return result.data.text;
    } catch (error) {
      console.error('Chyba při OCR:', error);
      setUploadStatusMessage('⚠️ Chyba při OCR: ' + error.message);
      return '';
    }
  };

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProcessedText(''); // Clear previous content
    setOutput(''); // Clear previous output
    setUploadStatusMessage('Zpracovávám nahraný text. Chvíli to může trvat.'); // Set loading message

    try {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        setUploadStatusMessage('⚠️ Soubor není PDF.'); // Use status message
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          let pdf;
          let fullText = ''; // Initialize fullText here

          try {
            const loadingTask = pdfjsLib.getDocument({ data: reader.result });
            pdf = await loadingTask.promise;

            // classical text extraction from pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              fullText += content.items.map((item) => item.str).join(' ') + '\n';
            }

          } catch (err) {
            console.warn('PDF nešlo přečíst standardní cestou, zkouším OCR:', err);
            setUploadStatusMessage('PDF neobsahuje čitelný text, zkouším OCR...'); // Indicate OCR attempt
            const images = await pdfToImages(file);
            let combinedOCRText = '';

            for (const imageBase64 of images) {
              const textFromImage = await runOCR(imageBase64);
              combinedOCRText += textFromImage + '\n';
            }
            fullText = combinedOCRText; // Use OCR text if standard extraction fails
          }

          // After both standard and OCR attempts, check fullText
          if (fullText.trim().length > 10) {
            setProcessedText(fullText); // Set to processedText
            setUploadStatusMessage('✅ Dokument úspěšně nahrán a zpracován.'); // Success message
          } else {
            setProcessedText(''); // Ensure text is cleared if nothing found
            setUploadStatusMessage('⚠️ Z dokumentu se nepodařilo rozpoznat žádný text (nebo je příliš krátký).'); // No text found
          }

        } catch (err) {
          console.error('Chyba při čtení nebo OCR PDF:', err);
          setProcessedText(''); // Clear text on error
          setUploadStatusMessage('⚠️ Chyba při zpracování PDF.'); // General processing error
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file); // This call should be *inside* the outer try block
    } catch (error) {
      console.error('Chyba při čtení PDF:', error);
      setProcessedText(''); // Clear text on error
      setUploadStatusMessage('⚠️ Nepodařilo se načíst PDF soubor.'); // File read error
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProcessedText(''); // Clear previous content
    setOutput(''); // Clear previous output
    setUploadStatusMessage('Zpracovávám nahraný text. Chvíli to může trvat.'); // Set loading message

    try {
      const base64 = await convertFileToBase64(file);
      const extractedText = await runOCR(base64);

      if (extractedText.trim().length > 10) {
        setProcessedText(extractedText); // Set to processedText
        setUploadStatusMessage('✅ Obrázek úspěšně nahrán a text rozpoznán.'); // Success message
      } else {
        setProcessedText(''); // Clear if not enough text
        setUploadStatusMessage('⚠️ Nerozpoznali jsme čitelný text z obrázku (nebo je příliš krátký).'); // No text found
      }
    } catch (err) {
      console.error('Chyba při načítání obrázku:', err);
      setProcessedText(''); // Clear on error
      setUploadStatusMessage('⚠️ Nepodařilo se načíst obrázek.'); // Error message
    } finally {
      setLoading(false);
    }
  };


  const handleCameraCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProcessedText(''); // Clear previous content
    setOutput(''); // Clear previous output
    setUploadStatusMessage('Zpracovávám nahraný text. Chvíli to může trvat.'); // Set loading message

    try {
      const base64 = await convertFileToBase64(file);
      const extractedText = await runOCR(base64);

      if (extractedText.trim().length > 10) {
        setProcessedText(extractedText); // Set to processedText
        setUploadStatusMessage('✅ Foto z kamery úspěšně nahráno a text rozpoznán.'); // Success message
      } else {
        setProcessedText(''); // Clear if not enough text
        setUploadStatusMessage("⚠️ Nerozpoznali jsme čitelný text z fotografie (nebo je příliš krátký)."); // No text found
      }
    } catch (err) {
      console.error('Chyba při načítání z kamery:', err);
      setProcessedText(''); // Clear on error
      setUploadStatusMessage('⚠️ Nepodařilo se načíst fotografii.'); // Error message
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      setUploadStatusMessage('⚠️ Vyberte, čemu chcete rozumět – lékařskou zprávu nebo rozbor krve.');
      return;
    }

    if (!processedText) {
      setUploadStatusMessage('⚠️ Nezadal jsi žádný text ani nenahrál dokument.');
      return;
    }

    setLoading(true);
    setOutput('');
    setUploadStatusMessage(''); // Clear messages before submission

    try {
      const prompt = selectedType === 'zprava'
        ? `🛡️ Tento překlad slouží pouze k lepšímu pochopení obsahu lékařské zprávy a nenahrazuje konzultaci s lékařem.

                      Přelož následující lékařskou zprávu nebo zdravotní dokument (např. výpis z vyšetření, propouštěcí zprávu, zprávu od specialisty) do jednoduché, srozumitelné češtiny vhodné pro běžného člověka bez lékařského vzdělání.

                      🔹 Drž se výhradně informací uvedených ve zprávě – **nepřidávej vlastní diagnózy, rady ani vysvětlení mimo text**.
                      🔹 Přelož odborné pojmy nebo zkratky do běžného jazyka a připoj stručné vysvětlení.
                      🔹 Pokud nějaké údaje chybí, uveď „Informace chybí“ nebo „Není uvedeno“.
                      🔹 Pokud zpráva obsahuje důležité nálezy (např. nálezy, které by mohly souviset se zdravotními potížemi), můžeš přidat upozornění, že by bylo vhodné obrátit se na lékaře.

                      🧾 Výstup strukturovaně rozděl do následujících částí:

                      🏥 Oddělení / specializace:
                      (např. neurologie, urologie; pokud není uvedeno, napiš „Není uvedeno“)

                      👤 Kdo je pacient:
                      (věk, pohlaví, důvod návštěvy – pokud není uvedeno, napiš „Informace chybí“)

                      📄 Co se zjistilo:
                      (stručně popiš hlavní zjištění ze zprávy, co bylo pozorováno)

                      🧪 Jaká vyšetření proběhla:
                      (např. ultrazvuk, krevní testy, RTG; pokud nejsou zmíněny, napiš „Není uvedeno“)

                      📋 Shrnutí lékařského nálezu:
                      (převyprávěj nález jednoduše, bez lékařské terminologie, ale bez vkládání domněnek)

                      🧠 Vysvětlení klíčových pojmů:
                      (přehled použitých odborných termínů a co znamenají, např. „CRP – zánětlivý ukazatel v krvi“)

                      ⚠️ Závěrem:
                      (pokud zpráva obsahuje závěr nebo doporučení, stručně je shrň; pokud ne, napiš „Závěr není uveden“. Pokud je něco důležitého, můžeš neutrálně napsat „V případě nejasností doporučujeme konzultaci s lékařem“)

                      Na konec připoj tuto poznámku:

                      🛡️ Tento výstup slouží pouze k orientaci v obsahu lékařské zprávy. Nejedná se o lékařskou radu. Pro přesné informace nebo další postup kontaktujte svého lékaře.`

        : `🛡️ Tento výstup slouží pouze k lepšímu pochopení výsledků krevního testu a nenahrazuje konzultaci s lékařem.

                      Vysvětli následující výsledky krevního rozboru jednoduše a přehledně. Výstup má být srozumitelný i pro běžného člověka bez lékařského vzdělání.

                      🔹 Drž se výhradně uvedených hodnot – **nepřidávej žádné diagnózy ani návrhy léčby**.
                      🔹 U každého parametru uveď stručné vysvětlení, co znamená.
                      🔹 Pokud je k dispozici referenční rozmezí, použij ho pro orientační určení, zda je hodnota „v normě“, „mírně mimo“ nebo „výrazně mimo normu“.
                      🔹 Pokud referenční hodnoty chybí, vycházej ze standardních rozmezí podle pohlaví a věku, pokud jsou tyto údaje uvedeny. Jinak napiš „Není uvedeno“.
                      🔹 Pokud je hodnota výrazně mimo běžné rozmezí, napiš neutrální upozornění, že by bylo vhodné konzultovat lékaře.
                      🔹 Nepoužívej žádná alarmující slova – zachovej neutrální a klidný tón.

                      🧾 Struktura výstupu pro každý parametr:

                      **Název parametru:**
                      (např. Hemoglobin, Leukocyty – uveď plný název i překlad zkratky, pokud existuje)
                      **Naměřená hodnota:**
                      (např. 136 g/l; pokud chybí, napiš „Není uvedena“)
                      **Co to znamená:**
                      (1–2 věty, co daný parametr v těle dělá, proč se měří)
                      **Hodnota v normě?:**
                      (napiš „v normě“, „mírně mimo normu“ nebo „výrazně mimo normu“; při posledním můžeš dodat „Doporučuje se konzultace s lékařem“)
                      📌 Zachovej pořadí parametrů tak, jak jsou ve vstupu, a seskup je logicky, pokud je to vhodné (např. jaterní testy, krevní obraz atd.).

                      Na závěr připoj poznámku:

                      🛡️ Tento výstup je určen pouze pro informativní účely a nenahrazuje lékařskou konzultaci. V případě nejasností se obraťte na svého lékaře.`
        ;

      if (!processedText || processedText.length < 10) {
        setUploadStatusMessage('⚠️ Vstupní text je příliš krátký.');
        setLoading(false);
        return;
      }

      let requestBody = {
        prompt,
        text: processedText // Use the consolidated processedText
      };

      const response = await fetch('/api/translateGpt4o', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setOutput(data.result || '⚠️ Odpověď je prázdná.');
      setUploadStatusMessage('✅ Překlad úspěšně dokončen.');
    } catch (error) {
      console.error('Frontend error:', error);
      setOutput('⚠️ Došlo k chybě při zpracování.');
      setUploadStatusMessage('⚠️ Došlo k chybě při zpracování požadavku.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProcessedText(''); // Clear the consolidated text
    setOutput('');
    setUploadStatusMessage(''); // Clear any upload status messages
    setConsentChecked(false);
    setGdprChecked(false);
    setLoading(false);
    setSeconds(0);
    // Optionally reset selectedType if you want:
    // setSelectedType(null);
  };

  const renderStructuredOutput = () => {
    if (!output) return null;
    // Keep this split method, but be aware of its coupling to the prompt's emojis.
    // If you control the API, sending structured JSON from the backend is ideal.
    const sections = output.split(/(?=\ud83c\udfe6|\ud83d\udc64|\ud83c\udd94|\ud83d\udcec|\ud83e\uddfe|\ud83d\udcc8|\ud83d\udccc|\ud83d\udce3|\ud83d\udccc)/g);
    return (
      <div className="bg-white border rounded shadow p-4 mb-4 whitespace-pre-wrap text-gray-800">
        {sections.map((section, index) => (
          <div key={index} className="mb-3">{section.trim()}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 font-sans flex-grow flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-2 text-center text-gray-900">Lékař pro lidi</h1>

          <p className="mb-4 text-center text-gray-700 text-lg">
            Lékařské zprávy jsou někdy oříškem i pro samotné lékaře. <br />
            Proto jsem vytvořil nástroj, který vám je přeloží do srozumitelné lidské řeči, člověčiny.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded shadow text-sm mb-6">
            <p className="font-semibold mb-2">Jak to funguje?</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Vyberte, co chcete přeložit – lékařskou zprávu nebo rozbor krve.</li>
              <li>Vložte text, nebo nahrajte dokument / fotku z mobilu.</li>
              <li>Za pár sekund obdržíte srozumitelný výklad, kterému porozumí každý.</li>
            </ol>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded ${selectedType === 'zprava' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedType('zprava')}
              disabled={loading} // Disable type selection during loading
            >
              📄 Lékařská zpráva
            </button>
            <button
              className={`px-4 py-2 rounded ${selectedType === 'rozbor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedType('rozbor')}
              disabled={loading} // Disable type selection during loading
            >
              💉 Rozbor krve
            </button>
          </div>

          {/* Conditional rendering of textarea based on whether content has been uploaded */}
          {!hasContent && (
            <textarea
              placeholder="Sem vložte text..."
              className="p-4 border border-gray-300 rounded bg-white shadow resize-none w-full mb-4"
              rows={8}
              value={processedText} // Now uses processedText for manual input too
              onChange={(e) => setProcessedText(e.target.value)}
              disabled={loading} // Disable manual input during loading
            />
          )}

          {hasContent && (
            <div className="bg-gray-100 border border-gray-300 rounded p-4 mb-4 text-gray-700 text-sm overflow-auto max-h-40">
              <p className="font-semibold mb-2">Vložený/Rozpoznaný text:</p>
              <pre className="whitespace-pre-wrap break-words">{processedText.substring(0, 500)}...</pre> {/* Show a preview */}
              <p className="text-right text-gray-500">({processedText.length} znaků)</p>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm text-gray-700">
              📂 Nahrát PDF:
              <input type="file" accept=".pdf" onChange={handlePDFUpload} className="mt-1" disabled={loading} />
            </label>

            <label className="text-sm text-gray-700">
              📂 Nahrát obrázek (ručně):
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1"
                disabled={loading}
              />
            </label>

            <label className="text-sm text-gray-700">
              📷 Vyfotit dokument mobilem:
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="mt-1"
                disabled={loading}
              />
            </label>
          </div>

          {uploadStatusMessage && (
            <div className={`p-3 rounded mb-4 text-sm ${
              uploadStatusMessage.startsWith('✅') ? 'bg-green-100 text-green-800' : // Success message
              (uploadStatusMessage.startsWith('⚠️') ? 'bg-red-100 text-red-800' : // Error/warning message
              'bg-orange-100 text-orange-800') // Default for processing or other informational messages
            }`}>
              {uploadStatusMessage}
            </div>
          )}


          <div className="bg-gray-50 rounded border p-4 mb-6 text-sm text-gray-700 space-y-2">
            <label className="block">
              <input type="checkbox" className="mr-2" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} disabled={loading} />
              Rozumím, že výstup není profesionální lékařská rada.
            </label>
            <label className="block">
              <input type="checkbox" className="mr-2" checked={gdprChecked} onChange={(e) => setGdprChecked(e.target.checked)} disabled={loading} />
              Souhlasím se zpracováním dat.
            </label>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow ${
                consentChecked && gdprChecked && hasContent && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!consentChecked || !gdprChecked || !hasContent || loading}
            >
              Přelož do lidské řeči
            </button>

            <button
              className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow ${
                loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
              onClick={handleClear}
              disabled={loading}
            >
              Vymazat vše
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center text-blue-600 text-sm mt-4">
              <p className="mb-1">⏳ Překlad může trvat až 60 vteřin. Díky za trpělivost.</p>
              <div className="flex items-center gap-2">
                <span className="animate-spin">🔄</span>
                <span>Zpracovávám... ({seconds}s)</span>
              </div>
            </div>
          )}

          {output && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Výstup:</h2>
              {renderStructuredOutput()}
              <FeedbackForm />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
