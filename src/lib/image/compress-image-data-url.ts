/** Reduz data URL de imagem para caber em user_metadata / colunas text sem estourar payload. */

const MAX_EDGE_PX = 256;
const JPEG_QUALITY = 0.82;

export async function compressImageDataUrl(dataUrl: string): Promise<string> {
  if (typeof window === "undefined") return dataUrl;
  if (!dataUrl.startsWith("data:image/")) return dataUrl;

  const image = await loadImage(dataUrl);
  const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, MAX_EDGE_PX);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return dataUrl;

  context.drawImage(image, 0, 0, width, height);

  try {
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return dataUrl;
  }
}

function fitWithin(width: number, height: number, maxEdge: number) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };

  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    image.src = src;
  });
}
