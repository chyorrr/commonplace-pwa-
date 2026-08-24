import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportBoardOptions {
  format: 'png' | 'jpg' | 'pdf';
  filename?: string;
}

/**
 * Capture exact rendered board element and auto-download as high-resolution PNG or JPG
 */
export async function exportBoardAsImage(
  element: HTMLElement,
  format: 'png' | 'jpg' = 'png',
  filename?: string
): Promise<string> {
  const scale = 2; // 2x Retina high-definition
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    windowWidth: element.scrollWidth || window.innerWidth,
    windowHeight: element.scrollHeight || window.innerHeight,
  });

  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpg' ? 0.95 : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  const finalName = filename || `scrapbook-board.${format}`;
  await triggerAutoDownload(dataUrl, finalName);
  return dataUrl;
}

/**
 * Capture exact rendered board element and auto-download as real formatted PDF
 */
export async function exportBoardAsPdf(
  element: HTMLElement,
  filename?: string
): Promise<void> {
  const scale = 2;
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    windowWidth: element.scrollWidth || window.innerWidth,
    windowHeight: element.scrollHeight || window.innerHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const widthPx = canvas.width / scale;
  const heightPx = canvas.height / scale;

  // Create PDF sized exactly to the canvas dimensions
  const orientation = widthPx > heightPx ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'px',
    format: [widthPx, heightPx],
  });

  doc.addImage(imgData, 'JPEG', 0, 0, widthPx, heightPx);
  const finalName = filename || 'scrapbook-board.pdf';
  doc.save(finalName);
}

/**
 * Trigger immediate browser file download (and native file share on iOS Safari where available)
 */
export async function triggerAutoDownload(dataUrl: string, filename: string) {
  // 1. Try iOS Web Share API with Files if supported
  if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).share) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      if ((navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({
          files: [file],
          title: filename,
        });
        return;
      }
    } catch (e) {
      console.warn('Native share fallback to download link:', e);
    }
  }

  // 2. Direct browser auto-download
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
