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
