import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Převádí PDF soubor (File nebo Blob) na base64 obrázky jednotlivých stránek.
 * @param {File} file - PDF soubor nahraný uživatelem
 * @returns {Promise<string[]>} - Array s base64 PNG obrázky (jedna položka = jedna stránka)
 */
export async function pdfToImages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const images = [];

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/png');
    images.push(dataUrl);
  }

  return images;
}
