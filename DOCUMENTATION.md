# 📚 DOCUMENTATION COMPLÈTE - SAMB'A Assurances Frontend

## Table des Matières

1. [Présentation Générale](#1-présentation-générale)
2. [Stack Technologique](#2-stack-technologique)
3. [Architecture du Projet](#3-architecture-du-projet)
4. [Modules Fonctionnels](#4-modules-fonctionnels)
5. [Système d'Authentification](#5-système-dauthentification)
6. [Gestion des Contrats](#6-gestion-des-contrats)
7. [Gestion des Sinistres](#7-gestion-des-sinistres)
8. [Espace Comptable](#8-espace-comptable)
9. [Espace FPDG (Fondé de Pouvoir Délégué Général)](#9-espace-fpdg)
10. [Gestion des Exercices](#10-gestion-des-exercices)
11. [Partenaires EMF](#11-partenaires-emf)
12. [Types de Données](#12-types-de-données)
13. [Services API](#13-services-api)
14. [Composants UI](#14-composants-ui)
15. [Hooks Personnalisés](#15-hooks-personnalisés)
16. [Gestion de l'État](#16-gestion-de-létat)
17. [Routes de l'Application](#17-routes-de-lapplication)
18. [Fonctionnalités Avancées](#18-fonctionnalités-avancées)

---

## 1. Présentation Générale

### 1.1 Description

**SAMB'A Assurances** est une application web complète de gestion d'assurances destinée aux Établissements de Microfinance (EMF) au Cameroun. L'application permet la gestion intégrale du cycle de vie des contrats d'assurance emprunteur, de la souscription jusqu'à l'indemnisation des sinistres.

### 1.2 Objectifs Principaux

- **Gestion Multi-EMF** : Support de 9 partenaires EMF avec des workflows personnalisés
- **Gestion des Contrats** : Création, suivi, import CSV et impression des contrats
- **Gestion des Sinistres** : Déclaration, instruction, validation et paiement
- **Suivi Comptable** : Quittances, paiements et rapports financiers
- **Tableaux de Bord** : Statistiques en temps réel et visualisations graphiques
- **Gestion des Exercices** : Suivi annuel de la production et sinistralité

### 1.3 Utilisateurs Cibles

| Rôle | Description | Accès |
|------|-------------|-------|
| **Administrateur** | Super-utilisateur avec accès complet | Toutes les fonctionnalités |
| **FPDG** | Fondé de Pouvoir Délégué Général | Validation sinistres, clôture, paiements |
| **Gestionnaire** | Agent de gestion EMF | Contrats, sinistres de son EMF |
| **Comptable** | Service comptabilité | Quittances, paiements, rapports |
| **Utilisateur EMF** | Agent d'un EMF partenaire | Contrats et sinistres de son EMF uniquement |

---

## 2. Stack Technologique

### 2.1 Frontend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.9.3 | Typage statique |
| **Vite** | 7.2.4 | Build tool et dev server |
| **TailwindCSS** | 3.4.1 | Framework CSS utilitaire |
| **React Router** | 7.9.6 | Routage SPA |
| **TanStack Query** | 5.90.10 | Gestion des requêtes et cache |
| **TanStack Table** | 8.21.3 | Tableaux de données |
| **Zustand** | 5.0.8 | Gestion d'état globale |
| **React Hook Form** | 7.66.1 | Gestion des formulaires |
| **Zod** | 4.1.13 | Validation de schémas |
| **Axios** | 1.13.2 | Client HTTP |
| **Recharts** | 3.5.0 | Graphiques et visualisations |
| **Lucide React** | 0.554.0 | Icônes |
| **date-fns** | 4.1.0 | Manipulation des dates |
| **jsPDF** | 3.0.4 | Génération PDF |
| **html2canvas** | 1.4.1 | Capture d'écran |
| **react-to-print** | 3.2.0 | Impression |

### 2.2 Backend (API Laravel)

L'application communique avec une API REST Laravel (non incluse dans ce dépôt) qui gère :
- L'authentification JWT
- Les opérations CRUD sur les entités
- L'import de fichiers CSV
- La génération de rapports

---

## 3. Architecture du Projet

### 3.1 Structure des Dossiers

```
samba-assurance-frontend/
├── public/                     # Ressources statiques
│   └── templates/              # Templates CSV pour import
├── src/
│   ├── assets/                 # Images et ressources
│   ├── components/             # Composants réutilisables
│   │   ├── auth/               # Composants d'authentification
│   │   ├── comptable/          # Composants espace comptable
│   │   ├── contrats/           # Composants contrats
│   │   ├── layout/             # Layouts (AppLayout, Sidebar, Header)
│   │   ├── modals/             # Modales (Import, Création)
│   │   ├── quittances/         # Composants quittances
│   │   ├── routing/            # Composants de routage
│   │   ├── shared/             # Composants partagés
│   │   ├── sinistres/          # Composants sinistres
│   │   └── ui/                 # Composants UI de base
│   ├── features/               # Modules fonctionnels
│   │   ├── auth/               # Module authentification
│   │   ├── comptable/          # Module comptable
│   │   ├── contrats/           # Module contrats (par EMF)
│   │   ├── dashboard/          # Module tableau de bord
│   │   ├── emfs/               # Module gestion EMF
│   │   ├── exercices/          # Module exercices comptables
│   │   ├── fpdg/               # Module FPDG
│   │   ├── quittances/         # Module quittances
│   │   ├── settings/           # Module paramètres
│   │   ├── sinistres/          # Module sinistres (par EMF)
│   │   ├── statistiques/       # Module statistiques
│   │   └── users/              # Module utilisateurs
│   ├── hooks/                  # Hooks React personnalisés
│   ├── lib/                    # Utilitaires et configuration
│   ├── pages/                  # Pages générales
│   ├── services/               # Services API
│   ├── store/                  # Store Zustand
│   ├── types/                  # Types TypeScript
│   ├── App.tsx                 # Composant racine
│   ├── main.tsx                # Point d'entrée
│   └── router.tsx              # Configuration des routes
├── package.json                # Dépendances NPM
├── tailwind.config.js          # Configuration TailwindCSS
├── tsconfig.json               # Configuration TypeScript
└── vite.config.ts              # Configuration Vite
```

### 3.2 Patterns Architecturaux

#### Feature-Based Architecture
L'application est organisée par fonctionnalités (`features/`) plutôt que par type technique, facilitant la maintenance et la scalabilité.

#### Services Layer
Les appels API sont centralisés dans `services/` avec des services dédiés par domaine.

#### Custom Hooks
La logique métier réutilisable est encapsulée dans des hooks personnalisés (`hooks/`).

---

## 4. Modules Fonctionnels

### 4.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    SAMB'A Assurances                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │  Contrats   │  │     Sinistres       │  │
│  │   Global    │  │   Multi-EMF │  │  Déclaration/Paye   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Comptable  │  │    FPDG     │  │     Exercices       │  │
│  │  Quittances │  │  Validation │  │  Production/Stats   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    EMFs     │  │   Users     │  │    Paramètres       │  │
│  │  Partenaires│  │ Utilisateurs│  │   Configuration     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Système d'Authentification

### 5.1 Description

Le système d'authentification utilise JWT (JSON Web Tokens) avec stockage local et gestion automatique du rafraîchissement.

### 5.2 Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Connexion** | Email + mot de passe |
| **Déconnexion** | Invalidation du token |
| **Mot de passe oublié** | Réinitialisation par email |
| **Protection des routes** | Redirection automatique si non authentifié |
| **Rafraîchissement token** | Renouvellement automatique |

### 5.3 Store d'Authentification

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}
```

### 5.4 Types Utilisateur

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'fpdg' | 'gestionnaire' | 'comptable' | 'user';
  emf_id?: number;  // null = accès global, sinon limité à l'EMF
  emf?: {
    id: number;
    sigle: string;
    raison_sociale: string;
  };
}
```

### 5.5 Routes Publiques et Protégées

- **Route publique** : `/login`
- **Routes protégées** : Toutes les autres routes (Dashboard, Contrats, Sinistres, etc.)

---

## 6. Gestion des Contrats

### 6.1 Vue d'Ensemble

Le module de gestion des contrats est le cœur de l'application. Il permet la création, la visualisation, la modification et l'import de contrats d'assurance pour chaque EMF partenaire.

### 6.2 EMF Partenaires Supportés

| ID | Sigle | Nom Complet | Types de Contrats |
|----|-------|-------------|-------------------|
| 1 | **BAMBOO** | BAMBOO EMF | Contrat standard Décès/IAD |
| 2 | **COFIDEC** | COFIDEC | Contrat standard avec taux appliqué |
| 3 | **BCEG** | BCEG | Standard, Moto, Taxi (Perte Recette + Prévoyance Décès) |
| 4 | **EDG** | EDG | Standard, Taxi (Perte Recette + Prévoyance Décès) |
| 5 | **SODEC** | SODEC | Contrat avec options prévoyance A/B |
| 6 | **FINAM** | FINAM | Personnel FINAM + Retraités |
| 7 | **COFIGA** | COFIGA | Contrat standard avec protection forfaitaire |
| 8 | **AGR PRO** | AGR PRO | Contrat avec prime unique |
| 9 | **ARIANE FINANCE** | ARIANE FINANCE | Contrat Décès/IAD |

### 6.3 Structure d'un Contrat

#### Contrat de Base
```typescript
interface ContratBase {
  id: number;
  emf_id: number;
  numero_police: string;
  montant_pret_assure?: number;
  duree_pret_mois: number;
  date_effet: string;
  date_fin_echeance: string;
  statut: 'en_attente' | 'actif' | 'suspendu' | 'resilie' | 'termine' | 'sinistre';
  cotisation_totale_ttc: number;
  created_at: string;
}
```

#### Champs Spécifiques BAMBOO
```typescript
interface ContratBamboo extends ContratBase {
  nom_prenom: string;
  telephone_assure: string;
  email_assure?: string;
  adresse_assure: string;
  ville_assure: string;
  categorie: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance?: boolean;
  garantie_deces_iad?: boolean;
  beneficiaire_prevoyance?: string;
  // Tarification
  prime_unique_prevoyance?: number;
  taux_deces_iad?: number;
  cotisation_deces_iad?: number;
  cotisation_perte_emploi?: number;
}
```

### 6.4 Fonctionnalités par Module

#### Page Liste des Contrats (`ContratListPage`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Recherche** | Par numéro de police, nom assuré, téléphone |
| **Filtres** | Par EMF, statut, type, période |
| **Tri** | Par date, montant, statut |
| **Pagination** | Affichage par lots de 10/25/50/100 |
| **Export** | Export CSV des résultats |
| **Import** | Import massif via CSV (modal dédié) |
| **Nouveau contrat** | Modal de sélection EMF + type puis redirection |

#### Création de Contrat

Chaque EMF dispose d'un formulaire de création dédié :

- `BambooContractCreateOfficial.tsx`
- `CofidecContractCreateOfficial.tsx`
- `BcegContractCreateOfficial.tsx`
- `EdgContractCreateOfficial.tsx`
- `SodecContractCreateOfficial.tsx`
- `FinamContractCreateOfficial.tsx`
- `CofigaContractCreateOfficial.tsx`
- `AgrProContractCreate.tsx`
- `ArianeFinanceContractCreateOfficial.tsx`

**Variantes pour contrats spéciaux** :
- `BcegMotoContractCreate.tsx` - Contrat Moto BCEG
- `BcegTaxiPerteRecetteCreate.tsx` - Contrat Taxi Perte de Recette BCEG
- `BcegTaxiPrevoyanceDecesCreate.tsx` - Contrat Taxi Prévoyance Décès BCEG
- `EdgTaxiPerteRecetteCreate.tsx` - Contrat Taxi Perte de Recette EDG
- `EdgTaxiPrevoyanceDecesCreate.tsx` - Contrat Taxi Prévoyance Décès EDG

#### Détail de Contrat

Pages de détail avec affichage complet des informations :
- Informations assuré
- Détails du prêt
- Garanties souscrites
- Tarification
- Historique

#### Impression de Contrat

Chaque EMF dispose d'un template d'impression officiel :
- Footer avec mentions légales
- Logo et en-tête
- Champs pré-remplis
- Format A4 optimisé

### 6.5 Import CSV

#### Fonctionnement

1. L'utilisateur télécharge un template CSV ( `public/templates/` )
2. Il remplit les données selon le format attendu
3. Upload du fichier via la modal d'import
4. Validation et normalisation automatique
5. Insertion en base avec gestion des erreurs

#### Normalisation Automatique

- **Encodage** : Détection et conversion UTF-8
- **Dates** : Support multi-format (DD/MM/YYYY, YYYY-MM-DD, etc.)
- **Montants** : Nettoyage des espaces et symboles (ex: "6 000 FCFA" → 6000)
- **Booléens** : OUI/NON, 1/0, true/false
- **Upsert** : Mise à jour si le numéro de police existe déjà

---

## 7. Gestion des Sinistres

### 7.1 Vue d'Ensemble

Le module de gestion des sinistres couvre l'ensemble du cycle de vie d'un sinistre, de la déclaration jusqu'à la clôture et l'archivage.

### 7.2 Types de Sinistres

| Type | Code | Description |
|------|------|-------------|
| **Décès** | `deces` | Décès de l'assuré |
| **IAD** | `iad` | Invalidité Absolue et Définitive |
| **Perte d'emploi** | `perte_emploi` | Licenciement |
| **Perte d'activité** | `perte_activite` | Faillite, cessation d'activité |
| **Maladie** | `maladie` | Maladie grave |

### 7.3 Workflow des Statuts

```
┌──────────────┐
│   en_cours   │──────────────────────────────────────┐
└──────┬───────┘                                      │
       │                                              │
       ▼                                              ▼
┌──────────────────┐                           ┌──────────┐
│  en_instruction  │                           │  rejete  │
└────────┬─────────┘                           └──────────┘
         │
         ▼
┌──────────────────┐
│   en_reglement   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   en_paiement    │
└────────┬─────────┘
         │
         ▼
┌──────────────┐
│     paye     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    cloture   │
└──────────────┘
```

### 7.4 Structure d'un Sinistre

```typescript
interface Sinistre {
  id: number;
  numero_sinistre: string;
  contrat_type: ContratType;
  contrat_id: number;
  type_sinistre: SinistreType;
  date_sinistre: string;
  date_declaration: string;
  
  // Déclarant
  nom_declarant: string;
  prenom_declarant: string;
  qualite_declarant: string;
  telephone_declarant: string;
  
  // Détails
  circonstances?: string;
  lieu_sinistre?: string;
  capital_restant_du: number;
  montant_reclame?: number;
  montant_indemnisation?: number;
  
  // Statut
  statut: SinistreStatut;
  motif_rejet?: string;
  observations?: string;
  
  // Documents
  fichier_certificat_deces?: string;
  fichier_tableau_amortissement?: string;
  // ... autres fichiers
  
  // Relations
  contrat?: ContratBase;
  quittances?: Quittance[];
}
```

### 7.5 Fonctionnalités

#### Déclaration de Sinistre

- Sélection du contrat concerné
- Choix du type de sinistre
- Saisie des informations du sinistre
- Upload des documents justificatifs

#### Traitement (`SinistreTraitementPage`)

La page de traitement offre une interface complète pour :
- Visualiser toutes les informations du sinistre
- Gérer les documents (upload, téléchargement)
- Changer le statut avec historique
- Générer et gérer les quittances
- Rejeter avec motif
- Clôturer le dossier

#### Système de Quittances

```typescript
interface Quittance {
  id: number;
  sinistre_id: number;
  reference: string;
  type: TypeQuittance;  // capital_sans_interets, capital_prevoyance, etc.
  beneficiaire: string;
  montant: number;
  statut: 'en_attente' | 'validee' | 'payee' | 'annulee';
  date_validation?: string;
  date_paiement?: string;
  mode_paiement?: string;
}
```

**Types de Quittances** :
| Type | Bénéficiaire | Description |
|------|--------------|-------------|
| `capital_sans_interets` | EMF | Remboursement du capital |
| `capital_restant_du` | EMF | Capital restant dû |
| `capital_prevoyance` | Bénéficiaire désigné | Prévoyance décès |
| `indemnite_journaliere` | Assuré | Indemnités journalières |
| `frais_medicaux` | Assuré | Remboursement frais |

### 7.6 Règles Métier

#### Règle A - Validation
Un sinistre ne peut être validé que si :
- Le contrat était actif à la date du sinistre
- Le délai de carence est respecté (ex: maladie)
- Les documents obligatoires sont fournis

#### Règle B - Quittances
Une quittance doit passer par :
1. Création (en_attente)
2. Validation (validée) - par FPDG/Admin
3. Paiement (payée) - avec mode et référence

#### Règle C - Délai de Paiement
- Délai de 10 jours après validation
- Alerte si délai dépassé
- Niveaux d'urgence : normal, urgent, critique

#### Règle E - Clôture et Archivage
- Un sinistre est clôturable uniquement si toutes les quittances sont payées
- La clôture génère un fichier d'archive
- Un sinistre clôturé n'est plus modifiable

---

## 8. Espace Comptable

### 8.1 Description

L'espace comptable est une interface dédiée aux comptables pour la gestion financière des sinistres et le suivi des paiements.

### 8.2 Pages Disponibles

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard Comptable** | `/comptable` | Vue d'ensemble financière |
| **Quittances** | `/comptable/quittances` | Gestion des quittances à payer |
| **Historique Paiements** | `/comptable/historique` | Journal des paiements effectués |
| **Rapport Financier** | `/comptable/rapport` | Rapports et exports |

### 8.3 Dashboard Comptable

Affiche :
- Nombre de quittances en attente
- Montant total à payer
- Quittances validées/payées ce mois
- Graphiques de suivi
- Liste des quittances urgentes

### 8.4 Gestion des Quittances

```typescript
// Actions disponibles
- Valider une quittance (si rôle autorisé)
- Payer une quittance (saisie mode + référence)
- Voir le détail d'une quittance
- Filtrer par EMF, statut, période
```

---

## 9. Espace FPDG

### 9.1 Description

Le Fondé de Pouvoir Délégué Général (FPDG) dispose d'un espace dédié avec des pouvoirs étendus sur la validation et la clôture des sinistres.

### 9.2 Pages Disponibles

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard FPDG** | `/fpdg` | Tableau de bord exécutif |
| **Statistiques** | `/fpdg/statistiques` | Analyses détaillées |
| **Sinistres** | `/fpdg/sinistres` | Liste complète sinistres |
| **Validation** | `/fpdg/validation` | Sinistres à valider |
| **Clôture** | `/fpdg/cloture` | Sinistres à clôturer |
| **Quittances** | `/fpdg/quittances` | Gestion quittances |
| **Historique** | `/fpdg/historique` | Historique actions |
| **Rapports** | `/fpdg/rapports` | Génération rapports |

### 9.3 Fonctionnalités Spécifiques

- **Validation en masse** des quittances
- **Clôture** des sinistres (action irréversible)
- **Vue transversale** tous EMF
- **Export** de données
- **Statistiques avancées** (S/P ratio, répartition par EMF)

---

## 10. Gestion des Exercices

### 10.1 Description

Un exercice représente une année comptable avec le suivi de la production (contrats) et de la sinistralité.

### 10.2 Structure d'un Exercice

```typescript
interface Exercice {
  id: number;
  annee: number;
  libelle: string;
  date_debut: string;
  date_fin: string;
  statut: 'en_cours' | 'cloture';
  est_courant: boolean;
}
```

### 10.3 Rapport d'Exercice

Le rapport d'exercice contient :

```typescript
interface RapportExercice {
  exercice: Exercice;
  production: {
    nombre_contrats: number;
    total_primes_emises: number;
    montant_total_assure: number;
  };
  sinistralite: {
    nombre_sinistres: number;
    total_declares: number;
    total_indemnises: number;
    total_payes: number;
    total_rejetes: number;
  };
  repartition_contrats: Record<string, number>;
  ratio_sp: number;  // Sinistres / Primes
}
```

### 10.4 Pages Exercices

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard Exercices** | `/exercices` | Liste et création d'exercices |
| **Détail Exercice** | `/exercices/:id` | Rapport détaillé |

---

## 11. Partenaires EMF

### 11.1 Description

L'application gère les Établissements de Microfinance partenaires avec leurs informations et configuration spécifique.

### 11.2 Structure EMF

```typescript
interface Emf {
  id: number;
  raison_sociale: string;
  sigle: string;
  type: 'emf' | 'banque';
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  
  // Configuration
  montant_max_pret: number;
  duree_max_pret_mois: number;
  taux_commission: number;
  
  // Contact
  contact_nom?: string;
  contact_fonction?: string;
  contact_telephone?: string;
}
```

### 11.3 Pages EMF

| Page | Route | Description |
|------|-------|-------------|
| **Liste EMF** | `/emfs` | Liste des partenaires |
| **Détail EMF** | `/emfs/:id` | Informations + statistiques |
| **Création EMF** | `/emfs/nouveau` | Formulaire création |
| **Édition EMF** | `/emfs/:id/edit` | Modification |

---

## 12. Types de Données

### 12.1 Organisation des Types

Les types TypeScript sont organisés dans `src/types/` :

| Fichier | Description |
|---------|-------------|
| `auth.types.ts` | Types authentification |
| `contrat.types.ts` | Types contrats (base) |
| `sinistre.types.ts` | Types sinistres |
| `emf.types.ts` | Types EMF |
| `dashboard.types.ts` | Types dashboard |
| `exercice.types.ts` | Types exercices |
| `comptable.types.ts` | Types comptabilité |
| `bamboo.ts` | Types spécifiques BAMBOO |
| `cofidec.ts` | Types spécifiques COFIDEC |
| `bceg.ts`, `bcegTaxi.ts`, `bcegMoto.ts` | Types spécifiques BCEG |
| `edg.ts`, `edgTaxi.ts` | Types spécifiques EDG |
| `sodec.ts` | Types spécifiques SODEC |
| `finam.ts` | Types spécifiques FINAM |
| `cofiga.ts` | Types spécifiques COFIGA |
| `agrpro.ts` | Types spécifiques AGR PRO |
| `arianeFinance.ts` | Types spécifiques ARIANE FINANCE |

### 12.2 Types Communs

```typescript
// Réponse API paginée
interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    last_page: number;
    total: number;
  };
}

// Réponse API simple
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

---

## 13. Services API

### 13.1 Configuration Axios

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 13.2 Services Disponibles

| Service | Fichier | Description |
|---------|---------|-------------|
| **Auth** | `auth.service.ts` | Authentification (login, logout, refresh) |
| **Contrat** | `contrat.service.ts` | CRUD contrats multi-EMF |
| **Sinistre** | `sinistre.service.ts` | Gestion sinistres et quittances |
| **EMF** | `emf.service.ts` | Gestion EMF |
| **User** | `user.service.ts` | Gestion utilisateurs |
| **Comptable** | `comptable.service.ts` | API comptabilité |
| **FPDG** | `fpdg.service.ts` | API espace FPDG |
| **Exercice** | `exercice.service.ts` | Gestion exercices |

### 13.3 Exemple de Service

```typescript
// services/contrat.service.ts
export const contratService = {
  // Recherche par numéro de police
  searchByPolice: async (numeroPolice: string) => {
    const response = await api.get('/contrats/search', {
      params: { numero_police: numeroPolice },
    });
    return response.data;
  },

  // CRUD pour chaque EMF
  bamboo: {
    getAll: async (params?) => api.get('/bamboo-emf/contrats', { params }),
    getById: async (id) => api.get(`/bamboo-emf/contrats/${id}`),
    create: async (data) => api.post('/bamboo-emf/contrats', data),
    update: async (id, data) => api.put(`/bamboo-emf/contrats/${id}`, data),
    delete: async (id) => api.delete(`/bamboo-emf/contrats/${id}`),
    simuler: async (data) => api.post('/bamboo-emf/simuler-tarification', data),
    stats: async () => api.get('/bamboo-emf/statistiques'),
  },
  // ... idem pour les autres EMF
};
```

---

## 14. Composants UI

### 14.1 Composants de Base (`components/ui/`)

| Composant | Description |
|-----------|-------------|
| `Button.tsx` | Bouton avec variantes (primary, secondary, danger, ghost) |
| `Input.tsx` | Champ de saisie avec label et erreur |
| `Select.tsx` | Liste déroulante |
| `Textarea.tsx` | Zone de texte multi-lignes |
| `Checkbox.tsx` | Case à cocher |
| `Modal.tsx` | Fenêtre modale |
| `Card.tsx` | Carte conteneur (Header, Content, Footer) |
| `Table.tsx` | Tableau de données (Header, Body, Row, Cell) |
| `Badge.tsx` | Badge de statut coloré |
| `Toast.tsx` | Notifications toast |
| `Label.tsx` | Label de formulaire |
| `Separator.tsx` | Séparateur horizontal |
| `LimitesDepasseesModal.tsx` | Modal d'alerte limites dépassées |

### 14.2 Composants Layout (`components/layout/`)

| Composant | Description |
|-----------|-------------|
| `AppLayout.tsx` | Layout principal (Sidebar + Header + Content) |
| `Sidebar.tsx` | Barre latérale navigation principale |
| `Header.tsx` | En-tête avec recherche et profil |
| `ComptableLayout.tsx` | Layout espace comptable |
| `ComptableSidebar.tsx` | Navigation comptable |
| `FpdgLayout.tsx` | Layout espace FPDG |
| `FpdgSidebar.tsx` | Navigation FPDG |

### 14.3 Composants Partagés (`components/shared/`)

| Composant | Description |
|-----------|-------------|
| `LoadingSpinner.tsx` | Indicateur de chargement |
| `ErrorMessage.tsx` | Affichage d'erreur |

---

## 15. Hooks Personnalisés

### 15.1 Organisation

Les hooks sont dans `src/hooks/` et encapsulent la logique de requêtes API avec TanStack Query.

### 15.2 Hooks par Domaine

#### Hooks Contrats
| Hook | Description |
|------|-------------|
| `useBambooContracts` | CRUD contrats BAMBOO |
| `useCofidecContracts` | CRUD contrats COFIDEC |
| `useBcegContracts` | CRUD contrats BCEG |
| `useEdgContracts` | CRUD contrats EDG |
| `useSodecContracts` | CRUD contrats SODEC |
| `useFinamContracts` | CRUD contrats FINAM |
| `useCofigaContracts` | CRUD contrats COFIGA |
| `useAgrProContracts` | CRUD contrats AGR PRO |
| `useArianeFinanceContracts` | CRUD contrats ARIANE FINANCE |

#### Hooks Sinistres
| Hook | Description |
|------|-------------|
| `useSinistres` | Liste et CRUD sinistres |
| `useBambooSinistres` | Sinistres BAMBOO |
| `useCofidecSinistres` | Sinistres COFIDEC |
| etc... | |
| `useSinistreValidation` | Logique de validation |
| `useSinistresEvolution` | Données d'évolution graphique |

#### Hooks Statistiques
| Hook | Description |
|------|-------------|
| `useDashboardStats` | Stats dashboard global |
| `useBambooStats` | Stats BAMBOO |
| etc... | |

#### Hooks Utilitaires
| Hook | Description |
|------|-------------|
| `useAuth` | Authentification |
| `useCurrentUser` | Utilisateur courant |
| `useDebounce` | Debounce de valeurs |

### 15.3 Exemple de Hook

```typescript
// hooks/useBambooContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useBambooContracts(params?: ContratSearchParams) {
  return useQuery({
    queryKey: ['bamboo-contrats', params],
    queryFn: async () => {
      const response = await api.get('/bamboo-emf/contrats', { params });
      return response.data;
    },
  });
}

export function useCreateBambooContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: BambooContratCreatePayload) => {
      const response = await api.post('/bamboo-emf/contrats', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bamboo-contrats'] });
    },
  });
}
```

---

## 16. Gestion de l'État

### 16.1 Zustand Store

L'application utilise Zustand pour la gestion de l'état global, principalement pour l'authentification.

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 16.2 TanStack Query

Les données serveur sont gérées via TanStack Query avec :
- Cache automatique
- Invalidation sur mutation
- Refetch automatique
- États de chargement et erreur

---

## 17. Routes de l'Application

### 17.1 Routes Publiques

| Route | Composant | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Page de connexion |

### 17.2 Routes Protégées - Principal

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | `DashboardRedirect` | Redirection vers dashboard EMF |
| `/dashboard` | `DashboardPage` | Dashboard global (admin) |
| `/dashboard/bamboo` | `BambooDashboard` | Dashboard BAMBOO |
| `/dashboard/cofidec` | `CofidecDashboard` | Dashboard COFIDEC |
| `/dashboard/bceg` | `BcegDashboard` | Dashboard BCEG |
| `/dashboard/edg` | `EdgDashboard` | Dashboard EDG |
| `/dashboard/sodec` | `SodecDashboard` | Dashboard SODEC |
| `/dashboard/finam` | `FinamDashboard` | Dashboard FINAM |
| `/dashboard/cofiga` | `CofigaDashboard` | Dashboard COFIGA |
| `/dashboard/agrpro` | `AgrProDashboard` | Dashboard AGR PRO |
| `/dashboard/arianefinance` | `ArianeFinanceDashboard` | Dashboard ARIANE FINANCE |
| `/profile` | `ProfilePage` | Profil utilisateur |

### 17.3 Routes Protégées - Contrats

| Route | Composant | Description |
|-------|-----------|-------------|
| `/contrats` | `ContratListPage` | Liste tous contrats |
| `/contrats/:emf` | Liste EMF | Liste par EMF |
| `/contrats/:emf/:id` | Détail EMF | Détail contrat |
| `/contrats/:emf/:id/edit` | Création EMF | Édition contrat |
| `/contrats/:emf/:id/print` | Print EMF | Impression contrat |
| `/contrats/nouveau/:emf` | Création EMF | Nouveau contrat |

### 17.4 Routes Protégées - Sinistres

| Route | Composant | Description |
|-------|-----------|-------------|
| `/sinistres` | `SinistreListPage` | Liste tous sinistres |
| `/sinistres/:emf` | Liste EMF | Liste par EMF |
| `/sinistres/nouveau` | `SinistreDeclarationForm` | Déclaration générique |
| `/sinistres/nouveau/:emf` | Déclaration EMF | Déclaration par EMF |
| `/sinistres/traitement/:id` | `SinistreTraitementPage` | Traitement sinistre |
| `/sinistres/detail/:id` | `SinistreDetailPageV2` | Détail + quittances |
| `/sinistres/:emf/:id` | `SinistreDetailPageV2` | Détail par EMF |

### 17.5 Routes Protégées - Administration

| Route | Composant | Description |
|-------|-----------|-------------|
| `/emfs` | `EmfListPage` | Liste EMF |
| `/emfs/nouveau` | `EmfForm` | Nouvel EMF |
| `/emfs/:id` | `EmfDetailPage` | Détail EMF |
| `/emfs/:id/edit` | `EmfForm` | Édition EMF |
| `/users` | `UserListPage` | Liste utilisateurs |
| `/users/nouveau` | `UserForm` | Nouvel utilisateur |
| `/users/:id` | `UserDetailPage` | Détail utilisateur |
| `/users/:id/edit` | `UserForm` | Édition utilisateur |
| `/statistiques` | `StatistiquesPage` | Statistiques globales |
| `/settings` | `SettingsPage` | Paramètres |
| `/exercices` | `ExerciceDashboard` | Dashboard exercices |
| `/exercices/:id` | `ExerciceDetail` | Détail exercice |

### 17.6 Routes Espace Comptable

| Route | Composant | Description |
|-------|-----------|-------------|
| `/comptable` | `ComptableDashboard` | Dashboard comptable |
| `/comptable/quittances` | `QuittancesPage` | Gestion quittances |
| `/comptable/historique` | `HistoriquePaiementsPage` | Historique paiements |
| `/comptable/rapport` | `RapportFinancierPage` | Rapports financiers |

### 17.7 Routes Espace FPDG

| Route | Composant | Description |
|-------|-----------|-------------|
| `/fpdg` | `FpdgDashboard` | Dashboard FPDG |
| `/fpdg/statistiques` | `FpdgStatistiquesPage` | Statistiques avancées |
| `/fpdg/sinistres` | `FpdgSinistresPage` | Liste sinistres |
| `/fpdg/validation` | `FpdgValidationPage` | Sinistres à valider |
| `/fpdg/cloture` | `FpdgCloturePage` | Sinistres à clôturer |
| `/fpdg/quittances` | `FpdgQuittancesPage` | Gestion quittances |
| `/fpdg/historique` | `FpdgHistoriquePage` | Historique actions |
| `/fpdg/rapports` | `FpdgRapportsPage` | Génération rapports |

---

## 18. Fonctionnalités Avancées

### 18.1 Graphiques et Visualisations

L'application utilise **Recharts** pour les visualisations :

- **PieChart** : Répartition par EMF
- **BarChart** : Évolution mensuelle contrats
- **LineChart** : Courbes tendance sinistres
- **AreaChart** : Surfaces empilées

### 18.2 Système de Notifications (Toast)

```typescript
// Utilisation
import { toast } from 'react-hot-toast';

toast.success('Contrat créé avec succès !');
toast.error('Erreur lors de la création');
toast.loading('Chargement...');
```

### 18.3 Simulation de Tarification

Chaque EMF dispose d'un simulateur de tarification côté backend :

```typescript
// Exemple BAMBOO
const simulation = await contratService.bamboo.simuler({
  montant_pret: 5000000,
  duree_mois: 24,
  avec_perte_emploi: true,
});

// Résultat
{
  montant_pret: "5 000 000 FCFA",
  cotisation_deces_iad: "75 000 FCFA",
  cotisation_perte_emploi: "25 000 FCFA",
  cotisation_totale: "100 000 FCFA",
  dans_limites: true,
}
```

### 18.4 Génération PDF et Impression

```typescript
// Avec react-to-print
import { useReactToPrint } from 'react-to-print';

const handlePrint = useReactToPrint({
  content: () => printRef.current,
  documentTitle: `Contrat-${contrat.numero_police}`,
});
```

### 18.5 Export de Données

- Export CSV des listes de contrats
- Export PDF des rapports
- Export des quittances

### 18.6 Délais et Alertes

Le système gère automatiquement :
- Alerte contrats expirant sous 30 jours
- Délai de 10 jours pour paiement quittances
- Niveaux d'urgence (normal, urgent, critique)
- Badge coloré selon l'urgence

---

## Annexes

### A. Variables d'Environnement

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SAMB'A Assurances
```

### B. Scripts NPM

```json
{
  "dev": "vite",              // Démarrage développement
  "build": "tsc -b && vite build",  // Build production
  "lint": "eslint .",         // Vérification code
  "preview": "vite preview"   // Preview build
}
```

### C. Constantes Métier par EMF

#### COFIGA
```typescript
TAUX_GARANTIE: 1.50%
PRIME_UNIQUE: 5000 FCFA
PROTECTION_FORFAITAIRE: 250 000 FCFA
MONTANT_MAX_PRET: 10 000 000 FCFA
DUREE_MAX_PRET: 24 mois
```

#### FINAM
```typescript
// Personnel FINAM
PERSONNEL_TAUX: 2.00%
PERSONNEL_MONTANT_MAX: 10 000 000 FCFA
PERSONNEL_DUREE_MAX: 60 mois

// Retraités
RETRAITES_TAUX: 2.50%
RETRAITES_MONTANT_MAX: 5 000 000 FCFA
RETRAITES_DUREE_MAX: 36 mois
```

---

## Conclusion

Cette documentation couvre l'ensemble des fonctionnalités de l'application **SAMB'A Assurances Frontend**. L'architecture modulaire par features, combinée à TypeScript et TanStack Query, assure une application maintenable et évolutive.

Pour toute question ou contribution, référez-vous aux fichiers source dans les dossiers correspondants.

---

*Documentation générée le 14 janvier 2026*  
*Version 1.0.0*
