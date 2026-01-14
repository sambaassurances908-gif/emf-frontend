# 📁 STRUCTURE DES FICHIERS - SAMB'A Assurances

> Rôle détaillé de chaque fichier et dossier de l'application

---

## 📂 RACINE DU PROJET

| Fichier | Rôle |
|---------|------|
| `package.json` | Dépendances NPM et scripts (dev, build, lint) |
| `package-lock.json` | Versions verrouillées des dépendances |
| `vite.config.ts` | Configuration Vite (alias @/, proxy API) |
| `tsconfig.json` | Configuration TypeScript principale |
| `tsconfig.app.json` | Configuration TS pour l'application |
| `tsconfig.node.json` | Configuration TS pour Node.js |
| `tailwind.config.js` | Configuration TailwindCSS (couleurs, thèmes) |
| `postcss.config.js` | Configuration PostCSS pour TailwindCSS |
| `eslint.config.js` | Règles ESLint pour la qualité du code |
| `index.html` | Point d'entrée HTML de l'application |
| `README.md` | Documentation rapide du projet |
| `.gitignore` | Fichiers à ignorer par Git |

---

## 📂 public/

Ressources statiques accessibles publiquement.

| Fichier/Dossier | Rôle |
|-----------------|------|
| `vite.svg` | Logo Vite par défaut |
| `templates/` | **Templates CSV pour import de contrats** |

### 📂 public/templates/

| Fichier | Rôle |
|---------|------|
| `template_import_bamboo.csv` | Template import contrats BAMBOO |
| `template_import_cofidec.csv` | Template import contrats COFIDEC |
| `template_import_bceg.csv` | Template import contrats BCEG |
| `template_import_edg.csv` | Template import contrats EDG |
| `template_import_sodec.csv` | Template import contrats SODEC |
| `template_import_finam.csv` | Template import contrats FINAM |
| `template_import_cofiga.csv` | Template import contrats COFIGA |
| `template_import_agrpro.csv` | Template import contrats AGR PRO |
| `template_import_ariane.csv` | Template import contrats ARIANE FINANCE |
| `template_import_universel.csv` | Template import universel (25 colonnes) |

---

## 📂 src/

Code source de l'application React.

### Fichiers Racine src/

| Fichier | Rôle |
|---------|------|
| `main.tsx` | **Point d'entrée** - Monte l'app React, configure QueryClient |
| `App.tsx` | **Composant racine** - RouterProvider + Toaster |
| `App.css` | Styles globaux CSS |
| `index.css` | Styles TailwindCSS + custom |
| `router.tsx` | **Configuration des routes** - Définit toutes les 100+ routes |
| `vite-env.d.ts` | Types pour variables d'environnement Vite |

---

## 📂 src/assets/

Ressources graphiques de l'application.

| Fichier | Rôle |
|---------|------|
| `logo-samba.png` | Logo SAMB'A Assurances |
| `logo-bamboo.jpeg` | Logo EMF BAMBOO |
| `logo-cofidec.jpg` | Logo EMF COFIDEC |
| `logo_bceg.png` | Logo EMF BCEG |
| `logo-edg.png` | Logo EMF EDG |
| `logo-sodec.jpeg` | Logo EMF SODEC |
| `logo agrpro.jpg` | Logo EMF AGR PRO |
| `logo ariane finance.jpg` | Logo EMF ARIANE FINANCE |
| `signature-fpdg.png` | Signature du FPDG pour documents |
| `signature-technique.png` | Signature technique pour documents |
| `react.svg` | Logo React |

---

## 📂 src/store/

Gestion de l'état global avec Zustand.

| Fichier | Rôle |
|---------|------|
| `authStore.ts` | **Store d'authentification** - user, token, isAuthenticated, login(), logout() |

---

## 📂 src/lib/

Utilitaires et configuration.

| Fichier | Rôle |
|---------|------|
| `api.ts` | **Instance Axios** - baseURL, intercepteurs auth, gestion erreurs |
| `axios.ts` | Configuration alternative Axios |
| `utils.ts` | **Fonctions utilitaires** - formatCurrency(), formatDate(), cn(), safeNumber() |
| `constants.ts` | Constantes globales (couleurs EMF, statuts) |
| `pdfGenerator.ts` | Génération de PDF avec jsPDF |

---

## 📂 src/types/

Définitions TypeScript.

| Fichier | Rôle |
|---------|------|
| `auth.types.ts` | Types User, LoginCredentials, LoginResponse |
| `contrat.types.ts` | Types ContratBase, ContratBamboo, ContratCofidec, etc. |
| `sinistre.types.ts` | Types Sinistre, SinistreStatut, Quittance, SinistreType |
| `emf.types.ts` | Types Emf, CreateEmfPayload, EmfStats |
| `dashboard.types.ts` | Types DashboardStats, EmfStats |
| `exercice.types.ts` | Types Exercice, RapportExercice |
| `comptable.types.ts` | Types pour l'espace comptable |
| `common.types.ts` | Types génériques (PaginatedResponse) |
| `user.types.ts` | Types utilisateur |

### Types EMF Spécifiques

| Fichier | Rôle |
|---------|------|
| `bamboo.ts` | BambooContrat, BambooDashboardStats |
| `cofidec.ts` | CofidecContrat, constantes COFIDEC |
| `bceg.ts` | BcegContrat, BcegDashboardStats |
| `bcegMoto.ts` | ContratBcegMoto |
| `bcegTaxi.ts` | ContratBcegTaxiPerteRecette, ContratBcegTaxiPrevoyanceDeces |
| `edg.ts` | EdgContrat, EdgDashboardStats |
| `edgTaxi.ts` | ContratEdgTaxiPerteRecette, ContratEdgTaxiPrevoyanceDeces |
| `sodec.ts` | SodecContrat, AssureAssocie, SODEC_CONSTANTS |
| `finam.ts` | FinamContrat, FINAM_CONSTANTS |
| `cofiga.ts` | CofigaContrat, COFIGA_CONSTANTS |
| `agrpro.ts` | AgrProContrat, AgrProDashboardStats |
| `arianeFinance.ts` | ArianeFinanceContrat |

---

## 📂 src/services/

Services API pour communiquer avec le backend.

| Fichier | Rôle |
|---------|------|
| `auth.service.ts` | **Authentification** - login(), logout(), me(), refresh(), forgotPassword() |
| `contrat.service.ts` | **CRUD Contrats** - getAll(), getById(), create(), simuler() par EMF |
| `sinistre.service.ts` | **Sinistres + Quittances** - create(), getQuittances(), validerQuittance(), payerQuittance(), cloturer() |
| `emf.service.ts` | CRUD EMF partenaires |
| `user.service.ts` | CRUD Utilisateurs |
| `comptable.service.ts` | API comptabilité - dashboard, quittances, paiements |
| `fpdg.service.ts` | API FPDG - validation, clôture, statistiques |
| `exercice.service.ts` | CRUD Exercices - getCourant(), getRapport() |

---

## 📂 src/hooks/

Hooks React personnalisés avec TanStack Query.

### Hooks Contrats

| Fichier | Rôle |
|---------|------|
| `useBambooContracts.ts` | CRUD + mutations contrats BAMBOO |
| `useCofidecContracts.ts` | CRUD + mutations contrats COFIDEC |
| `useBcegContracts.ts` | CRUD + mutations contrats BCEG |
| `useBcegMotoContracts.ts` | CRUD contrats BCEG Moto |
| `useBcegTaxiContracts.ts` | CRUD contrats BCEG Taxi |
| `useEdgContracts.ts` | CRUD + mutations contrats EDG |
| `useEdgTaxiContracts.ts` | CRUD contrats EDG Taxi |
| `useSodecContracts.ts` | CRUD + mutations contrats SODEC |
| `useFinamContracts.ts` | CRUD + mutations contrats FINAM |
| `useCofigaContracts.ts` | CRUD + mutations contrats COFIGA |
| `useAgrProContracts.ts` | CRUD + mutations contrats AGR PRO |
| `useArianeFinanceContracts.ts` | CRUD + mutations contrats ARIANE FINANCE |

### Hooks Sinistres

| Fichier | Rôle |
|---------|------|
| `useSinistres.ts` | Liste et CRUD sinistres globaux |
| `useBambooSinistres.ts` | Sinistres BAMBOO |
| `useCofidecSinistres.ts` | Sinistres COFIDEC |
| `useBcegSinistres.ts` | Sinistres BCEG |
| `useEdgSinistres.ts` | Sinistres EDG |
| `useSodecSinistres.ts` | Sinistres SODEC |
| `useFinamSinistres.ts` | Sinistres FINAM |
| `useCofigaSinistres.ts` | Sinistres COFIGA |
| `useAgrProSinistres.ts` | Sinistres AGR PRO |
| `useArianeFinanceSinistres.ts` | Sinistres ARIANE FINANCE |
| `useSinistreValidation.ts` | Logique de validation sinistre |
| `useSinistresEvolution.ts` | Données évolution pour graphiques |

### Hooks Statistiques

| Fichier | Rôle |
|---------|------|
| `useDashboardStats.ts` | Stats dashboard global |
| `useBambooStats.ts` | Stats BAMBOO |
| `useBcegStats.ts` | Stats BCEG |
| `useEdgStats.ts` | Stats EDG |
| `useCofidecStats.ts` | Stats COFIDEC |
| `useSodecStats.ts` | Stats SODEC |
| `useAgrProStats.ts` | Stats AGR PRO |
| `useArianeFinanceStats.ts` | Stats ARIANE FINANCE |

### Hooks Contrats Récents

| Fichier | Rôle |
|---------|------|
| `useRecentContracts.ts` | Contrats récents (tous) |
| `useBambooRecentContracts.ts` | Contrats récents BAMBOO |
| `useCofidecRecentContracts.ts` | Contrats récents COFIDEC |
| `useBcegRecentContracts.ts` | Contrats récents BCEG |
| `useEdgRecentContracts.ts` | Contrats récents EDG |
| `useSodecRecentContracts.ts` | Contrats récents SODEC |
| `useAgrProRecentContracts.ts` | Contrats récents AGR PRO |
| `useArianeFinanceRecentContracts.ts` | Contrats récents ARIANE FINANCE |

### Hooks Utilitaires

| Fichier | Rôle |
|---------|------|
| `useAuth.ts` | Hook d'authentification |
| `useCurrentUser.ts` | Récupère l'utilisateur courant |
| `useDebounce.ts` | Debounce de valeurs (recherche) |
| `services.ts` | Services partagés |

---

## 📂 src/pages/

Pages générales non liées à une feature.

| Fichier | Rôle |
|---------|------|
| `NotFoundPage.tsx` | Page 404 - Route non trouvée |
| `ProfilePage.tsx` | Page profil utilisateur |
| `index.ts` | Exports des pages |

---

## 📂 src/components/

Composants réutilisables.

### 📂 components/ui/

Composants UI de base (Design System).

| Fichier | Rôle |
|---------|------|
| `Button.tsx` | Bouton avec variantes (primary, secondary, danger, ghost, outline) |
| `Input.tsx` | Champ de saisie avec label et message d'erreur |
| `Select.tsx` | Liste déroulante stylisée |
| `Textarea.tsx` | Zone de texte multi-lignes |
| `Checkbox.tsx` | Case à cocher |
| `Label.tsx` | Label de formulaire |
| `Card.tsx` | Carte conteneur (Card, CardHeader, CardContent, CardFooter) |
| `Table.tsx` | Tableau (Table, TableHeader, TableBody, TableRow, TableCell) |
| `Modal.tsx` | Fenêtre modale avec overlay |
| `Badge.tsx` | Badge de statut coloré |
| `Toast.tsx` | Système de notifications toast |
| `Separator.tsx` | Séparateur horizontal |
| `LimitesDepasseesModal.tsx` | Modal d'alerte quand limites EMF dépassées |

### 📂 components/layout/

Layouts et navigation.

| Fichier | Rôle |
|---------|------|
| `AppLayout.tsx` | **Layout principal** - Sidebar + Header + Outlet |
| `Sidebar.tsx` | **Navigation principale** - Menu avec liens vers modules |
| `Header.tsx` | **En-tête** - Recherche globale, notifications, profil |
| `ComptableLayout.tsx` | Layout dédié espace comptable |
| `ComptableSidebar.tsx` | Navigation espace comptable |
| `FpdgLayout.tsx` | Layout dédié espace FPDG |
| `FpdgSidebar.tsx` | Navigation espace FPDG |

### 📂 components/auth/

Composants d'authentification.

| Fichier | Rôle |
|---------|------|
| `ProtectedRoute.tsx` | **HOC Protection** - Redirige vers /login si non authentifié |

### 📂 components/routing/

Composants de routage.

| Fichier | Rôle |
|---------|------|
| `DashboardRedirect.tsx` | Redirige vers le dashboard EMF selon user.emf_id |

### 📂 components/shared/

Composants partagés.

| Fichier | Rôle |
|---------|------|
| `LoadingSpinner.tsx` | Indicateur de chargement animé |
| `EmptyState.tsx` | État vide (aucune donnée) |

### 📂 components/modals/

Modales spécialisées.

| Fichier | Rôle |
|---------|------|
| `ImportContratModal.tsx` | **Modal d'import CSV** - Upload, validation, affichage erreurs |

### 📂 components/contrats/

Composants spécifiques aux contrats.

| Fichier | Rôle |
|---------|------|
| `SodecContratPrint.tsx` | Template impression contrat SODEC |
| `EdgContratPrint.tsx` | Template impression contrat EDG |
| `FinamContratPrint.tsx` | Template impression contrat FINAM |
| `CofigaContratPrint.tsx` | Template impression contrat COFIGA |
| `RecentContracts.tsx` | Widget contrats récents pour dashboard |

### 📂 components/sinistres/

Composants spécifiques aux sinistres.

| Fichier | Rôle |
|---------|------|
| `SinistreStatutBadge.tsx` | Badge coloré selon statut sinistre |
| `TypeSinistreBadge.tsx` | Badge type sinistre (décès, IAD, etc.) |
| `SinistreWorkflow.tsx` | Visualisation du workflow de statuts |
| `QuittancesList.tsx` | Liste des quittances d'un sinistre |
| `DelaiPaiementIndicator.tsx` | Indicateur délai paiement (10 jours) |
| `ArchiveBadge.tsx` | Badge sinistre archivé |
| `index.ts` | Exports des composants |

### 📂 components/quittances/

Composants spécifiques aux quittances.

| Fichier | Rôle |
|---------|------|
| `QuittanceGenerationModal.tsx` | Modal création quittances |
| `QuittanceValidationModal.tsx` | Modal validation quittance |
| `QuittancePrint.tsx` | Template impression quittance |
| `index.ts` | Exports des composants |

### 📂 components/comptable/

Composants espace comptable.

| Fichier | Rôle |
|---------|------|
| `StatsCard.tsx` | Carte statistique comptable |
| `QuittanceEnAttenteCard.tsx` | Carte quittance en attente |
| `AlerteDelaiCard.tsx` | Carte alerte délai dépassé |
| `index.ts` | Exports des composants |

---

---
# 📁 STRUCTURE DES FICHIERS - Partie 2 : Features

> Détail des modules fonctionnels (features/)

---

## 📂 src/features/

Modules fonctionnels organisés par domaine métier.

---

## 📂 features/auth/

Module d'authentification.

| Fichier | Rôle |
|---------|------|
| `LoginPage.tsx` | **Page de connexion** - Formulaire email/password, gestion erreurs |

---

## 📂 features/dashboard/

Dashboard principal.

| Fichier | Rôle |
|---------|------|
| `DashboardPage.tsx` | **Dashboard global administrateur** - Stats tous EMF, graphiques, indicateurs |
| `components/` | Composants du dashboard |

---

## 📂 features/contrats/

Module de gestion des contrats (le plus volumineux).

| Fichier | Rôle |
|---------|------|
| `ContratListPage.tsx` | **Liste générale des contrats** - Recherche, filtres, pagination, modal import |

### 📂 features/contrats/pages/

| Fichier | Rôle |
|---------|------|
| `ContratDetailPage.tsx` | Page détail générique (fallback) |

### 📂 features/contrats/pages/dashboard/

Dashboards par EMF.

| Fichier | Rôle |
|---------|------|
| `BambooDashboard.tsx` | Dashboard BAMBOO - Stats, contrats récents, graphiques |
| `CofidecDashboard.tsx` | Dashboard COFIDEC |
| `BcegDashboard.tsx` | Dashboard BCEG |
| `EdgDashboard.tsx` | Dashboard EDG |
| `SodecDashboard.tsx` | Dashboard SODEC |
| `FinamDashboard.tsx` | Dashboard FINAM |
| `CofigaDashboard.tsx` | Dashboard COFIGA |
| `AgrProDashboard.tsx` | Dashboard AGR PRO |
| `ArianeFinanceDashboard.tsx` | Dashboard ARIANE FINANCE |

---

### 📂 features/contrats/bamboo/

Contrats BAMBOO EMF (emf_id = 1).

| Fichier | Rôle |
|---------|------|
| `BambooContractsList.tsx` | Liste des contrats BAMBOO avec recherche/filtres |
| `BambooContractCreateOfficial.tsx` | **Formulaire création/édition** - Calculs automatiques cotisations |
| `BambooContractCreate.tsx` | Ancien formulaire (legacy) |
| `BambooContratDetailPage.tsx` | Page détail contrat BAMBOO |
| `BambooContratForm.tsx` | Ancien formulaire (legacy) |
| `BambooContratPrint.tsx` | **Template impression** - Format A4 officiel |

---

### 📂 features/contrats/cofidec/

Contrats COFIDEC (emf_id = 2).

| Fichier | Rôle |
|---------|------|
| `CofidecContractsList.tsx` | Liste des contrats COFIDEC |
| `CofidecContractCreateOfficial.tsx` | Formulaire création avec taux appliqué |
| `CofidecContractCreate.tsx` | Ancien formulaire |
| `CofidecContratDetailPage.tsx` | Page détail contrat |
| `CofidecContratForm.tsx` | Ancien formulaire |
| `CofidecContratPrint.tsx` | Template impression |
| `CofidecContratPrintPage.tsx` | Page wrapper impression |

---

### 📂 features/contrats/bceg/

Contrats BCEG (emf_id = 3) - **Le plus complet avec 4 types**.

| Fichier | Rôle |
|---------|------|
| `BcegContractsList.tsx` | Liste tous types BCEG |
| `BcegContractCreateOfficial.tsx` | Formulaire contrat standard |
| `BcegContractCreate.tsx` | Ancien formulaire |
| `BcegContratDetailPage.tsx` | Détail contrat standard |
| `BcegContratForm.tsx` | Ancien formulaire |
| `BcegContratPrint.tsx` | Impression standard |
| `BcegContratPrintPage.tsx` | Page wrapper |
| **Contrat Moto** | |
| `BcegMotoContractCreate.tsx` | Formulaire contrat Moto |
| `BcegMotoContratDetailPage.tsx` | Détail contrat Moto |
| `BcegMotoContratPrint.tsx` | Impression contrat Moto |
| **Contrat Taxi Perte Recette** | |
| `BcegTaxiPerteRecetteCreate.tsx` | Formulaire Taxi Perte Recette |
| `BcegTaxiPerteRecetteDetailPage.tsx` | Détail Taxi Perte Recette |
| `BcegTaxiPerteRecettePrint.tsx` | Impression Taxi Perte Recette |
| **Contrat Taxi Prévoyance Décès** | |
| `BcegTaxiPrevoyanceDecesCreate.tsx` | Formulaire Taxi Prévoyance Décès |
| `BcegTaxiPrevoyanceDecesDetailPage.tsx` | Détail Taxi Prévoyance Décès |
| `BcegTaxiPrevoyanceDecesPrint.tsx` | Impression Taxi Prévoyance Décès |
| `useBcegContracts.ts` | Hook local BCEG |

---

### 📂 features/contrats/edg/

Contrats EDG (emf_id = 4) - **3 types de contrats**.

| Fichier | Rôle |
|---------|------|
| `EdgContractsList.tsx` | Liste tous types EDG |
| `EdgContractCreateOfficial.tsx` | Formulaire contrat standard |
| `EdgContractTypeSelector.tsx` | **Sélecteur type** - Standard/Taxi Perte/Taxi Prévoyance |
| `EdgContractCreate.tsx` | Ancien formulaire |
| `EdgContratDetailPage.tsx` | Détail contrat standard |
| `EdgContratForm.tsx` | Ancien formulaire complexe |
| **Contrat Taxi Perte Recette** | |
| `EdgTaxiPerteRecetteCreate.tsx` | Formulaire Taxi Perte Recette |
| `EdgTaxiPerteRecetteDetailPage.tsx` | Détail Taxi Perte Recette |
| `EdgTaxiPerteRecettePrint.tsx` | Impression Taxi Perte Recette |
| **Contrat Taxi Prévoyance Décès** | |
| `EdgTaxiPrevoyanceDecesCreate.tsx` | Formulaire Taxi Prévoyance Décès |
| `EdgTaxiPrevoyanceDecesDetailPage.tsx` | Détail Taxi Prévoyance Décès |
| `EdgTaxiPrevoyanceDecesPrint.tsx` | Impression Taxi Prévoyance Décès |

---

### 📂 features/contrats/sodec/

Contrats SODEC (emf_id = 5) - **Options prévoyance A/B**.

| Fichier | Rôle |
|---------|------|
| `SodecContractsList.tsx` | Liste des contrats SODEC |
| `SodecContractCreateOfficial.tsx` | Formulaire avec options A/B et assurés associés |
| `SodecContractCreate.tsx` | Ancien formulaire |
| `SodecContratDetailPage.tsx` | Détail avec assurés associés |
| `SodecContratForm.tsx` | Ancien formulaire complexe |
| `SodecContratPrintPage.tsx` | Page impression |

---

### 📂 features/contrats/finam/

Contrats FINAM (emf_id = 6) - **Personnel + Retraités**.

| Fichier | Rôle |
|---------|------|
| `FinamContractsList.tsx` | Liste des contrats FINAM |
| `FinamContractCreateOfficial.tsx` | Formulaire avec catégories Personnel/Retraités |
| `FinamContratDetailPage.tsx` | Détail contrat FINAM |
| `FinamContratPrintPage.tsx` | Impression avec tarifs spéciaux |
| `index.ts` | Exports |

---

### 📂 features/contrats/cofiga/

Contrats COFIGA (emf_id = 7) - **Protection forfaitaire**.

| Fichier | Rôle |
|---------|------|
| `CofigaContractsList.tsx` | Liste des contrats COFIGA |
| `CofigaContractCreateOfficial.tsx` | Formulaire avec protection 250.000 FCFA |
| `CofigaContratDetailPage.tsx` | Détail contrat COFIGA |
| `CofigaContratPrintPage.tsx` | Impression avec protection forfaitaire |
| `index.ts` | Exports |

---

### 📂 features/contrats/agrpro/

Contrats AGR PRO (emf_id = 8) - **Prime unique**.

| Fichier | Rôle |
|---------|------|
| `AgrProContractsList.tsx` | Liste des contrats AGR PRO |
| `AgrProContractCreate.tsx` | Formulaire création |
| `AgrProContractDetailPage.tsx` | Détail contrat |
| `AgrProContractPrint.tsx` | Template impression détaillé |
| `AgrProContractPrintPage.tsx` | Page wrapper impression |
| `components/` | Composants spécifiques |
| `index.ts` | Exports |

---

### 📂 features/contrats/arianefinance/

Contrats ARIANE FINANCE (emf_id = 9).

| Fichier | Rôle |
|---------|------|
| `ArianeFinanceContractsList.tsx` | Liste des contrats |
| `ArianeFinanceContractCreateOfficial.tsx` | Formulaire création officiel |
| `ArianeFinanceContractCreate.tsx` | Ancien formulaire |
| `ArianeFinanceContratDetailPage.tsx` | Détail contrat |
| `ArianeFinanceContratPrint.tsx` | Template impression |
| `index.ts` | Exports |

---

## 📂 features/sinistres/

Module de gestion des sinistres.

| Fichier | Rôle |
|---------|------|
| `SinistreListPage.tsx` | **Liste générale** - Tous sinistres, filtres, statuts |
| `SinistreDeclarationForm.tsx` | **Formulaire déclaration** générique |
| `SinistreDetailPage.tsx` | Page détail (ancienne version) |
| `SinistreDetailPageV2.tsx` | **Page détail V2** - Avec quittances et délais |
| `SinistreTraitementPage.tsx` | **Page traitement admin** - Actions complètes (77KB!) |
| `index.ts` | Exports |

### Sous-dossiers par EMF

Chaque EMF a 3 fichiers :

| Structure | Rôle |
|-----------|------|
| `{Emf}SinistresList.tsx` | Liste sinistres de l'EMF |
| `{Emf}SinistreDeclarationForm.tsx` | Formulaire déclaration spécifique |
| `{Emf}SinistreDetailPage.tsx` | Page détail (si spécifique) |

**EMF couverts** :
- `bamboo/` - BAMBOO
- `cofidec/` - COFIDEC  
- `bceg/` - BCEG
- `edg/` - EDG
- `sodec/` - SODEC
- `cofiga/` - COFIGA
- `finam/` - FINAM
- `agrpro/` - AGR PRO
- `arianefinance/` - ARIANE FINANCE

---

## 📂 features/comptable/

Espace comptable.

| Fichier | Rôle |
|---------|------|
| `ComptableDashboard.tsx` | **Dashboard comptable** - Stats paiements, quittances urgentes |
| `QuittancesPage.tsx` | **Gestion quittances** - Validation, paiement |
| `HistoriquePaiementsPage.tsx` | **Historique** - Journal des paiements |
| `RapportFinancierPage.tsx` | **Rapports** - Export, statistiques |
| `index.ts` | Exports |

---

## 📂 features/fpdg/

Espace FPDG (Fondé de Pouvoir Délégué Général).

| Fichier | Rôle |
|---------|------|
| `FpdgDashboard.tsx` | **Dashboard exécutif** - Vue complète tous EMF (64KB!) |
| `FpdgStatistiquesPage.tsx` | Statistiques avancées, ratios S/P |
| `FpdgSinistresPage.tsx` | Liste sinistres avec actions FPDG |
| `FpdgValidationPage.tsx` | **Validation** - Sinistres à valider |
| `FpdgCloturePage.tsx` | **Clôture** - Sinistres à clôturer |
| `FpdgQuittancesPage.tsx` | **Quittances** - Toutes les quittances (53KB) |
| `FpdgHistoriquePage.tsx` | Historique des actions FPDG |
| `FpdgRapportsPage.tsx` | Génération de rapports |
| `index.ts` | Exports |

---

## 📂 features/exercices/

Gestion des exercices comptables.

| Fichier | Rôle |
|---------|------|
| `ExerciceDashboard.tsx` | **Dashboard exercices** - Liste, création, stats (45KB) |
| `ExerciceDetail.tsx` | **Détail exercice** - Rapport complet, production, sinistralité |
| `components/` | Composants (graphiques, tableaux) |

---

## 📂 features/emfs/

Gestion des EMF partenaires.

| Fichier | Rôle |
|---------|------|
| `EmfListPage.tsx` | Liste des EMF avec stats |
| `EmfDetailPage.tsx` | Détail EMF + statistiques |
| `EmfForm.tsx` | Formulaire création/édition EMF |

---

## 📂 features/users/

Gestion des utilisateurs.

| Fichier | Rôle |
|---------|------|
| `UserListPage.tsx` | Liste des utilisateurs |
| `UserDetailPage.tsx` | Détail utilisateur |
| `UserForm.tsx` | Formulaire création/édition |

---

## 📂 features/statistiques/

Module statistiques globales.

| Fichier | Rôle |
|---------|------|
| `StatistiquesPage.tsx` | Page statistiques avec graphiques |

---

## 📂 features/settings/

Paramètres de l'application.

| Fichier | Rôle |
|---------|------|
| `SettingsPage.tsx` | Page de paramètres |

---

## 📂 features/quittances/

Module quittances (partagé).

| Fichier | Rôle |
|---------|------|
| `QuittancesListPage.tsx` | Liste des quittances |

---

## 📊 RÉSUMÉ STATISTIQUES

| Catégorie | Nombre |
|-----------|--------|
| **Fichiers TypeScript/TSX** | ~150+ |
| **Composants UI** | 13 |
| **Layouts** | 7 |
| **Hooks** | 51 |
| **Services** | 8 |
| **Types** | 22 |
| **Pages Features** | 80+ |
| **Templates CSV** | 10 |
| **EMF Supportés** | 9 |
| **Types de Contrats** | 14 (standard + spéciaux) |

---

*Documentation générée le 14 janvier 2026*
