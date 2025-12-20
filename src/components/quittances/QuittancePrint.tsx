// src/components/quittances/QuittancePrint.tsx
import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'
import signatureTechnique from '@/assets/signature-technique.png'
import signatureFpdg from '@/assets/signature-fpdg.png'
import type { Sinistre } from '@/types/sinistre.types'

// --- Footer Component ---
const Footer: React.FC = () => {
  return (
    <div className="mt-auto pt-1 text-center text-[7px] text-gray-600 space-y-0 leading-tight">
      <div className="font-bold uppercase text-black text-[8px]">SAMB'A ASSURANCES GABON S.A.</div>
      <div>Société Anonyme avec Conseil d'Administration et Président Directeur Général.</div>
      <div>
        Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024,
      </div>
      <div>
        et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés.
      </div>
      <div className="mb-1">
        R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
      </div>
      
      <div className="flex justify-between items-start border-t border-gray-300 pt-0.5 px-2">
        <div className="flex flex-col items-center w-1/3">
          <MapPin size={10} className="mb-0 text-gray-500" />
          <span>326 Rue Jean-Baptiste NDENDE</span>
          <span>Avenue de COINTET | Centre-Ville | Libreville</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
          <Mail size={10} className="mb-0 text-gray-500" />
          <span>B.P : 22 215 | Libreville | Gabon</span>
          <span>Email : infos@samba-assurances.com</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
          <Phone size={10} className="mb-0 text-gray-500" />
          <span>(+241) 060 08 62 62 - 074 40 41 41</span>
          <span>074 40 51 51</span>
        </div>
      </div>
    </div>
  )
}

// --- Interfaces ---
export interface QuittanceData {
  id?: number
  reference: string
  type: 'emf' | 'prevoyance' // emf = remboursement prêt, prevoyance = capital forfaitaire
  sinistre: Sinistre
  
  // Informations quittance
  montant: number
  montantEnLettres: string
  beneficiaire: string
  
  // Pour prévoyance
  optionPrevoyance?: 'A' | 'B'
  garantieDescription?: string
  
  // Statut et signatures
  statut: 'brouillon' | 'en_attente_comptable' | 'validee_comptable' | 'en_attente_fpdg' | 'validee_fpdg' | 'rejetee'
  signatureComptable?: boolean
  signatureFpdg?: boolean
  dateValidationComptable?: string
  dateValidationFpdg?: string
  motifRejet?: string
  
  // Dates
  dateCreation: string
  datePaiement?: string
}

interface QuittancePrintProps {
  quittance: QuittanceData
  showSignatures?: boolean
}

export const QuittancePrint: React.FC<QuittancePrintProps> = ({ 
  quittance,
  showSignatures = true 
}) => {
  const { sinistre, type } = quittance
  const contrat = sinistre.contrat
  
  // Formatage des dates
  const dureeContrat = contrat?.date_effet && contrat?.date_fin_echeance
    ? `Du ${formatDate(contrat.date_effet)} au ${formatDate(contrat.date_fin_echeance)}`
    : 'N/A'
  
  // Déterminer le type de contrat
  const typeContratLabel = (() => {
    switch (sinistre.contrat_type) {
      case 'ContratSodec': return 'PREVOYANCE CREDITS SODEC'
      case 'ContratBambooEmf': return 'PREVOYANCE CREDITS BAMBOO'
      case 'ContratCofidec': return 'PREVOYANCE CREDITS COFIDEC'
      case 'ContratBceg': return 'PREVOYANCE CREDITS BCEG'
      case 'ContratEdg': return 'PREVOYANCE CREDITS EDG'
      default: return 'PREVOYANCE CREDITS'
    }
  })()
  
  // Description de la garantie
  const garantieBase = "Décès de l'assuré principal ou d'un assuré associé, l'assureur verse dans les 10 jours sous réserves d'un acte de décès, le capital forfaitaire prévus aux conditions particulières au(x) bénéficiaire(s) désigné(s) par l'assuré principal."
  
  const garantieOptionLabel = quittance.optionPrevoyance === 'A' 
    ? "Option A (Protection Prévoyance Décès/IAD)"
    : quittance.optionPrevoyance === 'B'
      ? "Option B (Protection Prévoyance Décès/IAD)"
      : "N/A"
  
  // Suivi par - utiliser le nom du traiteur ou un nom par défaut
  const suiviPar = sinistre.traitePar?.name || "SAMBA Assurances"
  
  // Date du jour formatée
  const dateJour = quittance.datePaiement 
    ? formatDate(quittance.datePaiement)
    : formatDate(new Date().toISOString())

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[8mm] shadow-xl relative flex flex-col text-black font-serif mx-auto print:shadow-none">
      
      {/* Header - Fixé en haut */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <img src={logoSamba} alt="SAMB'A Assurances" className="h-[120px] w-auto" />
        </div>
        <div className="border-2 border-black px-5 py-3 mt-4">
          <h1 className="text-lg font-bold font-serif tracking-wide">
            QUITTANCE DE REGLEMENT {quittance.reference}
          </h1>
        </div>
      </div>

      {/* Contenu principal centré verticalement */}
      <div className="flex-grow flex flex-col justify-center">
        {/* Details List - Aligné à gauche */}
        <div className="space-y-2 text-[12px] leading-relaxed mb-8 pl-4">
        <div className="flex">
          <span className="font-bold w-48">Police N°</span>
          <span>: {sinistre.numero_police || contrat?.numero_police || 'N/A'}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Sinistre N°</span>
          <span>: {sinistre.numero_sinistre}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Date du Sinistre</span>
          <span>: {formatDate(sinistre.date_sinistre)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Date de déclaration</span>
          <span>: {formatDate(sinistre.date_declaration)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Durée du contrat</span>
          <span>: {dureeContrat}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Assuré Principal</span>
          <span>: {sinistre.nom_assure || contrat?.nom_prenom || contrat?.nom_prenom_assure_principal || 'N/A'}</span>
        </div>
        {type === 'prevoyance' && (
          <div className="flex">
            <span className="font-bold w-48">Assuré associé</span>
            <span>: {quittance.beneficiaire || 'N/A'}</span>
          </div>
        )}
        <div className="flex">
          <span className="font-bold w-48">Suivi par</span>
          <span>: {suiviPar}</span>
        </div>
      </div>

        {/* Content Body - Aligné à gauche */}
        <div className="space-y-4 text-[13px] mb-8 pl-4">
        <div className="flex items-start">
          <span className="mr-2 font-bold">-</span>
          <div>
            <span className="font-bold">Contrat souscrit :</span> {typeContratLabel}
          </div>
        </div>

        {type === 'prevoyance' ? (
          <>
            <div className="flex items-start text-justify">
              <span className="mr-2 font-bold">-</span>
              <div>
                <span className="font-bold">Garantie de base :</span> {quittance.garantieDescription || garantieBase}
              </div>
            </div>

            <div className="flex items-start">
              <span className="mr-2 font-bold">-</span>
              <div>
                <span className="font-bold">Garantie optionnelle choisie par l'assuré :</span> {garantieOptionLabel}
              </div>
            </div>

            <div className="flex items-start flex-col pl-3">
              <div className="flex items-start -ml-3">
                <span className="mr-2 font-bold">-</span>
                <div>
                  <span className="font-bold">Capital forfaitaire :</span> &nbsp;&nbsp;&nbsp;&nbsp; {formatCurrency(quittance.montant)} (à reverser à {quittance.beneficiaire})
                </div>
              </div>
              <div className="font-bold italic mt-1 self-center text-sm">
                ({quittance.montantEnLettres})
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start text-justify">
              <span className="mr-2 font-bold">-</span>
              <div>
                <span className="font-bold">Garantie :</span> Décès / Invalidité Absolue et Définitive (IAD) - Remboursement du capital restant dû à l'EMF
              </div>
            </div>

            <div className="flex items-start flex-col pl-3">
              <div className="flex items-start -ml-3">
                <span className="mr-2 font-bold">-</span>
                <div>
                  <span className="font-bold">Capital restant dû (sans intérêts) :</span> &nbsp;&nbsp;&nbsp;&nbsp; {formatCurrency(quittance.montant)} (à reverser à {quittance.beneficiaire})
                </div>
              </div>
              <div className="font-bold italic mt-1 self-center text-sm">
                ({quittance.montantEnLettres})
              </div>
            </div>
          </>
        )}
      </div>

        {/* Total Amount Box - Centré */}
        <div className="flex justify-center my-8">
          <div className="border-2 border-black px-10 py-4 shadow-sm bg-gray-50">
            <span className="font-bold text-lg">Montant total à payer est : {formatCurrency(quittance.montant)}</span>
          </div>
        </div>
      </div>

      {/* Date & Signatures - Fixé en bas */}
      <div className="mt-auto mb-2">
        <div className="text-right mb-4 pr-8 text-[12px]">
          Fait à Libreville, le {dateJour}
        </div>

        <div className="flex justify-between px-4">
          {/* Left Signature - Responsable Technique */}
          <div className="w-[30%]">
            <div className="font-bold mb-2 text-[11px]">Le Responsable Technique</div>
            <div className="relative h-16 w-28">
              {/* La signature technique est toujours visible car la quittance est générée */}
              <img 
                src={signatureTechnique} 
                alt="Signature Responsable Technique" 
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* Feuillets */}
          <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[8px] space-y-0">
            <div className="flex gap-3">
              <span>Feuillet 1 : Assuré</span>
              <span>Feuillet 2 : EMF</span>
            </div>
            <div className="flex gap-3">
              <span>Feuillet 3 : SAMB'A</span>
              <span>Feuillet 4 : Souche</span>
            </div>
          </div>

          {/* Right Signature & Stamp - FPDG */}
          <div className="w-[30%]">
            <div className="font-bold mb-2 text-[11px] text-right">Le Président Directeur Général</div>
            <div className="relative h-20 w-32 ml-auto flex items-center justify-center">
              {showSignatures && (quittance.statut === 'validee_fpdg' || quittance.signatureFpdg) ? (
                <img 
                  src={signatureFpdg} 
                  alt="Signature PDG" 
                  className="h-full w-auto object-contain"
                />
              ) : (
                <div className="border border-gray-300 border-dashed h-full w-full flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-[9px] text-center px-1">
                    {quittance.statut === 'validee_comptable' || quittance.statut === 'en_attente_fpdg'
                      ? 'En attente FPDG' 
                      : quittance.statut === 'rejetee'
                        ? 'Rejetée'
                        : 'Signature & Cachet'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statut de la quittance (visible uniquement à l'écran) */}
      <div className="print:hidden mb-1">
        <div className={`text-center py-1.5 px-3 rounded-lg text-xs font-medium ${
          quittance.statut === 'validee_fpdg' ? 'bg-green-100 text-green-800' :
          quittance.statut === 'validee_comptable' || quittance.statut === 'en_attente_fpdg' ? 'bg-blue-100 text-blue-800' :
          quittance.statut === 'en_attente_comptable' ? 'bg-yellow-100 text-yellow-800' :
          quittance.statut === 'rejetee' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {quittance.statut === 'validee_fpdg' && '✓ Quittance validée - Prête pour impression'}
          {quittance.statut === 'validee_comptable' && '⏳ En attente de validation FPDG'}
          {quittance.statut === 'en_attente_fpdg' && '⏳ En attente de validation FPDG'}
          {quittance.statut === 'en_attente_comptable' && '⏳ En attente de validation Comptable'}
          {quittance.statut === 'brouillon' && '📝 Brouillon - En attente de soumission'}
          {quittance.statut === 'rejetee' && `❌ Rejetée${quittance.motifRejet ? ` : ${quittance.motifRejet}` : ''}`}
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}

export default QuittancePrint
