import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProposalData } from '../types';
import { buildProposalHtml } from './printProposal';

/**
 * Renders the 4 proposal pages in an off-screen high-fidelity container,
 * rasterizes each page with html2canvas at high resolution, and compiles
 * a pristine 4-page A4 PDF file directly downloaded to the user's device.
 */
export async function downloadProposalPdf(
  data: ProposalData,
  onProgress?: (msg: string) => void
): Promise<void> {
  onProgress?.('Preparando páginas da proposta...');

  // Create an isolated container in DOM with strict A4 dimensions
  const container = document.createElement('div');
  container.id = 'ciavolt-pdf-render-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // 210mm in standard 96dpi web pixels
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-99999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';

  // Inject the raw HTML rendered pages (without toolbar)
  const fullHtml = buildProposalHtml(data);
  
  // Extract only the pages-container HTML
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(fullHtml, 'text/html');
  const pagesContainer = parsedDoc.querySelector('.pages-container');
  const styles = parsedDoc.querySelectorAll('style, link[rel="stylesheet"]');

  if (!pagesContainer) {
    throw new Error('Falha ao estruturar as páginas da proposta.');
  }

  // Append stylesheets to container
  styles.forEach((styleTag) => {
    container.appendChild(styleTag.cloneNode(true));
  });

  // Create inner wrapper with exact A4 page width (794px = 210mm)
  const innerWrapper = document.createElement('div');
  innerWrapper.style.width = '794px';
  innerWrapper.style.margin = '0';
  innerWrapper.style.padding = '0';
  innerWrapper.innerHTML = pagesContainer.innerHTML;

  container.appendChild(innerWrapper);
  document.body.appendChild(container);

  try {
    // Wait for web fonts & images to render
    if (document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));

    const pageElements = container.querySelectorAll<HTMLElement>('.page');
    if (pageElements.length === 0) {
      throw new Error('Nenhuma página encontrada para exportação.');
    }

    // Initialize jsPDF A4 portrait document (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const totalPages = pageElements.length;

    for (let i = 0; i < totalPages; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`Processando página ${i + 1} de ${totalPages}...`);

      // Temporary set exact dimensions on the page during snapshot
      pageEl.style.width = '794px';
      pageEl.style.height = '1123px'; // 297mm in 96dpi
      pageEl.style.minHeight = '1123px';
      pageEl.style.maxHeight = '1123px';
      pageEl.style.overflow = 'hidden';
      pageEl.style.margin = '0';
      pageEl.style.boxShadow = 'none';

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x resolution for crisp high-DPI output
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Add to PDF taking up the entire 210mm x 297mm sheet
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    onProgress?.('Finalizando download do arquivo PDF...');

    // Generate filename
    const cleanNumber = (data.proposalNumber || 'CR-2026-001').replace(/[^a-zA-Z0-9-_]/g, '_');
    const cleanClient = (data.clientName || 'Cliente').replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 20);
    const fileName = `Proposta_CIAVOLT_${cleanNumber}_${cleanClient}.pdf`;

    pdf.save(fileName);
  } finally {
    // Cleanup container from DOM
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
