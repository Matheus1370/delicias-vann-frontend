export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export async function arquivoParaDataURL(
  file: File,
  opts: ResizeOptions = {},
): Promise<string> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.78, mimeType = 'image/jpeg' } = opts;

  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onerror = () => reject(new Error('imagem inválida'));
    el.onload = () => resolve(el);
    el.src = dataURL;
  });

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas não suportado');
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL(mimeType, quality);
}
