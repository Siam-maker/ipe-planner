import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface ExportPdfOptions {
  element: HTMLElement;
  fileName: string;
  reportTitle: string;
  studentName: string;
  level: number;
  term: number;
  watermark?: string;
}

/**
 * Captures an HTML element and exports it as a clean, high-resolution A4 PDF document.
 * Automatically slices long content across multiple pages with official BUET IPE header on page 1.
 */
export async function exportElementToPdf({
  element,
  fileName,
  reportTitle,
  studentName,
  level,
  term,
}: ExportPdfOptions): Promise<void> {
  // Create an offscreen wrapper with formal academic styling for the PDF
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove interactive buttons, inputs icons that shouldn't appear in printed PDF
  const buttonsToRemove = clone.querySelectorAll('button:not(.keep-in-print), .no-print');
  buttonsToRemove.forEach((btn) => btn.remove());

  // Force expand any collapsed containers or inputs to show their values
  clone.querySelectorAll('input').forEach((input) => {
    const span = document.createElement('span');
    span.textContent = input.value || input.placeholder || '—';
    span.className = 'font-mono font-bold text-[#2B2622] text-sm';
    input.parentNode?.replaceChild(span, input);
  });

  clone.querySelectorAll('select').forEach((select) => {
    const span = document.createElement('span');
    const selectedOption = select.options[select.selectedIndex];
    span.textContent = selectedOption ? selectedOption.text : '—';
    span.className = 'font-mono font-bold text-[#2B2622] text-sm';
    select.parentNode?.replaceChild(span, select);
  });

  // Create temporary container attached to document for html2canvas rendering
  const printWrapper = document.createElement('div');
  printWrapper.id = 'pdf-render-temp-container';
  printWrapper.style.position = 'fixed';
  printWrapper.style.top = '-99999px';
  printWrapper.style.left = '-99999px';
  printWrapper.style.width = '880px'; // optimal desktop rendering width for A4
  printWrapper.style.backgroundColor = '#FAF6F0';
  printWrapper.style.color = '#2B2622';
  printWrapper.style.padding = '36px 36px 48px 36px';
  printWrapper.style.fontFamily = 'Plus Jakarta Sans, sans-serif';
  printWrapper.style.boxSizing = 'border-box';
  printWrapper.style.zIndex = '-9999';

  // Formal Academic Document Header
  const headerHtml = `
    <div style="border-bottom: 2px solid #C65D3B; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px; font-weight: 800; color: #2B2622; letter-spacing: -0.5px;">IPE Study Planner</span>
          <span style="background-color: #EBE4D8; color: #C65D3B; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid #DCD3C5; font-family: monospace;">BUET</span>
        </div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6E655F; font-weight: 500;">Department of Industrial & Production Engineering · BUET</p>
        <h1 style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #C65D3B;">${reportTitle}</h1>
      </div>
      <div style="text-align: right; font-size: 11px; color: #6E655F; line-height: 1.5;">
        <div><strong>Student:</strong> <span style="color: #2B2622; font-weight: 600;">${studentName}</span></div>
        <div><strong>Academic Term:</strong> <span style="color: #2B2622; font-weight: 600;">Level ${level}, Term ${term === 1 ? 'I' : 'II'}</span></div>
        <div><strong>Generated:</strong> <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
      </div>
    </div>
  `;

  // Formal Academic Document Footer
  const footerHtml = `
    <div style="margin-top: 32px; padding-top: 14px; border-top: 1px solid #E2DACF; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #8C827A;">
      <span>BUET Department of Industrial & Production Engineering · IPE Study Planner</span>
      <span>Official Student Record Export · Page 1 of 1</span>
    </div>
  `;

  printWrapper.innerHTML = headerHtml;
  printWrapper.appendChild(clone);

  const footerEl = document.createElement('div');
  footerEl.innerHTML = footerHtml;
  printWrapper.appendChild(footerEl);

  document.body.appendChild(printWrapper);

  try {
    const canvas = await html2canvas(printWrapper, {
      scale: 2, // 2x DPI for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#FAF6F0',
      windowWidth: 1000,
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 Dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 190mm
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Handle single or multi-page PDF output
    let heightLeft = contentHeight;
    let position = 0;
    const pagePrintHeight = pageHeight - margin * 2;

    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, '', 'FAST');
    heightLeft -= pagePrintHeight;

    while (heightLeft > 0) {
      position -= pagePrintHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + position, contentWidth, contentHeight, '', 'FAST');
      heightLeft -= pagePrintHeight;
    }

    // Trigger download
    pdf.save(fileName);
  } finally {
    // Clean up temporary DOM element
    if (document.body.contains(printWrapper)) {
      document.body.removeChild(printWrapper);
    }
  }
}
