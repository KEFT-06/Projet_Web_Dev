import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { formatPrice } from './utils';
import type { Complaint } from './mockData';

interface ExportOptions {
  language: 'fr' | 'en' | 'es';
  includeHistory?: boolean;
  includeComments?: boolean;
}

// Service d'export PDF et Excel
export class ExportService {
  private static getTranslations(lang: 'fr' | 'en' | 'es') {
    const translations = {
      fr: {
        complaint: 'Réclamation',
        complaintsReport: 'Rapport des Réclamations',
        id: 'Identifiant',
        customer: 'Client',
        subject: 'Sujet',
        message: 'Message',
        status: 'Statut',
        date: 'Date',
        employeeResponse: 'Réponse Employé',
        managerResponse: 'Réponse Manager',
        adminResponse: 'Réponse Admin',
        pending: 'En attente',
        responded: 'Répondu',
        resolved: 'Résolu',
        validated: 'Validé',
        notValidated: 'Non validé',
        orderDetails: 'Détails de la Commande',
        total: 'Total',
        generatedOn: 'Généré le',
        page: 'Page',
        of: 'sur',
      },
      en: {
        complaint: 'Complaint',
        complaintsReport: 'Complaints Report',
        id: 'ID',
        customer: 'Customer',
        subject: 'Subject',
        message: 'Message',
        status: 'Status',
        date: 'Date',
        employeeResponse: 'Employee Response',
        managerResponse: 'Manager Response',
        adminResponse: 'Admin Response',
        pending: 'Pending',
        responded: 'Responded',
        resolved: 'Resolved',
        validated: 'Validated',
        notValidated: 'Not validated',
        orderDetails: 'Order Details',
        total: 'Total',
        generatedOn: 'Generated on',
        page: 'Page',
        of: 'of',
      },
      es: {
        complaint: 'Queja',
        complaintsReport: 'Informe de Quejas',
        id: 'ID',
        customer: 'Cliente',
        subject: 'Asunto',
        message: 'Mensaje',
        status: 'Estado',
        date: 'Fecha',
        employeeResponse: 'Respuesta del Empleado',
        managerResponse: 'Respuesta del Gerente',
        adminResponse: 'Respuesta del Admin',
        pending: 'Pendiente',
        responded: 'Respondido',
        resolved: 'Resuelto',
        validated: 'Validado',
        notValidated: 'No validado',
        orderDetails: 'Detalles del Pedido',
        total: 'Total',
        generatedOn: 'Generado el',
        page: 'Página',
        of: 'de',
      },
    };
    return translations[lang];
  }

  // Export PDF pour une réclamation unique
  static exportComplaintToPDF(complaint: Complaint, options: ExportOptions = { language: 'fr' }) {
    const t = this.getTranslations(options.language);
    const pdf = new jsPDF();
    
    // Configuration des couleurs (charte graphique)
    // const primaryColor = '#ea580c'; // Orange-600
    // const secondaryColor = '#000000';
    
    // En-tête avec gradient
    pdf.setFillColor(234, 88, 12); // Orange
    pdf.rect(0, 0, 210, 30, 'F');
    
    // Logo et titre
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text('ZEDUC-SP@CE', 105, 15, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(t.complaint, 105, 23, { align: 'center' });
    
    // Informations principales
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    
    let yPosition = 45;
    
    // ID et Date
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.id}:`, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(complaint.id, 50, yPosition);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.date}:`, 120, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date(complaint.timestamp).toLocaleDateString(options.language), 140, yPosition);
    
    yPosition += 10;
    
    // Client
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.customer}:`, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(complaint.customerName, 50, yPosition);
    
    yPosition += 10;
    
    // Statut
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.status}:`, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    const statusText = complaint.status === 'pending' ? t.pending :
                      complaint.status === 'responded' ? t.responded : t.resolved;
    pdf.text(statusText, 50, yPosition);
    
    yPosition += 15;
    
    // Sujet
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.subject}:`, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    const subjectLines = pdf.splitTextToSize(complaint.subject, 150);
    pdf.text(subjectLines, 20, yPosition + 7);
    yPosition += 7 * subjectLines.length + 5;
    
    // Message
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.message}:`, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    const messageLines = pdf.splitTextToSize(complaint.message, 170);
    pdf.text(messageLines, 20, yPosition + 7);
    yPosition += 7 * messageLines.length + 10;
    
    // Réponses
    if (complaint.employeeResponse && options.includeHistory) {
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPosition - 5, 180, 30, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t.employeeResponse}:`, 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      const responseLines = pdf.splitTextToSize(complaint.employeeResponse, 170);
      pdf.text(responseLines, 20, yPosition + 7);
      yPosition += 7 * responseLines.length + 10;
    }
    
    if (complaint.managerResponse && options.includeHistory) {
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPosition - 5, 180, 30, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t.managerResponse}:`, 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      const responseLines = pdf.splitTextToSize(complaint.managerResponse, 170);
      pdf.text(responseLines, 20, yPosition + 7);
      yPosition += 7 * responseLines.length + 10;
    }
    
    if (complaint.adminResponse && options.includeHistory) {
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPosition - 5, 180, 30, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t.adminResponse}:`, 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      const responseLines = pdf.splitTextToSize(complaint.adminResponse, 170);
      pdf.text(responseLines, 20, yPosition + 7);
      yPosition += 7 * responseLines.length + 10;
    }
    
    // Pied de page
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`${t.generatedOn} ${new Date().toLocaleString(options.language)}`, 105, 285, { align: 'center' });
    pdf.text(`${t.page} 1 ${t.of} 1`, 195, 285, { align: 'right' });
    
    // Sauvegarder le PDF
    pdf.save(`reclamation_${complaint.id}_${Date.now()}.pdf`);
  }

  // Export PDF pour plusieurs réclamations
  static exportComplaintsToPDF(complaints: Complaint[], options: ExportOptions = { language: 'fr' }) {
    const t = this.getTranslations(options.language);
    const pdf = new jsPDF();
    
    // En-tête
    pdf.setFillColor(234, 88, 12);
    pdf.rect(0, 0, 210, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text('ZEDUC-SP@CE', 105, 15, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(t.complaintsReport, 105, 23, { align: 'center' });
    
    // Tableau des réclamations
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    
    let yPosition = 45;
    
    // En-têtes du tableau
    pdf.setFont('helvetica', 'bold');
    pdf.text(t.id, 20, yPosition);
    pdf.text(t.customer, 50, yPosition);
    pdf.text(t.subject, 100, yPosition);
    pdf.text(t.status, 160, yPosition);
    
    pdf.line(15, yPosition + 2, 195, yPosition + 2);
    
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    
    complaints.forEach((complaint) => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
        
        // En-têtes du tableau sur nouvelle page
        pdf.setFont('helvetica', 'bold');
        pdf.text(t.id, 20, yPosition);
        pdf.text(t.customer, 50, yPosition);
        pdf.text(t.subject, 100, yPosition);
        pdf.text(t.status, 160, yPosition);
        pdf.line(15, yPosition + 2, 195, yPosition + 2);
        yPosition += 8;
        pdf.setFont('helvetica', 'normal');
      }
      
      pdf.text(complaint.id.substring(0, 10), 20, yPosition);
      pdf.text(complaint.customerName.substring(0, 20), 50, yPosition);
      pdf.text(complaint.subject.substring(0, 30), 100, yPosition);
      
      const statusText = complaint.status === 'pending' ? t.pending :
                        complaint.status === 'responded' ? t.responded : t.resolved;
      pdf.text(statusText, 160, yPosition);
      
      yPosition += 7;
    });
    
    // Pied de page sur dernière page
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`${t.generatedOn} ${new Date().toLocaleString(options.language)}`, 105, 285, { align: 'center' });
    
    pdf.save(`rapport_reclamations_${Date.now()}.pdf`);
  }

  // Export Excel pour les réclamations
  static exportComplaintsToExcel(complaints: Complaint[], options: ExportOptions = { language: 'fr' }) {
    const t = this.getTranslations(options.language);
    
    // Préparer les données
    const data = complaints.map(complaint => ({
      [t.id]: complaint.id,
      [t.customer]: complaint.customerName,
      [t.subject]: complaint.subject,
      [t.message]: complaint.message,
      [t.status]: complaint.status === 'pending' ? t.pending :
                  complaint.status === 'responded' ? t.responded : t.resolved,
      [t.date]: new Date(complaint.timestamp).toLocaleString(options.language),
      [t.employeeResponse]: complaint.employeeResponse || '-',
      [t.managerResponse]: complaint.managerResponse || '-',
      [t.adminResponse]: complaint.adminResponse || '-',
      [t.validated]: complaint.responseValidated ? t.validated : t.notValidated,
    }));
    
    // Créer le classeur
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t.complaintsReport);
    
    // Ajuster la largeur des colonnes
    const maxWidth = 50;
    const colWidths: any = {};
    
    Object.keys(data[0] || {}).forEach(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key as keyof typeof row] || '').length)
      );
      colWidths[key] = Math.min(maxLength + 2, maxWidth);
    });
    
    ws['!cols'] = Object.keys(colWidths).map(key => ({ wch: colWidths[key] }));
    
    // Sauvegarder le fichier
    XLSX.writeFile(wb, `rapport_reclamations_${Date.now()}.xlsx`);
  }

  // Export statistiques pour admin
  static exportStatisticsToExcel(stats: any, options: ExportOptions = { language: 'fr' }) {
    // const t = this.getTranslations(options.language);
    
    // Créer plusieurs feuilles
    const wb = XLSX.utils.book_new();
    
    // Feuille 1: Vue d'ensemble
    const overviewData = [
      { Métrique: 'Chiffre d\'affaires', Valeur: formatPrice(stats.revenue) },
      { Métrique: 'Nombre de commandes', Valeur: stats.ordersCount },
      { Métrique: 'Panier moyen', Valeur: formatPrice(stats.averageBasket) },
      { Métrique: 'Taux de satisfaction', Valeur: `${stats.satisfactionRate}%` },
    ];
    
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Vue d\'ensemble');
    
    // Feuille 2: Top produits
    if (stats.topProducts) {
      const wsProducts = XLSX.utils.json_to_sheet(stats.topProducts);
      XLSX.utils.book_append_sheet(wb, wsProducts, 'Top Produits');
    }
    
    // Feuille 3: Top clients
    if (stats.topCustomers) {
      const wsCustomers = XLSX.utils.json_to_sheet(stats.topCustomers);
      XLSX.utils.book_append_sheet(wb, wsCustomers, 'Top Clients');
    }
    
    // Sauvegarder
    XLSX.writeFile(wb, `statistiques_${Date.now()}.xlsx`);
  }
}

// Export des fonctions pour utilisation directe
export const exportComplaintToPDF = ExportService.exportComplaintToPDF.bind(ExportService);
export const exportComplaintsToPDF = ExportService.exportComplaintsToPDF.bind(ExportService);
export const exportComplaintsToExcel = ExportService.exportComplaintsToExcel.bind(ExportService);
export const exportStatisticsToExcel = ExportService.exportStatisticsToExcel.bind(ExportService);
