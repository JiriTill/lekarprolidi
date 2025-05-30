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
  const [mode, setMode] = useState('report');

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
          mode: mode,
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
                Proto jsem vytvořil nástroj, který vám je přeloží do srozumitelné lidské řeči.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded shadow text-sm mb-6">
                <p className="font-semibold mb-2">Jak to funguje?</p>
                <ol className="list-decimal ml-6 space-y-1">
                  <li>Vyberte, co chcete přeložit – lékařskou zprávu nebo rozbor krve.</li>
                  <li>Vložte text, nebo nahrajte dokument / fotku z mobilu.</li>
                  <li>Za pár sekund obdržíte srozumitelný výklad, kterému porozumí každý.</li>
                </ol>
              </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-800 mb-2">Zvolte typ dokumentu:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" value="report" checked={mode === 'report'} onChange={() => setMode('report')} />
                Lékařská zpráva
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" value="blood" checked={mode === 'blood'} onChange={() => setMode('blood')} />
                Rozbor krve
              </label>
            </div>
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
            <button
              className={`flex-1 py-3 rounded-lg text-lg font-semibold transition shadow ${
                consentChecked && gdprChecked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!consentChecked || !gdprChecked}
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
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-4">
              <span className="animate-spin">🔄</span>
              <span>Zpracovávám... ({seconds}s)</span>
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
