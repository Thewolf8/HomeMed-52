import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Medicine, AppSettings } from '@/types';
import { getExpirationStatus, formatDate, calculateEmergencyReadiness, getCategoryLabel, getFormTypeLabel } from './helpers';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => void;
  }
}

const AI_PROMPT = `Analyze this medicine inventory and determine:
- Which prescribed medicines are already available
- Possible alternatives based on active ingredients
- Medicines nearing expiration
- Potential duplicates
- Missing emergency essentials
- Possible medicine interactions

This report is not medical advice.`;

export function generatePDF(medicines: Medicine[], _settings: AppSettings): jsPDF {
  const doc = new jsPDF();
  const exportDate = format(new Date(), 'MMMM d, yyyy');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover Page
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Title
  doc.setTextColor(94, 234, 212);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('HomeMed Cabinet', pageWidth / 2, 80, { align: 'center' });

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Medicine Inventory Report', pageWidth / 2, 100, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(12);
  doc.text(`Generated on ${exportDate}`, pageWidth / 2, 120, { align: 'center' });
  doc.text(`${medicines.length} medicines in inventory`, pageWidth / 2, 130, { align: 'center' });

  // Disclaimer
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(10);
  doc.text('This report is not medical advice. For medical concerns, consult a healthcare professional.', pageWidth / 2, 160, { align: 'center' });

  // Medicines Table Page
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Medicine Inventory', 14, 20);

  const tableData = medicines.map((m) => {
    const status = getExpirationStatus(m.expirationDate);
    return [
      m.name,
      m.dosage,
      getFormTypeLabel(m.formType),
      String(m.quantity),
      formatDate(m.expirationDate),
      getCategoryLabel(m.category),
      status === 'expired' ? 'Expired' : status === 'expiring' ? 'Expiring' : 'Good',
    ];
  });

  (doc as any).autoTable({
    startY: 30,
    head: [['Name', 'Dosage', 'Form', 'Qty', 'Expires', 'Category', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 30 },
  });

  // Expiring Soon Section
  const expiringSoon = medicines.filter((m) => {
    const status = getExpirationStatus(m.expirationDate);
    return status === 'expiring' || status === 'expired';
  });

  if (expiringSoon.length > 0) {
    doc.addPage();
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Expiring Medicines', 14, 20);

    const expiringData = expiringSoon.map((m) => {
      const status = getExpirationStatus(m.expirationDate);
      return [
        m.name,
        m.dosage,
        formatDate(m.expirationDate),
        status === 'expired' ? 'Expired' : 'Expiring Soon',
        m.quantity <= 5 ? 'Low Stock' : 'OK',
      ];
    });

    (doc as any).autoTable({
      startY: 30,
      head: [['Name', 'Dosage', 'Expires', 'Status', 'Stock']],
      body: expiringData,
      theme: 'striped',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [254, 252, 232] },
    });
  }

  // Emergency Readiness Section
  const readiness = calculateEmergencyReadiness(medicines);
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Emergency Readiness', 14, 20);

  doc.setFontSize(12);
  doc.text(`Readiness Score: ${readiness.score}% (${readiness.status})`, 14, 35);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Available Items:', 14, 50);
  doc.setFont('helvetica', 'normal');
  readiness.found.forEach((item, i) => {
    doc.text(`  ${item}`, 14, 58 + i * 7);
  });

  const missingStartY = 58 + readiness.found.length * 7 + 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Missing Items:', 14, missingStartY);
  doc.setFont('helvetica', 'normal');
  readiness.missing.forEach((item, i) => {
    doc.setTextColor(239, 68, 68);
    doc.text(`  ${item}`, 14, missingStartY + 8 + i * 7);
  });

  // AI Analysis Prompt Page
  doc.addPage();
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  doc.setTextColor(94, 234, 212);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Analysis Prompt', pageWidth / 2, 40, { align: 'center' });

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const splitPrompt = doc.splitTextToSize(AI_PROMPT, pageWidth - 40);
  doc.text(splitPrompt, pageWidth / 2, 65, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.text('Copy this prompt along with your inventory data to any AI assistant for analysis.', pageWidth / 2, 130, { align: 'center' });

  // Footer on all pages
  const totalPages = doc.internal.pages.length;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('HomeMed Cabinet — This report is not medical advice.', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  return doc;
}

export function generateTXT(medicines: Medicine[], settings: AppSettings): string {
  const exportDate = format(new Date(), 'MMMM d, yyyy');
  const readiness = calculateEmergencyReadiness(medicines);

  let txt = `============================================================\n`;
  txt += `           HOMEMED CABINET — INVENTORY REPORT\n`;
  txt += `============================================================\n`;
  txt += `Export Date: ${exportDate}\n`;
  txt += `Total Medicines: ${medicines.length}\n`;
  txt += `------------------------------------------------------------\n\n`;

  txt += `MEDICINE INVENTORY\n`;
  txt += `------------------------------------------------------------\n`;
  if (medicines.length === 0) {
    txt += `No medicines in inventory.\n`;
  } else {
    medicines.forEach((m, i) => {
      const status = getExpirationStatus(m.expirationDate);
      txt += `[${i + 1}] ${m.name}\n`;
      txt += `    Dosage: ${m.dosage}\n`;
      txt += `    Active Ingredient: ${m.activeIngredient || 'N/A'}\n`;
      txt += `    Form: ${getFormTypeLabel(m.formType)}\n`;
      txt += `    Quantity: ${m.quantity}\n`;
      txt += `    Expires: ${formatDate(m.expirationDate)} (${status})\n`;
      txt += `    Category: ${getCategoryLabel(m.category)}\n`;
      txt += `    Prescription: ${m.prescriptionRequired ? 'Required' : 'Not Required'}\n`;
      if (settings.includeNotes && m.notes) {
        txt += `    Notes: ${m.notes}\n`;
      }
      txt += `    Usage: ${m.usageInstructions || 'N/A'}\n`;
      txt += `\n`;
    });
  }

  txt += `\n============================================================\n`;
  txt += `EXPIRING MEDICINES\n`;
  txt += `------------------------------------------------------------\n`;
  const expiringSoon = medicines.filter((m) => {
    const status = getExpirationStatus(m.expirationDate);
    return status === 'expiring' || status === 'expired';
  });
  if (expiringSoon.length === 0) {
    txt += `No medicines expiring soon.\n`;
  } else {
    expiringSoon.forEach((m) => {
      const status = getExpirationStatus(m.expirationDate);
      txt += `  • ${m.name} — ${formatDate(m.expirationDate)} [${status === 'expired' ? 'EXPIRED' : 'EXPIRING SOON'}]\n`;
    });
  }

  txt += `\n============================================================\n`;
  txt += `EMERGENCY READINESS\n`;
  txt += `------------------------------------------------------------\n`;
  txt += `Score: ${readiness.score}% (${readiness.status})\n`;
  txt += `Available: ${readiness.found.join(', ') || 'None'}\n`;
  txt += `Missing: ${readiness.missing.join(', ') || 'None'}\n`;

  txt += `\n============================================================\n`;
  txt += `AI ANALYSIS PROMPT\n`;
  txt += `------------------------------------------------------------\n`;
  txt += `${AI_PROMPT}\n`;

  txt += `\n============================================================\n`;
  txt += `Disclaimer: This report is not medical advice.\n`;
  txt += `Consult a healthcare professional for medical concerns.\n`;
  txt += `============================================================\n`;

  return txt;
}

export function generateJSON(medicines: Medicine[], settings: AppSettings): string {
  const readiness = calculateEmergencyReadiness(medicines);
  const exportDate = format(new Date(), 'MMMM d, yyyy');

  const data = {
    metadata: {
      app: 'HomeMed Cabinet',
      version: '1.0.0',
      exportDate,
      exportFormat: 'JSON',
      totalMedicines: medicines.length,
    },
    medicines: medicines.map((m) => ({
      id: m.id,
      name: m.name,
      activeIngredient: m.activeIngredient,
      dosage: m.dosage,
      formType: m.formType,
      formTypeLabel: getFormTypeLabel(m.formType),
      quantity: m.quantity,
      expirationDate: m.expirationDate,
      expirationStatus: getExpirationStatus(m.expirationDate),
      usageInstructions: m.usageInstructions,
      category: m.category,
      categoryLabel: getCategoryLabel(m.category),
      prescriptionRequired: m.prescriptionRequired,
      notes: settings.includeNotes ? m.notes : undefined,
      image: settings.includeImages ? m.image : undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
    emergencyReadiness: {
      score: readiness.score,
      status: readiness.status,
      found: readiness.found,
      missing: readiness.missing,
    },
    analysisPrompt: AI_PROMPT,
    disclaimer: 'This report is not medical advice. Consult a healthcare professional for medical concerns.',
  };

  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
