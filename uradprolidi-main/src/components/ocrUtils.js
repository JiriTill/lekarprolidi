export const resizeImageBase64 = (base64Image, maxSize = 1200) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1); // No upscaling
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
      resolve(resizedBase64);
    };

    img.onerror = reject;
    img.src = base64Image;
  });
};
