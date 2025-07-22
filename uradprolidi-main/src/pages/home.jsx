import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import FeedbackForm from '../components/FeedbackForm';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer'; // Keep Footer import
import { pdfToImages } from '../utils/pdfToImages';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default function Home() {
  // Consolidated state for all text content (manual input, PDF, OCR)
  const [processedText, setProcessedText] = useState('');
  const [output, setOutput] = useState('');
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState(null);

  // Derived state: checks if there's any content to process
  const hasContent = processedText.trim().length > 0;

  // Refs for hidden file input elements
  const fileUploadRef = useRef(null);
  const cameraCaptureRef = useRef(null);

  // Timer for loading feedback
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

  // Function to convert File object to Base64 for OCR processing
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // OCR function using Tesseract.js
  const runOCR = async (imageBase64) => {
    try {
      const result = await Tesseract.recognize(imageBase64, 'ces'); // Use Czech language pack
      return result.data.text;
    } catch (error) {
      console.error('Chyba při rozpoznávání textu (OCR):', error);
      // Directly update the status message for OCR specific errors
      setUploadStatusMessage('⚠️ Chyba při rozpoznávání textu (OCR): ' + error.message);
      return ''; // Return empty string to indicate OCR failure for this image
    }
  };

  // Consolidated handler for all file uploads (PDF and general images)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProcessedText(''); // Clear previous content
    setOutput(''); // Clear previous output
    setUploadStatusMessage('Zpracovávám nahraný text. Chvíli to může trvat.'); // Initial general message

    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async () => {
          let extractedFullText = '';
          let specificErrorMessage = ''; // To store a more specific error message if OCR process itself fails

          try {
            // Attempt standard PDF text extraction
            const loadingTask = pdfjsLib.getDocument({ data: reader.result });
            const pdf = await loadingTask.promise;
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              extractedFullText += content.items.map((item) => item.str).join(' ') + '\n';
            }
          } catch (stdPdfErr) {
            // Standard PDF text extraction failed (e.g., scanned PDF), attempt OCR
            console.warn('PDF standard text extraction failed, attempting OCR:', stdPdfErr);
            setUploadStatusMessage('PDF neobsahuje čitelný text, zkouším OCR...'); // Intermediate message

            try {
              const images = await pdfToImages(file); // Converts PDF pages to images
              if (!images || images.length === 0) {
                // If pdfToImages returns no images, it's a conversion failure
                throw new Error("Nepodařilo se převést PDF na obrázky pro OCR.");
              }
              for (const imageBase64 of images) {
                // runOCR updates uploadStatusMessage directly on failure,
                // so we don't re-set it here if it's an OCR specific error
                extractedFullText += await runOCR(imageBase64) + '\n';
              }
            } catch (ocrProcessErr) {
              // This catch handles errors from pdfToImages or unexpected errors during OCR loop
              console.error('Error during PDF to Image conversion or OCR process:', ocrProcessErr);
              specificErrorMessage = '⚠️ Chyba při převodu PDF na obrázky nebo při OCR: ' + ocrProcessErr.message;
              extractedFullText = ''; // Clear text if OCR process itself failed
            }
          }

          // Final check and status message after all attempts (standard or OCR)
          if (extractedFullText.trim().length > 10) {
            setProcessedText(extractedFullText);
            setUploadStatusMessage('✅ Dokument úspěšně nahrán a zpracován.');
          } else {
            setProcessedText('');
            // Prioritize specific error messages (from OCR process or runOCR)
            if (specificErrorMessage) {
              setUploadStatusMessage(specificErrorMessage);
            } else if (uploadStatusMessage.includes('Chyba při rozpoznávání textu (OCR)')) {
               // runOCR already set a specific error, keep it. No need to set new message.
            } else {
              setUploadStatusMessage('⚠️ Z dokumentu se nepodařilo rozpoznat žádný text (nebo je příliš krátký).');
            }
          }
          setLoading(false); // Ensure loading is off
        };
        reader.readAsArrayBuffer(file);

      } else if (file.type.startsWith('image/')) {
        // Handle direct image uploads (e.g., JPEG, PNG)
        const base64 = await convertFileToBase64(file);
        const extractedText = await runOCR(base64);

        if (extractedText.trim().length > 10) {
          setProcessedText(extractedText);
          setUploadStatusMessage('✅ Obrázek úspěšně nahrán a text rozpoznán.');
        } else {
          setProcessedText('');
          // If runOCR already set a specific error message, keep it.
          if (!uploadStatusMessage.includes('Chyba při rozpoznávání textu (OCR)')) {
            setUploadStatusMessage('⚠️ Nerozpoznali jsme čitelný text z obrázku (nebo je příliš krátký).');
          }
        }
        setLoading(false);

      } else {
        setUploadStatusMessage('⚠️ Nepodporovaný typ souboru. Nahrajte PDF nebo obrázek.');
        setLoading(false);
      }
    } catch (outerError) {
      console.error('Chyba při nahrávání souboru:', outerError);
      setProcessedText('');
      setUploadStatusMessage('⚠️ Nepodařilo se načíst soubor nebo došlo k vážné chybě.');
      setLoading(false);
    }
  };

  // Handler specifically for camera capture (mobile devices)
  const handleCameraCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setProcessedText('');
    setOutput('');
    setUploadStatusMessage('Zpracovávám nahraný text. Chvíli to může trvat.');

    try {
      const base64 = await convertFileToBase64(file);
      const extractedText = await runOCR(base64); // runOCR sets its own error message

      if (extractedText.trim().length > 10) {
        setProcessedText(extractedText);
        setUploadStatusMessage('✅ Foto z kamery úspěšně nahráno a text rozpoznán.');
      } else {
        setProcessedText('');
        // If runOCR already set a specific error message, keep it.
        if (!uploadStatusMessage.includes('Chyba při rozpoznávání textu (OCR)')) {
          setUploadStatusMessage("⚠️ Nerozpoznali jsme čitelný text z fotografie (nebo je příliš krátký).");
        }
      }
    } catch (err) {
      console.error('Chyba při načítání z kamery:', err);
      setProcessedText('');
      setUploadStatusMessage('⚠️ Nepodařilo se načíst fotografii.');
    } finally {
      setLoading(false);
    }
  };

  // Handles the submission of processed text to the API
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
      // Define the prompt based on the selected document type
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

  // Clears all input and output fields
  const handleClear = () => {
    setProcessedText(''); // Clear the consolidated text
    setOutput('');
    setUploadStatusMessage(''); // Clear any upload status messages
    setConsentChecked(false);
    setGdprChecked(false);
    setLoading(false);
    setSeconds(0);
    setSelectedType(null); // Reset selected type as well
  };

  // Renders the structured output from the API response
  const renderStructuredOutput = () => {
    if (!output) return null;
    // Split output by specific emojis used in the prompt for structured display
    const sections = output.split(/(?=\ud83c\udfe6|\ud83c\udfe5|\ud83d\udc64|\ud83d\udcc4|\ud83e\uddea|\ud83d\udcdc|\ud83e\udde0|\u26a0\ufe0f)/);
    // Filter out empty strings from the split result
    const filteredSections = sections.filter(section => section.trim() !== '');

    return (
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-md break-words whitespace-pre-wrap">
        {filteredSections.map((section, index) => {
          // Determine if section starts with an emoji, then display as a strong heading
          if (section.startsWith('🏥') || section.startsWith('👤') || section.startsWith('📄') || section.startsWith('🧪') || section.startsWith('📋') || section.startsWith('🧠') || section.startsWith('⚠️') || section.startsWith('🛡️')) {
            return (
              <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-blue-700">
                {section.trim()}
              </h3>
            );
          }
          return <p key={index} className="mb-2 text-gray-800 text-sm">{section.trim()}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg my-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-4">Lékař pro lidi</h1>
        <p className="mb-8 text-center text-gray-700 text-lg"> {/* Increased mb-4 to mb-8 */}
          Lékařské zprávy jsou někdy oříškem i pro samotné lékaře. <br />
          Proto jsem vytvořil nástroj, který vám je přeloží do srozumitelné lidské řeči, člověčiny.
        </p>

        {/* Jak to funguje? section */}
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded shadow text-sm mb-8"> {/* Increased mb-6 to mb-8 */}
          <p className="font-semibold mb-2">Jak to funguje?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Vyberte, zda se jedná o Lékařskou zprávu nebo Rozbor krve.</li>
            <li>Vložte text z dokumentu do textového pole, nebo nahrajte PDF či fotografii.</li>
            <li>Souhlaste s podmínkami.</li>
            <li>Klikněte na "Přelož do lidské řeči" a vyčkejte na překlad.</li>
          </ul>
        </div>

            {/* START OF GOOGLE AD UNIT - MOVED LOCATION */}
            {/* IMPORTANT: Replace YOUR_AD_CLIENT_ID and YOUR_AD_SLOT_ID with your actual AdSense IDs */}
            <div className="my-4 flex justify-center">
                <ins className="adsbygoogle"
                     style={{ display: 'block', textAlign: 'center' }}
                     data-ad-layout="in-article"
                     data-ad-format="fluid"
                     data-ad-client="ca-pub-YOUR_AD_CLIENT_ID" // Replace with your AdSense Client ID (e.g., ca-pub-1234567890123456)
                     data-ad-slot="YOUR_AD_SLOT_ID"></ins> {/* Replace with your AdSense Ad Slot ID (e.g., 1234567890) */}
            </div>
            {/* END OF GOOGLE AD UNIT - MOVED LOCATION */}

        {/* Document type selection */}
        <p className="text-center text-gray-700 font-semibold mb-4">1. Vyberte typ dokumentu:</p>
        <div className="flex justify-center gap-4 mb-8"> {/* Increased mb-6 to mb-8 */}
          <button
            className={`px-4 py-2 rounded-lg shadow-sm ${ /* Added rounded-lg shadow-sm */
              selectedType === 'zprava' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            onClick={() => setSelectedType('zprava')}
            disabled={loading}
          >
            📄 Lékařská zpráva
          </button>
          <button
            className={`px-4 py-2 rounded-lg shadow-sm ${ /* Added rounded-lg shadow-sm */
              selectedType === 'rozbor' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            onClick={() => setSelectedType('rozbor')}
            disabled={loading}
          >
            💉 Rozbor krve
          </button>
        </div>

        {/* Text input / preview area */}
        <p className="text-center text-gray-700 font-semibold mb-4">2. Vložte text nebo nahrajte dokument:</p>
        {!hasContent ? (
          <textarea
            placeholder="Sem vložte text ručně nebo nahrajte dokument pomocí tlačítek níže." // New placeholder
            className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm resize-none w-full mb-6" /* Added rounded-lg, shadow-sm, mb-6 */
            rows={8}
            value={processedText}
            onChange={(e) => setProcessedText(e.target.value)}
            disabled={loading}
          />
        ) : (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 text-gray-700 text-sm overflow-auto max-h-40 shadow-sm"> {/* Added rounded-lg, shadow-sm, mb-6 */}
            <h3 className="font-semibold mb-2">Nahraný/vložený text:</h3>
            <pre className="whitespace-pre-wrap text-wrap">{processedText}</pre>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          ref={fileUploadRef}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment" // Suggests front or rear camera
          onChange={handleCameraCapture}
          ref={cameraCaptureRef}
          style={{ display: 'none' }}
        />

        {/* Upload buttons */}
        <div className="flex flex-col gap-4 mb-6"> {/* Increased mb-4 to mb-6 */}
          <button
            className="bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition shadow-md"
            onClick={() => fileUploadRef.current.click()}
            disabled={loading}
          >
            Nahrát dokument (PDF/Obrázek)
          </button>
          <button
            className="bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition shadow-md"
            onClick={() => cameraCaptureRef.current.click()}
            disabled={loading}
          >
            Vyfotit dokument mobilem
          </button>
        </div>

        {/* Status message display */}
        {uploadStatusMessage && (
          <div className={`p-3 rounded-lg mb-6 text-sm ${ /* Added rounded-lg, mb-6 */
            uploadStatusMessage.startsWith('✅') ? 'bg-green-100 text-green-800' :
            (uploadStatusMessage.startsWith('⚠️') ? 'bg-red-100 text-red-800' :
            'bg-orange-100 text-orange-800')
          }`}>
            {uploadStatusMessage}
          </div>
        )}

        {/* Consent checkboxes */}
        <p className="text-center text-gray-700 font-semibold mb-4">3. Souhlas s podmínkami:</p>
        <div className="mb-6 space-y-2"> {/* Increased mb-4 to mb-6 */}
          <label className="flex items-center text-gray-700 text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 mr-2"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              disabled={loading}
            />
            Rozumím, že se nejedná o profesionální lékařskou radu.
          </label>
          <label className="flex items-center text-gray-700 text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 mr-2"
              checked={gdprChecked}
              onChange={(e) => setGdprChecked(e.target.checked)}
              disabled={loading}
            />
            Souhlasím se zpracováním vloženého dokumentu nebo textu. Data nejsou ukládána.
          </label>
        </div>

        {/* Submit and Clear buttons */}
        <div className="flex gap-4 mb-4">
          <button
            className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow ${ /* Changed shadow to shadow-md if you want consistency with upload buttons */
              consentChecked && gdprChecked && hasContent && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            // Disabled if no type selected, no content, consents not checked, or loading
            disabled={!selectedType || !consentChecked || !gdprChecked || !hasContent || loading}
          >
            {/* Conditional content for loading spinner */}
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                Překládám...
              </span>
            ) : (
              'Přelož do lidské řeči'
            )}
          </button>

          {/* "Vymazat vše" button with refined style */}
          <button
            className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow-sm ${
              loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={handleClear}
            disabled={loading}
          >
            Vymazat vše
          </button>
        </div>

        {/* Loading indicator for translation */}
        {loading && (
          <div className="flex flex-col items-center text-blue-600 text-sm mt-4">
            <p className="mb-1">⏳ Překlad může trvat až 60 vteřin. Díky za trpělivost.</p>
            <div className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              <span>Zpracovávám... ({seconds}s)</span>
            </div>
          </div>
        )}

        {/* Output section */}
        {output && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Výstup:</h2>
            {renderStructuredOutput()}
            <FeedbackForm />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
