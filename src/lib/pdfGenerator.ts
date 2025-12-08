// src/lib/pdfGenerator.ts
import jsPDF from 'jspdf'
import { formatCurrency, formatDate } from './utils'

interface ContratPdfData {
  id: number
  nom_prenom?: string
  nom?: string
  prenom?: string
  telephone_assure?: string
  email_assure?: string
  adresse_assure?: string
  ville_assure?: string
  montant_pret_assure?: number | string
  montant_pret?: number | string
  duree_pret_mois?: number
  date_effet?: string
  date_fin_echeance?: string
  statut?: string
  option_prevoyance?: string
  garantie_perte_emploi?: boolean
  garantie_deces_iad?: boolean
  garantie_prevoyance?: boolean
  numero_police?: string
  numero_convention?: string
  agence?: string
  banque_sigle?: string
  banque_raison_sociale?: string
  cotisation_totale_ttc?: number | string
  cotisation_deces_iad?: number | string
  cotisation_prevoyance?: number | string
  taux_applique?: number | string
  assures_associes?: any[]
  [key: string]: any
}

interface PdfOptions {
  title: string
  emfName: string
  emfLogo?: string
  primaryColor: [number, number, number]
  secondaryColor: [number, number, number]
}

const defaultOptions: PdfOptions = {
  title: 'ATTESTATION D\'ASSURANCE',
  emfName: 'SAMBA ASSURANCE',
  primaryColor: [79, 70, 229], // Indigo
  secondaryColor: [147, 51, 234], // Purple
}

export const generateContratPdf = (contrat: ContratPdfData, options: Partial<PdfOptions> = {}) => {
  const opts = { ...defaultOptions, ...options }
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Helper functions
  // Helper function for adding text (kept for future use)
  const addText = (text: string, x: number, y: number, fontSize: number = 10, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
    doc.text(text, x, y)
    return y + (fontSize * 0.5)
  }

  // Helper function for adding lines (kept for future use)
  const addLine = (y: number, color: [number, number, number] = [200, 200, 200]) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    return y + 5
  }
  
  // Use helpers to avoid unused variable warnings
  void addText
  void addLine

  const addSection = (title: string, y: number): number => {
    doc.setFillColor(...opts.primaryColor)
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 5, y + 5.5)
    return y + 15
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addField = (label: string, value: string | number | undefined | null, x: number, y: number, _width: number = 80): number => {
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(label, x, y)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const displayValue = value !== null && value !== undefined ? String(value) : 'N/A'
    doc.text(displayValue, x, y + 5)
    
    return y + 12
  }

  // ==================== HEADER ====================
  // Background gradient effect (rectangle)
  doc.setFillColor(...opts.primaryColor)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(opts.emfName, margin, 20)
  
  // Document title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(opts.title, margin, 32)
  
  // Contract number (right side)
  const contractNum = contrat.numero_police || contrat.numero_convention || `N° ${contrat.id}`
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(contractNum, pageWidth - margin, 20, { align: 'right' })
  
  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Édité le ${formatDate(new Date().toISOString())}`, pageWidth - margin, 32, { align: 'right' })

  yPos = 55

  // ==================== ASSURÉ PRINCIPAL ====================
  yPos = addSection('ASSURÉ PRINCIPAL', yPos)
  
  const nomComplet = contrat.nom_prenom || `${contrat.prenom || ''} ${contrat.nom || ''}`.trim()
  
  // Row 1
  const col1 = margin
  const col2 = margin + 60
  const col3 = margin + 120
  
  yPos = addField('Nom complet', nomComplet, col1, yPos)
  addField('Téléphone', contrat.telephone_assure, col2, yPos - 12)
  addField('Email', contrat.email_assure, col3, yPos - 12)
  
  // Row 2
  const adresseComplete = [contrat.adresse_assure, contrat.ville_assure].filter(Boolean).join(', ')
  yPos = addField('Adresse', adresseComplete || 'N/A', col1, yPos)
  
  yPos += 5

  // ==================== DÉTAILS DU CONTRAT ====================
  yPos = addSection('DÉTAILS DU CONTRAT', yPos)
  
  // Row 1
  const montant = contrat.montant_pret_assure || contrat.montant_pret
  yPos = addField('Montant assuré', montant ? formatCurrency(Number(montant)) : 'N/A', col1, yPos)
  addField('Durée du prêt', contrat.duree_pret_mois ? `${contrat.duree_pret_mois} mois` : 'N/A', col2, yPos - 12)
  addField('Statut', contrat.statut?.toUpperCase() || 'ACTIF', col3, yPos - 12)
  
  // Row 2
  yPos = addField('Date d\'effet', formatDate(contrat.date_effet), col1, yPos)
  addField('Date fin', formatDate(contrat.date_fin_echeance), col2, yPos - 12)
  addField('Agence', contrat.agence || contrat.banque_sigle || 'N/A', col3, yPos - 12)
  
  yPos += 5

  // ==================== GARANTIES ====================
  yPos = addSection('GARANTIES SOUSCRITES', yPos)
  
  const garanties: string[] = []
  if (contrat.garantie_deces_iad) garanties.push('✓ Décès / IAD')
  if (contrat.garantie_prevoyance) garanties.push('✓ Prévoyance')
  if (contrat.garantie_perte_emploi) garanties.push('✓ Perte d\'emploi')
  if (contrat.option_prevoyance) garanties.push(`✓ Option: ${contrat.option_prevoyance.toUpperCase()}`)
  
  if (garanties.length === 0) {
    garanties.push('Garanties standard incluses')
  }
  
  doc.setTextColor(0, 100, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  garanties.forEach((g, i) => {
    doc.text(g, margin + 5 + (i % 2) * 80, yPos + Math.floor(i / 2) * 7)
  })
  
  yPos += Math.ceil(garanties.length / 2) * 7 + 10

  // ==================== COTISATIONS ====================
  if (contrat.cotisation_totale_ttc || contrat.cotisation_deces_iad) {
    yPos = addSection('COTISATIONS', yPos)
    
    if (contrat.cotisation_deces_iad) {
      yPos = addField('Cotisation Décès/IAD', formatCurrency(Number(contrat.cotisation_deces_iad)), col1, yPos)
    }
    if (contrat.cotisation_prevoyance) {
      addField('Cotisation Prévoyance', formatCurrency(Number(contrat.cotisation_prevoyance)), col2, yPos - 12)
    }
    if (contrat.taux_applique) {
      addField('Taux appliqué', `${contrat.taux_applique}%`, col3, yPos - 12)
    }
    
    if (contrat.cotisation_totale_ttc) {
      yPos += 5
      doc.setFillColor(240, 240, 255)
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 15, 2, 2, 'F')
      
      doc.setTextColor(...opts.primaryColor)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('COTISATION TOTALE TTC:', margin + 5, yPos + 10)
      doc.text(formatCurrency(Number(contrat.cotisation_totale_ttc)), pageWidth - margin - 5, yPos + 10, { align: 'right' })
      
      yPos += 25
    }
  }

  // ==================== ASSURÉS ASSOCIÉS ====================
  if (contrat.assures_associes && contrat.assures_associes.length > 0) {
    yPos = addSection(`ASSURÉS ASSOCIÉS (${contrat.assures_associes.length})`, yPos)
    
    // Table header
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F')
    
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Type', margin + 3, yPos + 5)
    doc.text('Nom complet', margin + 30, yPos + 5)
    doc.text('Date naissance', margin + 90, yPos + 5)
    doc.text('Contact', margin + 130, yPos + 5)
    
    yPos += 10
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    
    contrat.assures_associes.slice(0, 5).forEach((assure: any) => {
      doc.text(assure.type_assure?.toUpperCase() || 'N/A', margin + 3, yPos + 4)
      doc.text(`${assure.prenom || ''} ${assure.nom || ''}`.trim(), margin + 30, yPos + 4)
      doc.text(formatDate(assure.date_naissance), margin + 90, yPos + 4)
      doc.text(assure.contact || 'N/A', margin + 130, yPos + 4)
      
      doc.setDrawColor(230, 230, 230)
      doc.line(margin, yPos + 7, pageWidth - margin, yPos + 7)
      
      yPos += 10
    })
    
    if (contrat.assures_associes.length > 5) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(8)
      doc.text(`... et ${contrat.assures_associes.length - 5} autres assurés`, margin + 3, yPos + 4)
      yPos += 8
    }
    
    yPos += 5
  }

  // ==================== FOOTER ====================
  // Footer line
  doc.setDrawColor(...opts.primaryColor)
  doc.setLineWidth(1)
  doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30)
  
  // Footer text
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Ce document est généré électroniquement et ne nécessite pas de signature.', pageWidth / 2, pageHeight - 22, { align: 'center' })
  doc.text(`${opts.emfName} - Assurance Emprunteur`, pageWidth / 2, pageHeight - 17, { align: 'center' })
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, pageHeight - 12, { align: 'center' })

  // Page number
  doc.setTextColor(150, 150, 150)
  doc.text('Page 1/1', pageWidth - margin, pageHeight - 10, { align: 'right' })

  // Save the PDF
  const fileName = `contrat_${contrat.id}_${nomComplet.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
  
  return fileName
}

// Configurations spécifiques par EMF
export const generateSodecContratPdf = (contrat: ContratPdfData) => {
  return generateContratPdf(contrat, {
    title: 'ATTESTATION D\'ASSURANCE EMPRUNTEUR',
    emfName: 'SODEC ASSURANCE',
    primaryColor: [79, 70, 229], // Indigo
    secondaryColor: [147, 51, 234], // Purple
  })
}

export const generateBcegContratPdf = (contrat: ContratPdfData) => {
  return generateContratPdf(contrat, {
    title: 'ATTESTATION D\'ASSURANCE EMPRUNTEUR',
    emfName: 'BCEG ASSURANCE',
    primaryColor: [5, 150, 105], // Emerald
    secondaryColor: [20, 184, 166], // Teal
  })
}

export const generateBambooContratPdf = (contrat: ContratPdfData) => {
  return generateContratPdf(contrat, {
    title: 'ATTESTATION D\'ASSURANCE EMPRUNTEUR',
    emfName: 'BAMBOO FINANCE',
    primaryColor: [34, 197, 94], // Green
    secondaryColor: [22, 163, 74], // Green darker
  })
}

export const generateCofidecContratPdf = (contrat: ContratPdfData) => {
  return generateContratPdf(contrat, {
    title: 'ATTESTATION D\'ASSURANCE EMPRUNTEUR',
    emfName: 'COFIDEC',
    primaryColor: [239, 68, 68], // Red
    secondaryColor: [220, 38, 38], // Red darker
  })
}

export const generateEdgContratPdf = (contrat: ContratPdfData) => {
  return generateContratPdf(contrat, {
    title: 'ATTESTATION D\'ASSURANCE EMPRUNTEUR',
    emfName: 'EDG FINANCE',
    primaryColor: [249, 115, 22], // Orange
    secondaryColor: [234, 88, 12], // Orange darker
  })
}
