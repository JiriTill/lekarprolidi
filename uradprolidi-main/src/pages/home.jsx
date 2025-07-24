import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import FeedbackForm from '../components/FeedbackForm';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { pdfToImages } from '../utils/pdfToImages';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.mjs`;

// Combined and corrected Home component
const Home = () => {
    // State related to general app functionality
    const [inputText, setInputText] = useState('');
    const [uploadedFileTextForApi, setUploadedFileTextForApi] = useState('');
    const [output, setOutput] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);
    const [gdprChecked, setGdprChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [selectedType, setSelectedType] = useState(null);

    // Refs for hidden file input elements
    const fileUploadRef = useRef(null);
    const cameraCaptureRef = useRef(null);

    // State for Tesseract worker
    const [tesseractWorker, setTesseractWorker] = useState(null);
    // State to indicate if Tesseract worker is ready (important for disabling buttons)
    const [isTesseractReady, setIsTesseractReady] = useState(false);
    // State for Tesseract initialization errors
    const [errorMessage, setErrorMessage] = useState(null); // <-- ADDED THIS STATE

    // useEffect to initialize Tesseract worker once
    useEffect(() => {
        let workerInstance; // Declare workerInstance here for cleanup
        const initializeTesseract = async () => {
            try {
                // Ensure the worker is not already created (e.g., during fast refresh)
                if (tesseractWorker) {
                    console.log('Tesseract worker already exists, skipping initialization.');
                    setIsTesseractReady(true);
                    return;
                }

                setStatusMessage('Initializing Tesseract.js worker...');
                console.log('Initializing Tesseract.js worker...');

                workerInstance = Tesseract.createWorker({
                    workerPath: '/tesseract-data/worker.min.js',
                    langPath: '/tesseract-data/',
                    corePath: '/tesseract-data/tesseract-core.wasm',
                    logLevel: 'debug',
                });

                await workerInstance.load();
                await workerInstance.loadLanguage('ces');
                await workerInstance.initialize('ces');

                setTesseractWorker(workerInstance);
                setIsTesseractReady(true); // Mark Tesseract as ready
                setStatusMessage('Tesseract.js worker ready.');
                console.log('Tesseract.js worker initialized successfully.');
            } catch (error) {
                console.error('Failed to initialize Tesseract.js worker:', error);
                setErrorMessage('Chyba při inicializaci OCR enginu. Zkuste prosím obnovit stránku.'); // <-- USING THE NEW STATE
                setStatusMessage('⚠️ Chyba při inicializaci OCR enginu. Zkuste prosím obnovit stránku.');
                setIsTesseractReady(false); // Ensure button remains disabled
            }
        };

        initializeTesseract();

        // Cleanup function for the effect
        return () => {
            if (workerInstance) { // Use workerInstance declared in this effect scope
                console.log('Terminating Tesseract.js worker...');
                workerInstance.terminate();
            }
        };
    }, []); // Empty dependency array means this runs once on mount/unmount


    // Timer for loading feedback (runs whenever isLoading is true)
    useEffect(() => {
        let timer;
        if (isLoading) {
            timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else {
            clearInterval(timer);
            setSeconds(0);
        }
        return () => clearInterval(timer);
    }, [isLoading]);

    // Function to convert File object to Base64 for OCR processing
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // OCR function using the initialized Tesseract.js worker
    const runOCR = useCallback(async (imageData) => {
        if (!isTesseractReady || !tesseractWorker) {
            console.error('Tesseract worker is not initialized or ready.');
            setStatusMessage('⚠️ OCR engine není připraven. Zkuste prosím znovu.');
            return '';
        }
        try {
            setStatusMessage('Provádím OCR...');
            // Use the initialized worker here. Language is already loaded/initialized on the worker.
            const { data: { text } } = await tesseractWorker.recognize(imageData);
            return text;
        } catch (error) {
            console.error('Chyba při rozpoznávání textu (OCR):', error);
            setStatusMessage('⚠️ Chyba při rozpoznávání textu (OCR): ' + error.message);
            return ''; // Return empty string to indicate OCR failure for this image
        }
    }, [isTesseractReady, tesseractWorker]); // Depend on tesseractWorker and isTesseractReady


    // Consolidated handler for all file uploads (PDF and general images)
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!isTesseractReady) {
            setStatusMessage('⚠️ OCR engine se stále načítá. Zkuste prosím za chvíli.');
            return;
        }

        setIsLoading(true); // Start general loading for file processing
        setUploadedFileTextForApi(''); // Clear previous file content for API
        setInputText(''); // Clear manual input as a file is now being processed
        setOutput(''); // Clear previous output
        setStatusMessage('Zpracovávám nahraný dokument. Chvíli to může trvat.'); // Initial processing message

        try {
            if (file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = async () => {
                    let extractedFullText = '';
                    let specificErrorMessage = '';

                    try {
                        const loadingTask = pdfjsLib.getDocument({ data: reader.result });
                        const pdf = await loadingTask.promise;
                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const content = await page.getTextContent();
                            extractedFullText += content.items.map((item) => item.str).join(' ') + '\n';
                        }
                    } catch (stdPdfErr) {
                        console.warn('PDF standard text extraction failed, attempting OCR:', stdPdfErr);
                        setStatusMessage('PDF neobsahuje čitelný text, zkouším OCR...'); // Intermediate message

                        try {
                            const images = await pdfToImages(file);
                            if (!images || images.length === 0) {
                                throw new Error("Nepodařilo se převést PDF na obrázky pro OCR.");
                            }
                            for (const imageBase64 of images) {
                                // Use the runOCR function that uses the worker
                                extractedFullText += await runOCR(imageBase64) + '\n';
                            }
                        } catch (ocrProcessErr) {
                            console.error('Error during PDF to Image conversion or OCR process:', ocrProcessErr);
                            specificErrorMessage = '⚠️ Chyba při převodu PDF na obrázky nebo při OCR: ' + ocrProcessErr.message;
                            extractedFullText = '';
                        }
                    }

                    if (extractedFullText.trim().length > 10) {
                        setUploadedFileTextForApi(extractedFullText);
                        setStatusMessage('✅ Dokument úspěšně nahrán a zpracován.');
                    } else {
                        setUploadedFileTextForApi('');
                        if (specificErrorMessage) {
                            setStatusMessage(specificErrorMessage);
                        } else if (statusMessage.includes('Chyba při rozpoznávání textu (OCR)')) {
                            // runOCR already set a specific error, keep it.
                        } else {
                            setStatusMessage('⚠️ Z dokumentu se nepodařilo rozpoznat žádný text (nebo je příliš krátký).');
                        }
                    }
                    setIsLoading(false); // End loading
                };
                reader.readAsArrayBuffer(file);

            } else if (file.type.startsWith('image/')) {
                const base64 = await convertFileToBase64(file);
                // Use the runOCR function that uses the worker
                const extractedText = await runOCR(base64);

                if (extractedText.trim().length > 10) {
                    setUploadedFileTextForApi(extractedText);
                    setStatusMessage('✅ Obrázek úspěšně nahrán a text rozpoznán.');
                } else {
                    setUploadedFileTextForApi('');
                    if (!statusMessage.includes('Chyba při rozpoznávání textu (OCR)')) {
                        setStatusMessage('⚠️ Nerozpoznali jsme čitelný text z obrázku (nebo je příliš krátký).');
                    }
                }
                setIsLoading(false);

            } else {
                setStatusMessage('⚠️ Nepodporovaný typ souboru. Nahrajte PDF nebo obrázek.');
                setIsLoading(false);
            }
        } catch (outerError) {
            console.error('Chyba při nahrávání souboru:', outerError);
            setUploadedFileTextForApi('');
            setStatusMessage('⚠️ Nepodařilo se načíst soubor nebo došlo k vážné chybě.');
            setIsLoading(false);
        }
    };

    // Handler specifically for camera capture (mobile devices)
    const handleCameraCapture = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!isTesseractReady) {
            setStatusMessage('⚠️ OCR engine se stále načítá. Zkuste prosím za chvíli.');
            return;
        }

        setIsLoading(true); // Start general loading for file processing
        setUploadedFileTextForApi('');
        setInputText(''); // Clear manual input
        setOutput('');
        setStatusMessage('Zpracovávám nahraný dokument. Chvíli to může trvat.'); // Initial processing message

        try {
            const base64 = await convertFileToBase64(file);
            // Use the runOCR function that uses the worker
            const extractedText = await runOCR(base64);

            if (extractedText.trim().length > 10) {
                setUploadedFileTextForApi(extractedText);
                setStatusMessage('✅ Foto z kamery úspěšně nahráno a text rozpoznán.');
            } else {
                setUploadedFileTextForApi('');
                if (!statusMessage.includes('Chyba při rozpoznávání textu (OCR)')) {
                    setStatusMessage("⚠️ Nerozpoznali jsme čitelný text z fotografie (nebo je příliš krátký).");
                }
            }
        } catch (err) {
            console.error('Chyba při načítání z kamery:', err);
            setUploadedFileTextForApi('');
            setStatusMessage('⚠️ Nepodařilo se načíst fotografii.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handles the submission of processed text to the API
    const handleSubmit = async () => {
        if (!selectedType) {
            setStatusMessage('⚠️ Vyberte, čemu chcete rozumět – lékařskou zprávu nebo rozbor krve.');
            return;
        }

        // Determine which text to send to the API: file content if available, else manual input
        const finalTextToSend = uploadedFileTextForApi || inputText;

        if (!finalTextToSend || finalTextToSend.trim().length === 0) {
            setStatusMessage('⚠️ Nezadal jsi žádný text ani nenahrál dokument.');
            return;
        }

        setOutput(''); // Clear previous output
        setStatusMessage('Překládám do lidské řeči. Může to chvíli trvat.'); // Set translation specific message
        setIsLoading(true); // Start general loading for translation

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

            const response = await fetch('/api/translateGpt4o', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, text: finalTextToSend }),
            });

            const data = await response.json();
            setOutput(data.result || '⚠️ Odpověď je prázdná.');
            setStatusMessage('✅ Překlad úspěšně dokončen.'); // Final success message for translation
        } catch (error) {
            console.error('Frontend error:', error);
            setOutput('⚠️ Došlo k chybě při zpracování.');
            setStatusMessage('⚠️ Došlo k chybě při zpracování požadavku na překlad.');
        } finally {
            setIsLoading(false); // End loading
        }
    };

    // Clears all input and output fields
    const handleClear = () => {
        setInputText(''); // Clear manual input
        setUploadedFileTextForApi(''); // Clear file content for API
        setOutput('');
        setStatusMessage(''); // Clear any status messages
        setConsentChecked(false);
        setGdprChecked(false);
        setIsLoading(false);
        setSeconds(0);
        setSelectedType(null); // Reset selected type as well
        setErrorMessage(null); // Clear any Tesseract errors on clear
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
                            <h3 key={index} className="text-lg mt-4 mb-2 text-neutral-800">
                                {section.trim()}
                            </h3>
                        );
                    }
                    return <p key={index} className="mb-2 text-gray-700 text-base">{section.trim()}</p>;
                })}
            </div>
        );
    };

    // Helper to determine if the message is a "processing" message (not final success/error)
    const isProcessingMessage = (msg) => {
        return msg.includes('Zpracovávám') || msg.includes('Překládám') || msg.includes('zkouším OCR') || msg.includes('Provádím OCR');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4">
            <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-2xl my-8">
                <h1 className="text-5xl font-extrabold text-center text-blue-800 mb-4 tracking-tight">Lékař pro lidi</h1>
                <p className="mb-10 text-center text-gray-700 text-xl leading-relaxed">
                    Lékařské zprávy jsou někdy oříškem i pro samotné lékaře. <br />
                    Proto jsem vytvořil nástroj, který vám je přeloží do srozumitelné lidské řeči, člověčiny.
                </p>

                {/* Jak to funguje? section */}
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-5 rounded-lg shadow-inner text-base mb-10">
                    <p className="font-bold mb-3 text-lg">Jak to funguje?</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Vyberte, zda se jedná o Lékařskou zprávu nebo Rozbor krve.</li>
                        <li>Vložte text z dokumentu do textového pole, nebo nahrajte PDF či fotografii.</li>
                        <li>Souhlaste s podmínkami.</li>
                        <li>Klikněte na "Přelož do lidské řeči" a vyčkejte na překlad.</li>
                    </ul>
                </div>

                {/* GOOGLE AD UNIT - Integrated more smoothly */}
                <div className="my-8 flex justify-center">
                    <ins className="adsbygoogle"
                        style={{ display: 'block', textAlign: 'center' }}
                        data-ad-layout="in-article"
                        data-ad-format="fluid"
                        data-ad-client="ca-pub-YOUR_AD_CLIENT_ID" // Replace with your AdSense Client ID
                        data-ad-slot="YOUR_AD_SLOT_ID"></ins> {/* Replace with your AdSense Ad Slot ID */}
                </div>

                {/* Section 1: Document type selection */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
                    <p className="text-center text-gray-700 font-semibold text-lg mb-6">1. Vyberte typ dokumentu:</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            className={`flex-1 px-6 py-3 rounded-xl shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                                selectedType === 'zprava' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                            onClick={() => setSelectedType('zprava')}
                            disabled={isLoading}
                        >
                            <span className="text-xl mr-2">📄</span> Lékařská zpráva
                        </button>
                        <button
                            className={`flex-1 px-6 py-3 rounded-xl shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                                selectedType === 'rozbor' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                            onClick={() => setSelectedType('rozbor')}
                            disabled={isLoading}
                        >
                            <span className="text-xl mr-2">💉</span> Rozbor krve
                        </button>
                    </div>
                </div>

                {/* Section 2: Text input / upload buttons */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
                    <p className="text-center text-gray-700 font-semibold text-lg mb-6">2. Vložte text nebo nahrajte dokument:</p>
                    {/* Textarea for manual input only */}
                    <textarea
                        placeholder={"Sem vložte text ručně nebo nahrajte dokument pomocí tlačítek níže."}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-sm resize-none w-full min-h-[160px] mb-6 focus:outline-none focus:border-blue-500 transition-colors"
                        rows={8}
                        value={inputText} // Only bind to inputText
                        onChange={(e) => {
                            setInputText(e.target.value);
                            setUploadedFileTextForApi(''); // Clear file content if user starts typing manually
                            setStatusMessage(''); // Clear any previous status message
                        }}
                        disabled={isLoading}
                    />

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
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            className="flex-1 bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => fileUploadRef.current.click()}
                            disabled={isLoading || !isTesseractReady} // Disable if Tesseract is not ready
                        >
                            <span className="mr-2">📁</span> Nahrát dokument (PDF/Obrázek)
                        </button>
                        <button
                            className="flex-1 bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => cameraCaptureRef.current.click()}
                            disabled={isLoading || !isTesseractReady} // Disable if Tesseract is not ready
                        >
                            <span className="mr-2">📸</span> Vyfotit dokument mobilem
                        </button>
                    </div>
                </div>

                {/* Status message display (including loading animation for processing messages) */}
                {statusMessage && (
                    <div className={`p-4 rounded-lg mb-8 text-base font-medium flex items-center justify-center gap-2 ${
                        statusMessage.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-200' :
                        (statusMessage.startsWith('⚠️') ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200') // General processing messages
                    }`}>
                        {isLoading && isProcessingMessage(statusMessage) && (
                            <span className="animate-spin text-xl">🔄</span>
                        )}
                        <span>{statusMessage}</span>
                        {isLoading && isProcessingMessage(statusMessage) && (
                            <span className="ml-2">({seconds}s)</span>
                        )}
                    </div>
                )}

                {/* Section 3: Consent checkboxes */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
                    <p className="text-center text-gray-700 font-semibold text-lg mb-6">3. Souhlas s podmínkami:</p>
                    <div className="space-y-4">
                        <label className="flex items-center text-gray-700 text-base cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                                checked={consentChecked}
                                onChange={(e) => setConsentChecked(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className="leading-tight">Rozumím, že se nejedná o profesionální lékařskou radu.</span>
                        </label>
                        <label className="flex items-center text-gray-700 text-base cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600 rounded mr-3"
                                checked={gdprChecked}
                                onChange={(e) => setGdprChecked(e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className="leading-tight">Souhlasím se zpracováním vloženého dokumentu nebo textu. Data nejsou ukládána.</span>
                        </label>
                    </div>
                </div>

                {/* Submit and Clear buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button
                        className={`flex-1 py-4 rounded-xl text-xl font-bold transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus://focus:ring-blue-500 focus:ring-opacity-50 ${
                            selectedType && consentChecked && gdprChecked && (inputText.trim().length > 0 || uploadedFileTextForApi.trim().length > 0) && !isLoading
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        onClick={handleSubmit}
                        disabled={!selectedType || !consentChecked || !gdprChecked || (inputText.trim().length === 0 && uploadedFileTextForApi.trim().length === 0) || isLoading}
                    >
                        {isLoading && statusMessage.startsWith('Překládám') ? (
                            <span className="flex items-center justify-center">
                                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></span>
                                Překládám...
                            </span>
                        ) : (
                            'Přelož do lidské řeči'
                        )}
                    </button>

                    <button
                        className={`flex-1 py-4 rounded-xl text-xl font-bold transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ${
                            isLoading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        Vymazat vše
                    </button>
                </div>


                {/* Output section */}
                {output && (
                    <div className="mt-12 border-t pt-8 border-gray-200">
                        <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center">Výsledek překladu:</h2>
                        {renderStructuredOutput()}
                        <FeedbackForm />
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Home;
