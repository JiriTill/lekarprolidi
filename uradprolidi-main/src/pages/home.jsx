import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import FeedbackForm from '../components/FeedbackForm';

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
          } else {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            const imageData = canvas.toDataURL();
            setInputText(imageData);
          }

          setUploadSuccess(true);
        } catch (error) {
          console.error("Chyba při zpracování PDF:", error);
          alert('⚠️ Chyba při čtení PDF. Ujistěte se, že soubor je čitelný.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputText(reader.result);
        setUploadSuccess(true);
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Podporovány jsou pouze PDF a obrázky.');
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
    if (!inputText && !pdfText) {
      alert('⚠️ Nezadal jsi žádný text ani nenahrál dokument.');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      const isImage = inputText.startsWith('data:image/');
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isImage ? 'image' : 'text',
          content: isImage ? inputText : pdfText || inputText,
        }),
      });

      const data = await response.json();
      setOutput(data.result || '⚠️ Odpověď je prázdná.');
    } catch (error) {
      console.error(error);
      setOutput('⚠️ Došlo k chybě při komunikaci se serverem.');
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

    const sections = output.split(/(?=🏛️|👤|🆔|📬|🧾|🟨|📌|📣|📎)/g);
    return (
      <div className="bg-white border rounded shadow p-4 mb-4 whitespace-pre-wrap text-gray-800">
        {sections.map((section, index) => (
          <div key={index} className="mb-3">
            {section.trim()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 font-sans flex-grow flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-2 text-center text-gray-900">Úřad pro lidi</h1>
          <p className="mb-2 text-center text-gray-700">
            Úřady mluví jazykem, kterému rozumí jen úřady. My to přeložíme do člověčiny.
          </p>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded text-sm mb-2 shadow">
            <p><strong>Vložte svůj úřední dokument</strong>, kterému nerozumíte, a my vám ho přeložíme do srozumitelné řeči. Řekneme vám, co po vás úředník vlastně chce.</p>
          </div>

          <p className="font-medium text-gray-800 mb-2">Vložte text, nebo nahrajte čitelný dokument (PDF nebo fotku):</p>

          <div className="flex flex-col gap-4 mb-4">
            <textarea
              placeholder="Sem vložte text z úřadu..."
              className="p-4 border border-gray-300 rounded bg-white shadow resize-none"
              rows={8}
              value={inputText.startsWith('data:image/') ? '' : inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Nahrát PDF nebo fotku (.pdf, .jpg, .png):</label>
              <div className="flex items-center gap-2">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handlePDFUpload} className="block" />
                {uploadSuccess && <span className="text-green-600 text-xl">✅</span>}
              </div>
            </div>

            <div>
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
                onClick={handleCameraCapture}
              >
                {cameraUploadSuccess ? '✅ Správně nahráno' : '📷 Vyfotit dokument mobilem'}
              </button>
              <p className="text-sm text-gray-600 mt-1">Funguje jen na mobilu. Text na fotce musí být dobře čitelný.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded border p-4 mb-6 text-sm text-gray-700 space-y-2">
            <label className="block">
              <input type="checkbox" className="mr-2" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
              Rozumím, že výstup není právní rada.
            </label>
            <label className="block">
              <input type="checkbox" className="mr-2" checked={gdprChecked} onChange={(e) => setGdprChecked(e.target.checked)} />
              Souhlasím se zpracováním dat.
            </label>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow ${
                consentChecked && gdprChecked
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!consentChecked || !gdprChecked}
            >
              Přelož do člověčiny
            </button>
            <button
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-400 transition shadow"
              onClick={handleClear}
            >
              Vymazat vše
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-4">
              <span className="animate-spin">🔄</span>
              <span>Zpracovávám... ({seconds}s)</span>
            </div>
          )}

          {output && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Výstup:</h2>
              {renderStructuredOutput()}
          
              {/* Komponenta pro zpětnou vazbu */}
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
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Úřad pro lidi</p>
      </footer>
    </div>
  );
}
