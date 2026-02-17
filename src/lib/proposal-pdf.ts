import jsPDF from 'jspdf';
import { Proposal, ProposalSettings, RecurrenceType } from '@/types/proposal';

// Use absolute URLs for PDF generation
const logoFontesUrl = '/images/logo-fontes-graphics.png';
const logoCriateUrl = '/images/logo-criate.png';

const CNPJ = '33.259.883/0001-08';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(): string {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' - Poços de Caldas, MG';
}

function getRecurrenceLabel(type: RecurrenceType): string {
  switch (type) {
    case 'monthly': return '/mês';
    case 'yearly': return '/ano';
    default: return '';
  }
}

function getContractPeriodLabel(months: number | null): string {
  if (!months) return '';
  if (months === 12) return '1 ano';
  if (months === 24) return '2 anos';
  if (months === 36) return '3 anos';
  return `${months} meses`;
}

async function loadImageAsDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Convert logo to dark version for light background
async function loadLogoAsDark(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Invert colors for dark logo on light bg
        for (let i = 0; i < data.length; i += 4) {
          // Keep alpha, darken bright pixels
          if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
            data[i] = 30;     // R
            data[i + 1] = 30; // G
            data[i + 2] = 30; // B
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function generateProposalPDF(
  proposal: Proposal,
  settings: ProposalSettings | null
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Colors - Light professional theme
  const accentGreen = [80, 160, 60] as const;  // Professional green
  const lightGray = [245, 245, 245] as const;
  const midGray = [100, 100, 100] as const;
  const darkText = [30, 30, 30] as const;
  const white = [255, 255, 255] as const;

  // White background (default for jsPDF)
  
  // Top accent line
  doc.setFillColor(...accentGreen);
  doc.rect(0, 0, pageWidth, 4, 'F');

  y = 15;

  // Header with logos
  try {
    const fontesDataUrl = await loadLogoAsDark(logoFontesUrl);
    doc.addImage(fontesDataUrl, 'PNG', margin, y, 45, 18);
  } catch (e) {
    console.error('Error loading Fontes logo:', e);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...darkText);
    doc.text('FONTES GRAPHICS', margin, y + 12);
  }

  // Right side - Partner logo (Criate)
  if (settings?.show_criate_logo) {
    try {
      const criateDataUrl = await loadLogoAsDark(logoCriateUrl);
      doc.addImage(criateDataUrl, 'PNG', pageWidth - margin - 35, y, 32, 14);
    } catch (e) {
      console.error('Error loading Criate logo:', e);
    }
  }

  y = 40;

  // Title bar
  doc.setFillColor(...accentGreen);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 14, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...white);
  doc.text('PROPOSTA COMERCIAL', pageWidth / 2, y + 10, { align: 'center' });
  
  y += 20;

  // Company subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...midGray);
  doc.text('FONTES GRAPHICS – Studio Criativo de Design', pageWidth / 2, y, { align: 'center' });
  
  y += 10;

  // Proposal info and client info side by side
  const colWidth = (pageWidth - 2 * margin - 10) / 2;
  
  // Proposal info box
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, colWidth, 30, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...accentGreen);
  doc.text('PROPOSTA Nº', margin + 6, y + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkText);
  doc.text(proposal.proposal_number, margin + 6, y + 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(`Data: ${formatDate(proposal.date)}`, margin + 6, y + 22);
  doc.text(`Validade: ${proposal.validity_days} dias`, margin + 6, y + 27);

  // Client info box
  const clientX = margin + colWidth + 10;
  doc.setFillColor(...accentGreen);
  doc.roundedRect(clientX, y, colWidth, 30, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text('CONTRATANTE', clientX + 6, y + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const clientName = proposal.client_name.length > 30 
    ? proposal.client_name.substring(0, 30) + '...' 
    : proposal.client_name;
  doc.text(clientName, clientX + 6, y + 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (proposal.client_company) {
    doc.text(proposal.client_company, clientX + 6, y + 22);
  }
  if (proposal.client_email) {
    doc.text(proposal.client_email, clientX + 6, y + 27);
  }

  y += 38;

  // Investment Section
  const investmentHeight = proposal.recurrence_type !== 'once' ? 32 : 26;
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, investmentHeight, 2, 2, 'F');
  doc.setDrawColor(...accentGreen);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, investmentHeight, 2, 2, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentGreen);
  doc.text('VALOR DA PROPOSTA', margin + 8, y + 9);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkText);
  const valueText = formatCurrency(proposal.investment_value) + getRecurrenceLabel(proposal.recurrence_type);
  doc.text(valueText, margin + 8, y + 20);
  
  if (proposal.recurrence_type !== 'once' && proposal.contract_period_months) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...midGray);
    doc.text(`Vigência: ${getContractPeriodLabel(proposal.contract_period_months)}`, margin + 8, y + 28);
  }
  
  // Payment conditions on the right
  if (proposal.payment_conditions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...accentGreen);
    doc.text('CONDIÇÕES', pageWidth - margin - 55, y + 9);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...darkText);
    const condLines = doc.splitTextToSize(proposal.payment_conditions, 50);
    doc.text(condLines.slice(0, 3), pageWidth - margin - 55, y + 16);
  }

  y += investmentHeight + 8;

  // Project Title Section
  doc.setFillColor(...accentGreen);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text('OBJETIVO', margin + 6, y + 7);
  
  y += 14;

  // Project Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkText);
  const titleLines = doc.splitTextToSize(proposal.project_title, pageWidth - 2 * margin);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5 + 4;

  // Project Description
  if (proposal.project_description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...midGray);
    
    const descLines = doc.splitTextToSize(proposal.project_description, pageWidth - 2 * margin);
    
    // Check page break
    if (y + descLines.length * 4 > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(descLines, margin, y);
    y += descLines.length * 4 + 8;
  }

  // Scope Section
  if (proposal.scope_items.length > 0) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(...accentGreen);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    doc.text('ESCOPO DOS SERVIÇOS', margin + 6, y + 7);
    
    y += 14;

    proposal.scope_items.forEach((item, index) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      const descLines = item.description ? doc.splitTextToSize(item.description, pageWidth - 2 * margin - 18) : [];
      const itemHeight = 14 + (descLines.length * 4);
      
      doc.setFillColor(...lightGray);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, itemHeight, 2, 2, 'F');

      // Item number
      doc.setFillColor(...accentGreen);
      doc.circle(margin + 8, y + 7, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...white);
      doc.text(String(index + 1), margin + 8, y + 9, { align: 'center' });

      // Item title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkText);
      doc.text(item.title, margin + 16, y + 9);

      // Item description
      if (item.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...midGray);
        doc.text(descLines, margin + 16, y + 16);
      }

      y += itemHeight + 3;
    });
  }

  y += 6;

  // Notes section
  if (proposal.notes) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(...accentGreen);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...white);
    doc.text('CONSIDERAÇÕES FINAIS', margin + 6, y + 7);
    
    y += 14;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...midGray);
    const noteLines = doc.splitTextToSize(proposal.notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 6;
  }

  // Signature section - directly after content, not fixed at bottom
  y += 10;
  
  if (y > pageHeight - 50) {
    doc.addPage();
    y = margin;
  }
  
  doc.setDrawColor(...accentGreen);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(formatDateTime(), margin, y);
  
  y += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  doc.text('Responsável pela Proposta', margin, y);
  
  y += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...accentGreen);
  doc.text('FONTES GRAPHICS – Studio Criativo de Design', margin, y);
  
  y += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(`CNPJ: ${CNPJ}`, margin, y);

  // Footer logos on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 12;
    
    // Footer accent line
    doc.setFillColor(...accentGreen);
    doc.rect(0, footerY - 4, pageWidth, 2, 'F');
    
    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...midGray);
    
    if (settings?.show_criate_logo) {
      doc.text('Proposta elaborada em parceria', pageWidth / 2, footerY + 2, { align: 'center' });
    }
    
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY + 2, { align: 'right' });
  }

  return doc;
}

export async function downloadProposalPDF(proposal: Proposal, settings: ProposalSettings | null) {
  const doc = await generateProposalPDF(proposal, settings);
  doc.save(`proposta-${proposal.proposal_number}.pdf`);
}
