import type { ConsolidatedResults } from '../../models';
import type { ClientIntakeData } from '../../models/clientIntake';
import type { TransitId, RisingSign } from '../../data/barbault2026';
import { generatePDFTemplate, generateFilename } from './pdfTemplate';
import { generateClientReportTemplate, generateClientReportFilename } from './clientReportTemplate';
import {
  generateBarbaultWorksheetTemplate,
  generateBarbaultWorksheetFilename,
} from './barbaultWorksheetTemplate';

/**
 * Export results to PDF file
 * Dynamically imports html2pdf to avoid bundling issues
 */
export async function exportToPDF(results: ConsolidatedResults): Promise<void> {
  try {
    // Dynamically import html2pdf to keep bundle size small
    const html2pdf = (await import('html2pdf.js')).default;

    // Generate HTML template and filename
    const htmlContent = generatePDFTemplate(results);
    const filename = generateFilename(results);

    // Create container element for HTML conversion
    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    // Configure html2pdf options
    const options = {
      margin: 10,
      filename,
      image: {
        type: 'jpeg' as const,
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true,
      },
      jsPDF: {
        orientation: 'portrait' as const,
        unit: 'mm' as const,
        format: 'a4' as const,
      },
    };

    // Generate and save PDF
    await html2pdf().set(options).from(element).save();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during PDF export';
    throw new Error(`Failed to export PDF: ${message}`);
  }
}

/**
 * Export client-facing 3-page report to PDF
 */
export async function exportClientReportToPDF(
  results: ConsolidatedResults,
  intake: ClientIntakeData,
): Promise<void> {
  try {
    const html2pdf = (await import('html2pdf.js')).default;

    const htmlContent = generateClientReportTemplate(results, intake);
    const filename = generateClientReportFilename(results);

    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const options = {
      margin: 10,
      filename,
      image: {
        type: 'jpeg' as const,
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true,
      },
      jsPDF: {
        orientation: 'portrait' as const,
        unit: 'mm' as const,
        format: 'a4' as const,
      },
    };

    await html2pdf().set(options).from(element).save();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during PDF export';
    throw new Error(`Failed to export client report PDF: ${message}`);
  }
}

/**
 * Export the Once-In-A-Century Wealth & Identity Upgrade worksheet to PDF,
 * including whatever the user has typed into the reflection/commitment fields.
 */
export async function exportBarbaultWorksheetToPDF(
  risingSign: RisingSign,
  answers: Record<TransitId, { q1: string; q2: string; commitment: string }>
): Promise<void> {
  try {
    const html2pdf = (await import('html2pdf.js')).default;

    const htmlContent = generateBarbaultWorksheetTemplate(risingSign, answers);
    const filename = generateBarbaultWorksheetFilename(risingSign);

    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const options = {
      margin: 10,
      filename,
      image: {
        type: 'jpeg' as const,
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true,
      },
      jsPDF: {
        orientation: 'portrait' as const,
        unit: 'mm' as const,
        format: 'a4' as const,
      },
    };

    // Playfair Display was just added to the font stylesheet — guard against a
    // fallback-serif flash if the user exports immediately after page load.
    if (document.fonts) {
      await document.fonts.ready;
    }

    await html2pdf().set(options).from(element).save();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during PDF export';
    throw new Error(`Failed to export worksheet PDF: ${message}`);
  }
}
