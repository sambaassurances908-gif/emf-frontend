// src/hooks/services.ts
import axios from '@/lib/axios'
import { BambooContrat } from '@/types/bamboo'

/**
 * Services API pour les contrats BAMBOO EMF
 * Endpoints Laravel:
 *  - GET    /bamboo-emf/contrats
 *  - POST   /bamboo-emf/contrats
 *  - GET    /bamboo-emf/contrats/{id}
 *  - PUT    /bamboo-emf/contrats/{id}
 *  - DELETE /bamboo-emf/contrats/{id}
 *  - GET    /bamboo-emf/contrats/statistiques/global
 *  - GET    /bamboo-emf/contrats/expiration/prochains
 *  - POST   /bamboo-emf/contrats/simulation/tarification
 *  - POST   /bamboo-emf/contrats/{id}/signatures
 *  - GET    /bamboo-emf/statistiques
 */

export type BambooContractsListResponse = {
  data: BambooContrat[]
  meta?: any
}

export type BambooStatsResponse = {
  total: number
  actifs: number
  en_attente: number
  resilie: number
  montant_total_assure: number
  cotisation_totale: number
  avec_perte_emploi: number
  expire_30_jours: number
  par_categorie?: {
    commercants?: number
    salaries_public?: number
    salaries_prive?: number
    retraites?: number
    autre?: number
  }
}

export type BambooExpiringResponse = {
  data: BambooContrat[]
}

export type BambooTarificationSimulationRequest = {
  montant_pret: number
  duree_mois: number
  categorie: string
  perte_emploi?: boolean
}

export type BambooTarificationSimulationResponse = {
  prime_totale: number
  taux: number
  details: any
}

// Liste des contrats BAMBOO (avec emf_id en paramètre)
export const fetchBambooContracts = async (
  emfId: number,
): Promise<BambooContractsListResponse> => {
  const { data } = await axios.get<BambooContractsListResponse>(
    '/bamboo-emf/contrats',
    {
      params: { emf_id: emfId },
    },
  )
  return data
}

// Détail d'un contrat BAMBOO
export const fetchBambooContrat = async (
  id: number,
): Promise<BambooContrat> => {
  const { data } = await axios.get<BambooContrat>(`/bamboo-emf/contrats/${id}`)
  return data
}

// Création d'un contrat BAMBOO
export const createBambooContrat = async (
  payload: Partial<BambooContrat>,
): Promise<BambooContrat> => {
  const { data } = await axios.post<BambooContrat>('/bamboo-emf/contrats', payload)
  return data
}

// Mise à jour d'un contrat BAMBOO
export const updateBambooContrat = async (
  id: number,
  payload: Partial<BambooContrat>,
): Promise<BambooContrat> => {
  const { data } = await axios.put<BambooContrat>(
    `/bamboo-emf/contrats/${id}`,
    payload,
  )
  return data
}

// Suppression d'un contrat BAMBOO
export const deleteBambooContrat = async (id: number): Promise<void> => {
  await axios.delete(`/bamboo-emf/contrats/${id}`)
}

// Statistiques globales (route /bamboo-emf/contrats/statistiques/global)
export const fetchBambooGlobalStats = async (
  emfId: number,
): Promise<BambooStatsResponse> => {
  const { data } = await axios.get<BambooStatsResponse>(
    '/bamboo-emf/contrats/statistiques/global',
    {
      params: { emf_id: emfId },
    },
  )
  return data
}

// Statistiques Dashboard (route /bamboo-emf/statistiques)
export const fetchBambooDashboardStats = async (
  emfId: number,
): Promise<BambooStatsResponse> => {
  const { data } = await axios.get<BambooStatsResponse>(
    '/bamboo-emf/statistiques',
    {
      params: { emf_id: emfId },
    },
  )
  return data
}

// Contrats expirant prochainement
export const fetchBambooExpiringContracts = async (
  emfId: number,
): Promise<BambooExpiringResponse> => {
  const { data } = await axios.get<BambooExpiringResponse>(
    '/bamboo-emf/contrats/expiration/prochains',
    {
      params: { emf_id: emfId },
    },
  )
  return data
}

// Simulation de tarification
export const simulateBambooTarification = async (
  payload: BambooTarificationSimulationRequest,
): Promise<BambooTarificationSimulationResponse> => {
  const { data } = await axios.post<BambooTarificationSimulationResponse>(
    '/bamboo-emf/contrats/simulation/tarification',
    payload,
  )
  return data
}

// Validation des signatures d'un contrat
export const validateBambooSignatures = async (
  id: number,
  payload: { assure_signature?: boolean; emf_signature?: boolean },
): Promise<BambooContrat> => {
  const { data } = await axios.post<BambooContrat>(
    `/bamboo-emf/contrats/${id}/signatures`,
    payload,
  )
  return data
}
