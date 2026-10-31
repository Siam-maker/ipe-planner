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
 * Correctly reads live user inputs (grades, marks, checkboxes, text fields) from the original DOM
 * and replaces interactive controls with formal academic print representations.
 */
export async function exportElementToPdf({
  element,
  fileName,
  reportTitle,
  studentName,
  level,
  term,
}: ExportPdfOptions): Promise<void> {
  // Query all live form controls from the original DOM to preserve user inputs
  const origFormElements = Array.from(element.querySelectorAll<HTMLElement>('input, select, textarea'));

  // Clone the container DOM tree
  const clone = element.cloneNode(true) as HTMLElement;
  const cloneFormElements = Array.from(clone.querySelectorAll<HTMLElement>('input, select, textarea'));

  // 1. Convert all form controls into clean, permanent text/badges based on live inputs
  origFormElements.forEach((orig, idx) => {
    const cln = cloneFormElements[idx];
    if (!cln) return;

    if (orig instanceof HTMLSelectElement) {
      const selectedIndex = orig.selectedIndex;
      const selectedOption = selectedIndex >= 0 ? orig.options[selectedIndex] : null;
      const selectedValue = orig.value;
      const selectedText = selectedOption ? selectedOption.text.trim() : '';

      const replacement = document.createElement('div');
      replacement.style.display = 'inline-block';

      // Check if this is a GPA grade dropdown (e.g. "Select Grade" or "A+ · 4.00")
      if (
        !selectedValue ||
        selectedText.toLowerCase().includes('select grade') ||
        selectedValue === ''
      ) {
        replacement.innerHTML = `
          <span style="display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; font-family: monospace; background-color: #EBE4D8; color: #8C827A; border: 1px solid #DCD3C5;">
            Not Graded
          </span>
        `;
      } else {
        // User entered grade - display prominently as requested
        replacement.innerHTML = `
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; font-family: monospace; background-color: #F8ECE8; color: #A64525; border: 1.5px solid #C65D3B;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #C65D3B;"></span>
            <span>Grade: <strong>${selectedText}</strong></span>
          </span>
        `;
      }

      cln.parentNode?.replaceChild(replacement, cln);
    } else if (orig instanceof HTMLInputElement) {
      if (orig.type === 'checkbox') {
        const isChecked = orig.checked;
        const replacement = document.createElement('span');
        replacement.style.display = 'inline-flex';
        replacement.style.alignItems = 'center';
        replacement.style.fontSize = '11px';

        if (isChecked) {
          replacement.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 4px; color: #5B6B4E; font-weight: 700;">
              <span style="color: #5B6B4E; font-weight: 900;">✓</span> Completed
            </span>
          `;
        } else {
          replacement.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 4px; color: #8C827A; font-weight: 500;">
              <span style="color: #8C827A;">○</span> Pending
            </span>
          `;
        }
        cln.parentNode?.replaceChild(replacement, cln);
      } else {
        // Text / Number input (CT marks, attendance %, target GPA)
        const val = orig.value.trim();
        const replacement = document.createElement('span');
        replacement.style.display = 'inline-block';

        if (val) {
          replacement.innerHTML = `
            <span style="font-family: monospace; font-weight: 800; font-size: 13px; color: #2B2622; background-color: #F2EEE6; padding: 2px 8px; border-radius: 6px; border: 1px solid #DCD3C5; display: inline-block;">
              ${val}
            </span>
          `;
        } else {
          replacement.innerHTML = `
            <span style="font-family: monospace; font-size: 12px; color: #8C827A;">
              —
            </span>
          `;
        }
        cln.parentNode?.replaceChild(replacement, cln);
      }
    } else if (orig instanceof HTMLTextAreaElement) {
      const val = orig.value.trim();
      const replacement = document.createElement('div');
      replacement.style.fontFamily = 'monospace';
      replacement.style.fontSize = '12px';
      replacement.style.color = '#2B2622';
      replacement.textContent = val || '—';
      cln.parentNode?.replaceChild(replacement, cln);
    }
  });

  // 2. Make print badges visible in the exported document
  clone.querySelectorAll('.print-badge').forEach((el) => {
    (el as HTMLElement).style.display = 'inline-flex';
  });

  // 3. Remove non-printable elements and interactive buttons
  const elementsToRemove = clone.querySelectorAll('button:not(.keep-in-print), .no-print');
  elementsToRemove.forEach((el) => el.remove());

  // 4. Create temporary container attached to document for html2canvas rendering
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
      <span>Official Student Record Export</span>
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
