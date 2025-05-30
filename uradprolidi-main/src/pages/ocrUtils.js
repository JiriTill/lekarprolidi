import Tesseract from 'tesseract.js';

export async function recognizeTextFromImage(imageFile) {
  const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
  return text;
}
