import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardRedirect } from '@/components/routing/DashboardRedirect'

import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'

import { ContratListPage } from '@/features/contrats/ContratListPage'
import { ContratDetailPage } from '@/features/contrats/pages/ContratDetailPage'

// Anciennes pages de création par EMF
import { BambooContratForm } from '@/features/contrats/bamboo/BambooContratForm'
import { CofidecContratForm } from '@/features/contrats/cofidec/CofidecContratForm'
import { BcegContratForm } from '@/features/contrats/bceg/BcegContratForm'
import { EdgContratForm } from '@/features/contrats/edg/EdgContratForm'
import { SodecContratForm } from '@/features/contrats/sodec/SodecContratForm'

// ✅ Nouvelles pages de création par EMF (Import nommé)
import { BambooContractCreateOfficial } from '@/features/contrats/bamboo/BambooContractCreateOfficial'
import { SodecContractCreateOfficial } from '@/features/contrats/sodec/SodecContractCreateOfficial'
import { BcegContractCreateOfficial } from '@/features/contrats/bceg/BcegContractCreateOfficial'
import { BcegMotoContractCreate } from '@/features/contrats/bceg/BcegMotoContractCreate'
import { EdgContractCreateOfficial } from '@/features/contrats/edg/EdgContractCreateOfficial'
import { BcegMotoContratDetailPage } from '@/features/contrats/bceg/BcegMotoContratDetailPage'
import { BcegTaxiPerteRecetteCreate } from '@/features/contrats/bceg/BcegTaxiPerteRecetteCreate'
import { BcegTaxiPerteRecetteDetailPage } from '@/features/contrats/bceg/BcegTaxiPerteRecetteDetailPage'
import { BcegTaxiPrevoyanceDecesCreate } from '@/features/contrats/bceg/BcegTaxiPrevoyanceDecesCreate'
import { BcegTaxiPrevoyanceDecesDetailPage } from '@/features/contrats/bceg/BcegTaxiPrevoyanceDecesDetailPage'
import { EdgTaxiPerteRecetteCreate } from '@/features/contrats/edg/EdgTaxiPerteRecetteCreate'
import { EdgTaxiPerteRecetteDetailPage } from '@/features/contrats/edg/EdgTaxiPerteRecetteDetailPage'
import { EdgTaxiPrevoyanceDecesCreate } from '@/features/contrats/edg/EdgTaxiPrevoyanceDecesCreate'
import { EdgTaxiPrevoyanceDecesDetailPage } from '@/features/contrats/edg/EdgTaxiPrevoyanceDecesDetailPage'

import { SinistreListPage } from '@/features/sinistres/SinistreListPage'
import { SinistreDetailPageV2 } from '@/features/sinistres/SinistreDetailPageV2'
import { SinistreDeclarationForm } from '@/features/sinistres/SinistreDeclarationForm'
import { SinistreTraitementPage } from '@/features/sinistres/SinistreTraitementPage'

// ✅ Pages de déclaration de sinistre par EMF
import { BambooSinistreDeclarationForm } from '@/features/sinistres/bamboo/BambooSinistreDeclarationForm'
import { SodecSinistreDeclarationForm } from '@/features/sinistres/sodec/SodecSinistreDeclarationForm'
import { CofidecSinistreDeclarationForm } from '@/features/sinistres/cofidec/CofidecSinistreDeclarationForm'
import { BcegSinistreDeclarationForm } from '@/features/sinistres/bceg/BcegSinistreDeclarationForm'
import { EdgSinistreDeclarationForm } from '@/features/sinistres/edg/EdgSinistreDeclarationForm'
import { CofigaSinistreDeclarationForm } from '@/features/sinistres/cofiga/CofigaSinistreDeclarationForm'
import { FinamSinistreDeclarationForm } from '@/features/sinistres/finam/FinamSinistreDeclarationForm'

// ✅ Pages liste de sinistres par EMF
import { BambooSinistresList } from '@/features/sinistres/bamboo/BambooSinistresList'
import { CofidecSinistresList } from '@/features/sinistres/cofidec/CofidecSinistresList'
import { BcegSinistresList } from '@/features/sinistres/bceg/BcegSinistresList'
import { EdgSinistresList } from '@/features/sinistres/edg/EdgSinistresList'
import { SodecSinistresList } from '@/features/sinistres/sodec/SodecSinistresList'
import { CofigaSinistresList } from '@/features/sinistres/cofiga/CofigaSinistresList'
import { FinamSinistresList } from '@/features/sinistres/finam/FinamSinistresList'
import { AgrProSinistresList, AgrProSinistreDeclarationForm } from '@/features/sinistres/agrpro'
import { ArianeFinanceSinistresList, ArianeFinanceSinistreDeclarationForm } from '@/features/sinistres/arianefinance'

// ✅ Pages détail de sinistre par EMF
// Note: Utilisation de SinistreDetailPageV2 générique ou spécifique si nécessaire


import { EmfListPage } from '@/features/emfs/EmfListPage'
import { EmfDetailPage } from '@/features/emfs/EmfDetailPage'
import { EmfForm } from '@/features/emfs/EmfForm'

import { UserListPage } from '@/features/users/UserListPage'
import { UserDetailPage } from '@/features/users/UserDetailPage'
import { UserForm } from '@/features/users/UserForm'

import { StatistiquesPage } from '@/features/statistiques/StatistiquesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

import { BambooDashboard } from '@/features/contrats/pages/dashboard/BambooDashboard'
import { CofidecDashboard } from '@/features/contrats/pages/dashboard/CofidecDashboard'
import { BcegDashboard } from '@/features/contrats/pages/dashboard/BcegDashboard'
import { EdgDashboard } from '@/features/contrats/pages/dashboard/EdgDashboard'
import { SodecDashboard } from '@/features/contrats/pages/dashboard/SodecDashboard'
import { FinamDashboard } from '@/features/contrats/pages/dashboard/FinamDashboard'
import { CofigaDashboard } from '@/features/contrats/pages/dashboard/CofigaDashboard'
import { AgrProDashboard } from '@/features/contrats/pages/dashboard/AgrProDashboard'
import { ArianeFinanceDashboard } from '@/features/contrats/pages/dashboard/ArianeFinanceDashboard'

// ✅ Pages BAMBOO
import { BambooContractsList } from '@/features/contrats/bamboo/BambooContractsList'
import { BambooContratDetailPage } from '@/features/contrats/bamboo/BambooContratDetailPage'

// ✅ Pages SODEC
import { SodecContractsList } from '@/features/contrats/sodec/SodecContractsList'
import { SodecContratDetailPage } from '@/features/contrats/sodec/SodecContratDetailPage'
import { SodecContratPrintPage } from '@/features/contrats/sodec/SodecContratPrintPage'

// ✅ Pages COFIDEC
import { CofidecContractsList } from '@/features/contrats/cofidec/CofidecContractsList'
import { CofidecContratDetailPage } from '@/features/contrats/cofidec/CofidecContratDetailPage'
import { CofidecContractCreateOfficial } from '@/features/contrats/cofidec/CofidecContractCreateOfficial'
import { CofidecContratPrintPage } from '@/features/contrats/cofidec/CofidecContratPrintPage'

// ✅ Pages BCEG
import { BcegContractsList } from '@/features/contrats/bceg/BcegContractsList'
import { BcegContratDetailPage } from '@/features/contrats/bceg/BcegContratDetailPage'
import { BcegContratPrintPage } from '@/features/contrats/bceg/BcegContratPrintPage'

// ✅ Pages EDG
import { EdgContractsList } from '@/features/contrats/edg/EdgContractsList'
import { EdgContratDetailPage } from '@/features/contrats/edg/EdgContratDetailPage'
import { EdgContractTypeSelector } from '@/features/contrats/edg/EdgContractTypeSelector'

// ✅ Pages FINAM
import { FinamContractsList } from '@/features/contrats/finam/FinamContractsList'
import { FinamContratDetailPage } from '@/features/contrats/finam/FinamContratDetailPage'
import { FinamContractCreateOfficial } from '@/features/contrats/finam/FinamContractCreateOfficial'
import { FinamContratPrintPage } from '@/features/contrats/finam/FinamContratPrintPage'

// ✅ Pages COFIGA
import { CofigaContractsList } from '@/features/contrats/cofiga/CofigaContractsList'
import { CofigaContratDetailPage } from '@/features/contrats/cofiga/CofigaContratDetailPage'
import { CofigaContractCreateOfficial } from '@/features/contrats/cofiga/CofigaContractCreateOfficial'
import { CofigaContratPrintPage } from '@/features/contrats/cofiga/CofigaContratPrintPage'

// ✅ Pages AGR PRO
import { AgrProContractsList, AgrProContractCreate, AgrProContractDetailPage, AgrProContractPrintPage } from '@/features/contrats/agrpro'

// ✅ Pages ARIANE FINANCE
import { ArianeFinanceContractsList, ArianeFinanceContractCreateOfficial, ArianeFinanceContratDetailPage } from '@/features/contrats/arianefinance'

// ✅ Pages Comptable
import { ComptableDashboard, HistoriquePaiementsPage, RapportFinancierPage, QuittancesPage } from '@/features/comptable'
import { ComptableLayout } from '@/components/layout/ComptableLayout'

// ✅ Pages FPDG (Fondé de Pouvoir Délégué Général)
import {
  FpdgDashboard,
  FpdgSinistresPage,
  FpdgValidationPage,
  FpdgCloturePage,
  FpdgQuittancesPage,
  FpdgStatistiquesPage,
  FpdgHistoriquePage,
  FpdgRapportsPage
} from '@/features/fpdg'
import { FpdgLayout } from '@/components/layout/FpdgLayout'

// ✅ Pages Exercices
import { ExerciceDashboard } from '@/features/exercices/ExerciceDashboard'
import { ExerciceDetail } from '@/features/exercices/ExerciceDetail'

/**
 * Configuration du routeur de l'application SAMBA Assurances
 */
export const router = createBrowserRouter([
  // ========================================
  // ROUTE PUBLIQUE
  // ========================================
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ========================================
  // ROUTES PROTÉGÉES
  // ========================================
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Redirection racine vers le dashboard approprié selon l'EMF
      {
        index: true,
        element: <DashboardRedirect />,
      },

      // ========================================
      // DASHBOARDS
      // ========================================
      {
        path: 'dashboard',
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'bamboo', element: <BambooDashboard /> },
          { path: 'cofidec', element: <CofidecDashboard /> },
          { path: 'bceg', element: <BcegDashboard /> },
          { path: 'edg', element: <EdgDashboard /> },
          { path: 'sodec', element: <SodecDashboard /> },
          { path: 'finam', element: <FinamDashboard /> },
          { path: 'cofiga', element: <CofigaDashboard /> },
          { path: 'agrpro', element: <AgrProDashboard /> },
          { path: 'arianefinance', element: <ArianeFinanceDashboard /> },
        ],
      },

      // ========================================
      // PROFIL UTILISATEUR
      // ========================================
      {
        path: 'profile',
        element: <ProfilePage />,
      },

      // ========================================
      // EXERCICES
      // ========================================
      {
        path: 'exercices',
        children: [
          { index: true, element: <ExerciceDashboard /> },
          { path: ':id', element: <ExerciceDetail /> },
        ]
      },

      // ========================================
      // CONTRATS
      // ========================================
      {
        path: 'contrats',
        children: [
          // Liste générique de tous les contrats
          { index: true, element: <ContratListPage /> },

          // ✅ Listes dédiées par EMF
          { path: 'bamboo', element: <BambooContractsList /> },
          { path: 'sodec', element: <SodecContractsList /> },
          { path: 'cofidec', element: <CofidecContractsList /> },
          { path: 'bceg', element: <BcegContractsList /> },
          { path: 'edg', element: <EdgContractsList /> },
          { path: 'finam', element: <FinamContractsList /> },
          { path: 'cofiga', element: <CofigaContractsList /> },
          { path: 'agrpro', element: <AgrProContractsList /> },
          { path: 'ariane-finance', element: <ArianeFinanceContractsList /> },

          // ✅ Détails et impression AGR PRO
          { path: 'agrpro/:id', element: <AgrProContractDetailPage /> },
          { path: 'agrpro/:id/print', element: <AgrProContractPrintPage /> },

          // ✅ Détails et impression ARIANE FINANCE
          { path: 'ariane-finance/:id', element: <ArianeFinanceContratDetailPage /> },

          // ✅ Détails dédiés par EMF
          { path: 'bamboo/:id', element: <BambooContratDetailPage /> },
          { path: 'sodec/:id', element: <SodecContratDetailPage /> },
          { path: 'sodec/:id/print', element: <SodecContratPrintPage /> },
          { path: 'cofidec/:id', element: <CofidecContratDetailPage /> },
          { path: 'cofidec/:id/print', element: <CofidecContratPrintPage /> },
          { path: 'bceg/:id', element: <BcegContratDetailPage /> },
          { path: 'bceg/:id/print', element: <BcegContratPrintPage /> },
          { path: 'edg/:id', element: <EdgContratDetailPage /> },
          { path: 'finam/:id', element: <FinamContratDetailPage /> },
          { path: 'finam/:id/print', element: <FinamContratPrintPage /> },
          { path: 'cofiga/:id', element: <CofigaContratDetailPage /> },
          { path: 'cofiga/:id/print', element: <CofigaContratPrintPage /> },
          { path: 'bceg-moto/:id', element: <BcegMotoContratDetailPage /> },
          { path: 'bceg-moto/:id/edit', element: <BcegMotoContractCreate /> },

          { path: 'bceg-taxi-perte-recette/:id', element: <BcegTaxiPerteRecetteDetailPage /> },
          { path: 'bceg-taxi-perte-recette/:id/edit', element: <BcegTaxiPerteRecetteCreate /> },

          { path: 'bceg-taxi-prevoyance-deces/:id', element: <BcegTaxiPrevoyanceDecesDetailPage /> },
          { path: 'bceg-taxi-prevoyance-deces/:id/edit', element: <BcegTaxiPrevoyanceDecesCreate /> },

          { path: 'edg-taxi-perte-recette/:id', element: <EdgTaxiPerteRecetteDetailPage /> },
          { path: 'edg-taxi-perte-recette/:id/edit', element: <EdgTaxiPerteRecetteCreate /> },

          { path: 'edg-taxi-prevoyance-deces/:id', element: <EdgTaxiPrevoyanceDecesDetailPage /> },
          { path: 'edg-taxi-prevoyance-deces/:id/edit', element: <EdgTaxiPrevoyanceDecesCreate /> },
          { path: 'edg/:id/edit', element: <EdgContractCreateOfficial /> },

          // Détail générique d'un contrat (fallback)
          { path: ':id', element: <ContratDetailPage /> },

          // Création de contrats par EMF
          {
            path: 'nouveau',
            children: [
              // Anciennes pages (toujours accessibles)
              { path: 'bamboo-old', element: <BambooContratForm /> },
              { path: 'cofidec-old', element: <CofidecContratForm /> },
              { path: 'bceg-old', element: <BcegContratForm /> },
              { path: 'edg-old', element: <EdgContratForm /> },
              { path: 'sodec-old', element: <SodecContratForm /> },

              // ✅ Nouvelles pages de création (PRINCIPALES)
              { path: 'bamboo', element: <BambooContractCreateOfficial /> },
              { path: 'sodec', element: <SodecContractCreateOfficial /> },
              { path: 'cofidec', element: <CofidecContractCreateOfficial /> },
              { path: 'bceg', element: <BcegContractCreateOfficial /> },
              { path: 'bceg-moto', element: <BcegMotoContractCreate /> },
              { path: 'bceg-taxi-perte-recette', element: <BcegTaxiPerteRecetteCreate /> },
              { path: 'bceg-taxi-prevoyance-deces', element: <BcegTaxiPrevoyanceDecesCreate /> },
              { path: 'edg-taxi-perte-recette', element: <EdgTaxiPerteRecetteCreate /> },
              { path: 'edg-taxi-prevoyance-deces', element: <EdgTaxiPrevoyanceDecesCreate /> },
              { path: 'edg-standard', element: <EdgContractCreateOfficial /> },
              { path: 'edg', element: <EdgContractTypeSelector /> },
              { path: 'finam', element: <FinamContractCreateOfficial /> },
              { path: 'cofiga', element: <CofigaContractCreateOfficial /> },
              { path: 'agrpro', element: <AgrProContractCreate /> },
              { path: 'ariane-finance', element: <ArianeFinanceContractCreateOfficial /> },
            ],
          },
        ],
      },

      // ========================================
      // SINISTRES
      // ========================================
      {
        path: 'sinistres',
        children: [
          { index: true, element: <SinistreListPage /> },

          // ✅ Listes dédiées par EMF
          { path: 'bamboo', element: <BambooSinistresList /> },
          { path: 'cofidec', element: <CofidecSinistresList /> },
          { path: 'bceg', element: <BcegSinistresList /> },
          { path: 'edg', element: <EdgSinistresList /> },
          { path: 'sodec', element: <SodecSinistresList /> },
          { path: 'cofiga', element: <CofigaSinistresList /> },
          { path: 'finam', element: <FinamSinistresList /> },
          { path: 'agrpro', element: <AgrProSinistresList /> },
          { path: 'ariane-finance', element: <ArianeFinanceSinistresList /> },

          // Déclaration générique (fallback)
          { path: 'nouveau', element: <SinistreDeclarationForm /> },

          // ✅ Déclarations dédiées par EMF
          { path: 'nouveau/bamboo', element: <BambooSinistreDeclarationForm /> },
          { path: 'nouveau/sodec', element: <SodecSinistreDeclarationForm /> },
          { path: 'nouveau/cofidec', element: <CofidecSinistreDeclarationForm /> },
          { path: 'nouveau/bceg', element: <BcegSinistreDeclarationForm /> },
          { path: 'nouveau/edg', element: <EdgSinistreDeclarationForm /> },
          { path: 'nouveau/cofiga', element: <CofigaSinistreDeclarationForm /> },
          { path: 'nouveau/finam', element: <FinamSinistreDeclarationForm /> },
          { path: 'nouveau/agrpro', element: <AgrProSinistreDeclarationForm /> },
          { path: 'nouveau/ariane-finance', element: <ArianeFinanceSinistreDeclarationForm /> },

          // ✅ Page de traitement admin (route principale)
          { path: 'traitement/:id', element: <SinistreTraitementPage /> },

          // ✅ Page de détail V2 avec quittances et délais (route dédiée)
          { path: 'detail/:id', element: <SinistreDetailPageV2 /> },

          // ✅ Traitement par EMF (avec contexte EMF)
          { path: 'bamboo/:id', element: <SinistreDetailPageV2 /> },
          { path: 'cofidec/:id', element: <SinistreDetailPageV2 /> },
          { path: 'bceg/:id', element: <SinistreDetailPageV2 /> },
          { path: 'edg/:id', element: <SinistreDetailPageV2 /> },
          { path: 'sodec/:id', element: <SinistreDetailPageV2 /> },
          { path: 'cofiga/:id', element: <SinistreDetailPageV2 /> },
          { path: 'finam/:id', element: <SinistreDetailPageV2 /> },
          { path: 'agrpro/:id', element: <SinistreDetailPageV2 /> },
          { path: 'ariane-finance/:id', element: <SinistreDetailPageV2 /> },

          // Détail générique d'un sinistre (V2 avec quittances)
          { path: ':id', element: <SinistreDetailPageV2 /> },
        ],
      },

      // ========================================
      // EMF (Réservé aux administrateurs)
      // ========================================
      {
        path: 'emfs',
        children: [
          { index: true, element: <EmfListPage /> },
          { path: 'nouveau', element: <EmfForm /> },
          { path: ':id', element: <EmfDetailPage /> },
          { path: ':id/edit', element: <EmfForm /> },
        ],
      },

      // ========================================
      // UTILISATEURS (Réservé aux administrateurs)
      // ========================================
      {
        path: 'users',
        children: [
          { index: true, element: <UserListPage /> },
          { path: 'nouveau', element: <UserForm /> },
          { path: ':id', element: <UserDetailPage /> },
          { path: ':id/edit', element: <UserForm /> },
        ],
      },

      // ========================================
      // STATISTIQUES
      // ========================================
      {
        path: 'statistiques',
        element: <StatistiquesPage />,
      },

      // ========================================
      // ESPACE COMPTABLE - Déplacé vers layout dédié
      // ========================================

      // ========================================
      // PARAMÈTRES
      // ========================================
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // ========================================
  // ESPACE COMPTABLE (Layout dédié, réservé aux comptables)
  // ========================================
  {
    path: '/comptable',
    element: (
      <ProtectedRoute>
        <ComptableLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ComptableDashboard /> },
      { path: 'quittances', element: <QuittancesPage /> },
      { path: 'historique', element: <HistoriquePaiementsPage /> },
      { path: 'rapport', element: <RapportFinancierPage /> },
    ],
  },

  // ========================================
  // ESPACE FPDG (Fondé de Pouvoir Délégué Général)
  // Super-utilisateur: validation, paiement, clôture
  // ========================================
  {
    path: '/fpdg',
    element: (
      <ProtectedRoute>
        <FpdgLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <FpdgDashboard /> },
      { path: 'statistiques', element: <FpdgStatistiquesPage /> },
      { path: 'sinistres', element: <FpdgSinistresPage /> },
      { path: 'validation', element: <FpdgValidationPage /> },
      { path: 'cloture', element: <FpdgCloturePage /> },
      { path: 'quittances', element: <FpdgQuittancesPage /> },
      { path: 'historique', element: <FpdgHistoriquePage /> },
      { path: 'rapports', element: <FpdgRapportsPage /> },
    ],
  },

  // ========================================
  // 404 - PAGE NON TROUVÉE
  // ========================================
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
