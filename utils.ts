
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function applyWatermark(imageBase64: string, text: string = "MEMORA FREE PREVIEW"): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageBase64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imageBase64);

      ctx.drawImage(img, 0, 0);

      // Watermark styling
      ctx.font = `${Math.floor(img.width / 15)}px Inter`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      
      // Tile watermark
      for(let i = -canvas.width; i < canvas.width; i += canvas.width/2) {
        for(let j = -canvas.height; j < canvas.height; j += canvas.height/4) {
          ctx.fillText(text, i, j);
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
  });
}

export function downloadImage(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
