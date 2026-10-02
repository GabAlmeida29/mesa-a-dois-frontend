import type { Area } from 'react-easy-crop';

const MAX_OUTPUT = 1600;
const JPEG_QUALITY = 0.92;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Imagem não suportada pelo navegador'));
    image.src = src;
  });
}

export async function cropToSquare(src: string, area: Area): Promise<Blob> {
  const image = await loadImage(src);
  const size = Math.min(MAX_OUTPUT, Math.round(area.width));
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem'))),
      'image/jpeg',
      JPEG_QUALITY,
    ),
  );
}

export const canPreview = (src: string) =>
  loadImage(src).then(
    () => true,
    () => false,
  );
