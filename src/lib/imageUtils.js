export function resizeImageToBlob(file, maxDim = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = objUrl;
  });
}
