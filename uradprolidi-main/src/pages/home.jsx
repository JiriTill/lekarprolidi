import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import FeedbackForm from '../components/FeedbackForm';
import { Link } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [cameraUploadSuccess, setCameraUploadSuccess] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState(null);

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

 const handlePDFUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const isPDF = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  if (isPDF) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(reader.result) });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(' ') + '\n';
        }

        if (fullText.trim().length > 10) {
          setPdfText(fullText);
        }
        setUploadSuccess(true);

      } catch (error) {
        console.error("Chyba při zpracování PDF:", error);
        alert('⚠️ Chyba při čtení PDF. Ujistěte se, že soubor je čitelný.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

    else if (isImage) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageBase64 = reader.result;
          setInputText(imageBase64); // This triggers GPT-4 Vision
          setUploadSuccess(true);
        } catch (err) {
          console.error('Chyba při načítání obrázku:', err);
          alert('⚠️ Nepodařilo se načíst obrázek. Zkuste jiný soubor.');
        }
      };
      reader.readAsDataURL(file);
    }
   };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';

    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setInputText(reader.result);
          setCameraUploadSuccess(true);
          setUploadSuccess(true);
        };
        reader.readAsDataURL(file);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

    const handleSubmit = async () => {
        if (!selectedType) {
          alert('⚠️ Vyberte, čemu chcete rozumět – lékařskou zprávu nebo rozbor krve.');
          return;
        }
      
        const finalText = inputText || pdfText;
      
        if (!finalText || finalText.trim().length < 5) {
          alert('⚠️ Nezadal jsi žádný text ani nenahrál dokument.');
          return;
        }
      
        setLoading(true);
        setOutput('');
      
        try {
          let prompt = '';
          if (selectedType === 'zprava') {
            prompt = `Vysvětli následující lékařskou zprávu lidským jazykem. Zaměř se pouze na to, co lékař píše, bez doporučení. Na konci přidej poznámku: "⚠️ Toto není lékařská rada, pouze srozumitelný překlad zprávy."`;
          } else if (selectedType === 'rozbor') {
            prompt = `Vysvětli jednotlivé hodnoty v tomto krevním rozboru lidským jazykem. Neuváděj diagnózy. Na konci přidej poznámku: "⚠️ Toto není lékařská rada, pouze srozumitelné vysvětlení hodnot."`;
          }
      
          const response = await fetch('/api/translateVision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: finalText,
              prompt: prompt,
            }),
          });

          const data = await response.json();
          setOutput(data.result || '⚠️ Odpověď je prázdná.');
        } catch (error) {
          console.error(error);
          setOutput('⚠️ Došlo k chybě při zpracování. Ujistěte se, že dokument je čitelný.');
        } finally {
          setLoading(false);
        }
      };

  const handleClear = () => {
    setInputText('');
    setOutput('');
    setPdfText('');
    setUploadSuccess(false);
    setCameraUploadSuccess(false);
    setConsentChecked(false);
    setGdprChecked(false);
    setLoading(false);
    setSeconds(0);
  };

  const renderStructuredOutput = () => {
    if (!output) return null;
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
                >
                  📄 Lékařská zpráva
                </button>
                <button
                  className={`px-4 py-2 rounded ${selectedType === 'rozbor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSelectedType('rozbor')}
                >
                  💉 Rozbor krve
                </button>
              </div>


          <textarea
            placeholder="Sem vložte text..."
            className="p-4 border border-gray-300 rounded bg-white shadow resize-none w-full mb-4"
            rows={8}
            value={inputText.startsWith('data:image/') ? '' : inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handlePDFUpload} className="mb-4" />
          {uploadSuccess && <span className="text-green-600 text-xl">✅</span>}

          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition mb-4"
            onClick={handleCameraCapture}
          >
            {cameraUploadSuccess ? '✅ Správně nahráno' : '📷 Vyfotit dokument mobilem'}
          </button>

          <div className="bg-gray-50 rounded border p-4 mb-6 text-sm text-gray-700 space-y-2">
            <label className="block">
              <input type="checkbox" className="mr-2" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
              Rozumím, že výstup není profesionální lékařská rada.
            </label>
            <label className="block">
              <input type="checkbox" className="mr-2" checked={gdprChecked} onChange={(e) => setGdprChecked(e.target.checked)} />
              Souhlasím se zpracováním dat.
            </label>
          </div>

          <div className="flex gap-4 mb-4">
            
            {(uploadSuccess || cameraUploadSuccess) && !inputText && !pdfText && (
              <p className="text-sm text-yellow-700 mb-2 text-center">⏳ Vyčkejte pár vteřin, než tlačítko zmodrá…</p>
            )}

            <button
              className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow ${
                consentChecked && gdprChecked && (inputText || pdfText)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!consentChecked || !gdprChecked || (!inputText && !pdfText)}
            >
              Přelož do lidské řeči
            </button>

            <button
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-400 transition shadow"
              onClick={handleClear}
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

      <footer className="text-center text-sm text-gray-500 py-4">
        <div className="space-x-4">
          <a href="/o-projektu" className="hover:underline">O projektu</a>
          <a href="/jak-to-funguje" className="hover:underline">Jak to funguje</a>
          <a href="/gdpr" className="hover:underline">Zpracování dat</a>
          <Link to="https://uradprolidi.vercel.app" className="hover:underline" target="_blank">Úřad pro lidi</Link>
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Lékař pro lidi</p>
      </footer>
    </div>
  );
}
