// types/cofidec.ts
export interface CofidecEmf {
  id: number
  nom: string
  sigle: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface CofidecContrat {
  id: number
  numero_police: string
  nom_prenom: string
  date_naissance: string
  lieu_naissance: string
  profession: string
  adresse: string
  telephone: string
  email?: string
  date_effet: string
  date_echeance: string
  duree_mois: number
  montant_pret_assure: number
  taux_assurance: number
  prime_mensuelle: number
  prime_totale: number
  garantie_deces: boolean
  garantie_ipt: boolean
  garantie_itt: boolean
  garantie_perte_emploi: boolean
  statut: string
  observations?: string
  emf_id: number
  emf: CofidecEmf
  created_at: string
  updated_at: string
}

export interface CofidecDashboardStats {
  total: number
  actifs: number
  en_attente: number
  suspendu: number
  resilie: number
  termine: number
  montant_total_assure: number
  cotisation_totale: number
  avec_perte_emploi: number
  expire_30_jours: number
  par_categorie: {
    commercants: number
    salaries_public: number
    salaries_prive: number
    retraites: number
    autre: number
  }
}
