import html2canvas from 'html2canvas';

export interface ExportBoardOptions {
  format: 'png' | 'jpg';
  filename?: string;
}

export async function exportElementAsImage(
  element: HTMLElement,
  options: ExportBoardOptions = { format: 'png' }
): Promise<string> {
  const scale = 2; // 2x retina high-resolution capture
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = options.format === 'jpg' ? 0.92 : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  return dataUrl;
}

export async function downloadBoardImage(dataUrl: string, filename: string = 'commonplace-board.png') {
  // 1. If Web Share with files is supported (e.g. iOS Safari standalone)
  if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).share) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: blob.type });
      if ((navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({
          files: [file],
          title: filename,
        });
        return;
      }
    } catch (e) {
      console.warn('Native share error, falling back to download:', e);
    }
  }

  // 2. Standard browser download
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
