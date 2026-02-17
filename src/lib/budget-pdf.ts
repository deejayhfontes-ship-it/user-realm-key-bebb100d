import jsPDF from 'jspdf';
import type { BudgetWithLines, BudgetSettings } from '@/types/budget';

// Use absolute URLs for PDF generation
const fontesLogoSrc = '/images/logo-fontes-graphics.png';
const criateLogoSrc = '/images/logo-criate.png';

// Brand colors - Neon Green HSL(72, 100%, 51%) = RGB(204, 255, 0)
const NEON_GREEN = { r: 204, g: 255, b: 0 };
const BLACK = { r: 0, g: 0, b: 0 };
const DARK_GRAY = { r: 40, g: 40, b: 40 };
const LIGHT_GRAY = { r: 245, g: 245, b: 245 };
const MEDIUM_GRAY = { r: 120, g: 120, b: 120 };

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// Convert image to solid black (preserves shape/alpha, makes all visible pixels black)
async function loadImageAsBlack(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;     // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export interface PdfDisplayOptions {
  showItemPrices?: boolean;
  showItemTotals?: boolean;
  showTotals?: boolean;
}

export async function generateBudgetPDF(budget: BudgetWithLines, settings: BudgetSettings | null, displayOptions: PdfDisplayOptions = {}): Promise<jsPDF> {
  const { showItemPrices = true, showItemTotals = true, showTotals = true } = displayOptions;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // ========== HEADER - COMPANY INFO (left) ==========
  const hasCompanyInfo = settings?.company_name || settings?.company_document || 
                         settings?.company_address || settings?.company_phone || settings?.company_email;
  
  if (hasCompanyInfo) {
    if (settings?.company_name) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
      doc.text(settings.company_name, margin, y);
      y += 5;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
    
    if (settings?.company_document) {
      doc.text(`CNPJ: ${settings.company_document}`, margin, y);
      y += 4;
    }
    if (settings?.company_address) {
      doc.text(settings.company_address, margin, y);
      y += 4;
    }
    if (settings?.company_phone || settings?.company_email) {
      const contact = [settings.company_phone, settings.company_email].filter(Boolean).join(' | ');
      doc.text(contact, margin, y);
      y += 4;
    }
    y += 5;
  }

  // ========== TITLE BAR (Neon Green) ==========
  const titleBarY = Math.max(y, 30);
  
  // Neon green bar on the left
  doc.setFillColor(NEON_GREEN.r, NEON_GREEN.g, NEON_GREEN.b);
  doc.rect(margin, titleBarY, 95, 16, 'F');
  
  // Small accent square on the right
  doc.rect(pageWidth - margin - 10, titleBarY, 10, 16, 'F');
  
  // "BUDGET" title on the right of the green bar
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text('BUDGET', pageWidth - margin - 16, titleBarY + 10, { align: 'right' });
  
  // "orçamento" subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  doc.text('orçamento', pageWidth - margin - 16, titleBarY + 15, { align: 'right' });

  // ========== CLIENT INFO (left) & BUDGET INFO (right) ==========
  const infoSectionY = titleBarY + 25;
  
  // Client info (left side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text('Para:', margin, infoSectionY);
  
  doc.setFontSize(11);
  doc.text(budget.client_name, margin, infoSectionY + 6);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  
  let clientY = infoSectionY + 12;
  if (budget.client_address) {
    const addressLines = doc.splitTextToSize(budget.client_address, 80);
    doc.text(addressLines, margin, clientY);
    clientY += addressLines.length * 4;
  }
  if (budget.client_document) {
    doc.text(`CPF/CNPJ: ${budget.client_document}`, margin, clientY);
    clientY += 4;
  }
  if (budget.client_email) {
    doc.text(budget.client_email, margin, clientY);
    clientY += 4;
  }
  if (budget.client_phone) {
    doc.text(budget.client_phone, margin, clientY);
    clientY += 4;
  }

  // Budget number and date (right side)
  const rightX = pageWidth - margin;
  
  doc.setFontSize(9);
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  doc.setFont('helvetica', 'normal');
  doc.text('Orçamento #', rightX - 40, infoSectionY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text(budget.budget_number, rightX, infoSectionY, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  doc.text('Data', rightX - 40, infoSectionY + 7);
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text(formatDate(budget.date), rightX, infoSectionY + 7, { align: 'right' });
  
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  doc.text('Validade', rightX - 40, infoSectionY + 14);
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text(`${budget.validity_days} dias`, rightX, infoSectionY + 14, { align: 'right' });

  // Calculate table start position
  y = Math.max(clientY, infoSectionY + 22) + 8;

  // ========== ITEMS TABLE ==========
  
  // Table header with dark background
  doc.setFillColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b);
  doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
  
  // Neon accent line on top of header
  doc.setFillColor(NEON_GREEN.r, NEON_GREEN.g, NEON_GREEN.b);
  doc.rect(margin, y, pageWidth - 2 * margin, 1.5, 'F');
  
  // Adjust columns based on display options
  const colX = {
    num: margin + 8,
    desc: margin + 22,
    price: showItemPrices ? pageWidth - margin - 75 : 0,
    qty: showItemPrices && showItemTotals ? pageWidth - margin - 45 : 
         showItemTotals ? pageWidth - margin - 45 : 
         pageWidth - margin - 15,
    total: pageWidth - margin - 5,
  };

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('#', colX.num, y + 7, { align: 'center' });
  doc.text('Descrição do Item', colX.desc, y + 7);
  if (showItemPrices) {
    doc.text('Preço', colX.price, y + 7, { align: 'right' });
  }
  doc.text('Qtd.', colX.qty, y + 7, { align: 'center' });
  if (showItemTotals) {
    doc.text('Total', colX.total, y + 7, { align: 'right' });
  }
  
  y += 12;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  budget.lines.forEach((line, index) => {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b);
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 10, 'F');
    }

    // Row separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);

    doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
    doc.text(String(index + 1), colX.num, y + 2, { align: 'center' });
    
    // Truncate description if too long
    let desc = line.description;
    const maxDescWidth = 75;
    while (doc.getTextWidth(desc) > maxDescWidth && desc.length > 3) {
      desc = desc.slice(0, -4) + '...';
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(desc, colX.desc, y + 2);
    doc.setFont('helvetica', 'normal');
    if (showItemPrices) {
      doc.text(formatCurrency(line.unit_price), colX.price, y + 2, { align: 'right' });
    }
    doc.text(String(line.quantity), colX.qty, y + 2, { align: 'center' });
    if (showItemTotals) {
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(line.total), colX.total, y + 2, { align: 'right' });
      doc.setFont('helvetica', 'normal');
    }

    if (line.discount_value > 0) {
      y += 5;
      doc.setFontSize(7);
      doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
      const discountText = line.discount_type === 'percent' 
        ? `↳ Desconto: ${line.discount_value}%` 
        : `↳ Desconto: ${formatCurrency(line.discount_value)}`;
      doc.text(discountText, colX.desc + 5, y + 2);
      doc.setFontSize(9);
      doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
    }

    y += 10;
  });

  y += 5;

  // ========== TOTALS SECTION ==========
  
  // Left side: Thank you message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text('Agradecemos a preferência!', margin, y + 5);

  // Right side: Totals
  const totalsX = pageWidth - margin - 55;
  let totalsY = y;

  // Show subtotal and discounts only if showTotals is true
  if (showTotals) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
    doc.text('Subtotal:', totalsX, totalsY);
    doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
    doc.text(formatCurrency(budget.subtotal), pageWidth - margin, totalsY, { align: 'right' });
    totalsY += 6;

    if (budget.global_discount_value > 0) {
      doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
      const discountLabel = budget.global_discount_type === 'percent'
        ? `Desconto (${budget.global_discount_value}%):`
        : 'Desconto:';
      doc.text(discountLabel, totalsX, totalsY);
      const discountAmount = budget.global_discount_type === 'percent'
        ? budget.subtotal * (budget.global_discount_value / 100)
        : budget.global_discount_value;
      doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
      doc.text(`-${formatCurrency(discountAmount)}`, pageWidth - margin, totalsY, { align: 'right' });
      totalsY += 6;
    }

    if (budget.shipping > 0) {
      doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
      doc.text('Frete/Taxas:', totalsX, totalsY);
      doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
      doc.text(formatCurrency(budget.shipping), pageWidth - margin, totalsY, { align: 'right' });
      totalsY += 6;
    }

    totalsY += 2;
  }

  // Total with neon background - ALWAYS shown
  doc.setFillColor(NEON_GREEN.r, NEON_GREEN.g, NEON_GREEN.b);
  doc.rect(totalsX - 5, totalsY - 5, pageWidth - margin - totalsX + 10, 10, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text('Total:', totalsX, totalsY + 1);
  doc.text(formatCurrency(budget.total), pageWidth - margin, totalsY + 1, { align: 'right' });

  y = totalsY + 20;

  // ========== NOTES/CONDITIONS SECTION ==========
  if (budget.notes || settings?.default_notes) {
    if (y > 210) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
    doc.text('Termos e Condições', margin, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
    const notes = budget.notes || settings?.default_notes || '';
    const notesLines = doc.splitTextToSize(notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 4 + 8;
  }

  // ========== PAYMENT & CONFIDENTIALITY CLAUSES ==========
  if (y > 210) {
    doc.addPage();
    y = margin;
  }

  // Payment clause with neon accent
  doc.setFillColor(NEON_GREEN.r, NEON_GREEN.g, NEON_GREEN.b);
  doc.rect(margin, y, 3, 12, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BLACK.r, BLACK.g, BLACK.b);
  doc.text('Condição de Pagamento', margin + 6, y + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  const paymentText = 'Para aprovação e início de qualquer projeto, é exigido o pagamento de 50% do valor total como entrada. O saldo restante deverá ser quitado conforme acordado antes da entrega final.';
  const paymentLines = doc.splitTextToSize(paymentText, pageWidth - 2 * margin - 6);
  doc.text(paymentLines, margin + 6, y + 9);
  y += 12 + paymentLines.length * 3 + 5;

  // Confidentiality clause
  doc.setFillColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b);
  doc.rect(margin, y, pageWidth - 2 * margin, 16, 'F');
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CONFIDENCIALIDADE', margin + 4, y + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  const confidentialText = 'Este orçamento é de caráter exclusivo e confidencial, destinado unicamente ao destinatário acima identificado. A reprodução, compartilhamento ou divulgação não autorizada de seu conteúdo, total ou parcial, constitui violação à Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e demais normas aplicáveis, sujeitando o infrator às penalidades legais cabíveis.';
  const confidentialLines = doc.splitTextToSize(confidentialText, pageWidth - 2 * margin - 8);
  doc.text(confidentialLines, margin + 4, y + 9);
  y += 20;

  // ========== FOOTER ==========
  const showFontes = settings?.show_fontes_logo;
  const showCriate = settings?.show_criate_logo;
  
  // Footer separator line
  const footerY = pageHeight - 35;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // "Orçamento elaborado em parceria" text + logos
  if (showFontes || showCriate) {
    const logoY = pageHeight - 25;
    const logoHeight = 10;
    const logoMaxWidth = 28;
    
    try {
      // Partnership text
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
      
      const logos: { dataUrl: string; width: number }[] = [];
      
      if (showFontes) {
        const fontesBlack = await loadImageAsBlack(fontesLogoSrc);
        logos.push({ dataUrl: fontesBlack, width: logoMaxWidth });
      }
      
      if (showCriate) {
        const criateBlack = await loadImageAsBlack(criateLogoSrc);
        logos.push({ dataUrl: criateBlack, width: logoMaxWidth });
      }
      
      // Calculate layout
      const partnershipText = 'Orçamento elaborado em parceria';
      const textWidth = doc.getTextWidth(partnershipText);
      const totalLogosWidth = logos.length * logoMaxWidth + (logos.length - 1) * 8;
      const totalWidth = textWidth + 10 + totalLogosWidth;
      const startX = (pageWidth - totalWidth) / 2;
      
      // Draw text
      doc.text(partnershipText, startX, logoY + logoHeight / 2 + 1);
      
      // Draw logos
      let logoX = startX + textWidth + 10;
      logos.forEach((logo) => {
        doc.addImage(logo.dataUrl, 'PNG', logoX, logoY, logoMaxWidth, logoHeight);
        logoX += logoMaxWidth + 8;
      });
    } catch (error) {
      console.error('Error adding logos to PDF:', error);
    }
  }

  // Contact info at the very bottom
  const bottomY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b);
  
  const contactParts = [
    settings?.company_phone,
    settings?.company_email,
    settings?.company_address,
  ].filter(Boolean);
  
  if (contactParts.length > 0) {
    const contactText = contactParts.join('  |  ');
    doc.text(contactText, pageWidth / 2, bottomY, { align: 'center' });
  }

  return doc;
}

export function downloadBudgetPDF(budget: BudgetWithLines, settings: BudgetSettings | null, displayOptions: PdfDisplayOptions = {}) {
  generateBudgetPDF(budget, settings, displayOptions).then((doc) => {
    doc.save(`orcamento-${budget.budget_number}.pdf`);
  });
}
