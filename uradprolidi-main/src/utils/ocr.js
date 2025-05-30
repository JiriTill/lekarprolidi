import Tesseract from 'tesseract.js';

export const recognizeTextFromImage = async (file) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(file, 'ces', {
      logger: (m) => console.log(m), // můžeš odebrat, pokud nechceš ladit
    })
      .then(({ data: { text } }) => {
        resolve(text);
      })
      .catch((err) => {
        console.error('OCR error:', err);
        reject(err);
      });
  });
};
