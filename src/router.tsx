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
import { BambooContractCreate } from '@/features/contrats/bamboo/BambooContractCreate'
import { BambooContractCreateOfficial } from '@/features/contrats/bamboo/BambooContractCreateOfficial'
import { SodecContractCreateOfficial } from '@/features/contrats/sodec/SodecContractCreateOfficial'
import { CofidecContractCreate } from '@/features/contrats/cofidec/CofidecContractCreate'
import { BcegContractCreate } from '@/features/contrats/bceg/BcegContractCreate'
import { BcegContractCreateOfficial } from '@/features/contrats/bceg/BcegContractCreateOfficial'
import { EdgContractCreate } from '@/features/contrats/edg/EdgContractCreate'
import { EdgContractCreateOfficial } from '@/features/contrats/edg/EdgContractCreateOfficial'

import { SinistreListPage } from '@/features/sinistres/SinistreListPage'
import { SinistreDetailPage } from '@/features/sinistres/SinistreDetailPage'
import { SinistreDeclarationForm } from '@/features/sinistres/SinistreDeclarationForm'

// ✅ Pages de déclaration de sinistre par EMF
import { BambooSinistreDeclarationForm } from '@/features/sinistres/bamboo/BambooSinistreDeclarationForm'
import { SodecSinistreDeclarationForm } from '@/features/sinistres/sodec/SodecSinistreDeclarationForm'
import { CofidecSinistreDeclarationForm } from '@/features/sinistres/cofidec/CofidecSinistreDeclarationForm'
import { BcegSinistreDeclarationForm } from '@/features/sinistres/bceg/BcegSinistreDeclarationForm'
import { EdgSinistreDeclarationForm } from '@/features/sinistres/edg/EdgSinistreDeclarationForm'

// ✅ Pages liste de sinistres par EMF
import { BambooSinistresList } from '@/features/sinistres/bamboo/BambooSinistresList'
import { CofidecSinistresList } from '@/features/sinistres/cofidec/CofidecSinistresList'
import { BcegSinistresList } from '@/features/sinistres/bceg/BcegSinistresList'
import { EdgSinistresList } from '@/features/sinistres/edg/EdgSinistresList'
import { SodecSinistresList } from '@/features/sinistres/sodec/SodecSinistresList'

// ✅ Pages détail de sinistre par EMF
import { BambooSinistreDetailPage } from '@/features/sinistres/bamboo/BambooSinistreDetailPage'
import { CofidecSinistreDetailPage } from '@/features/sinistres/cofidec/CofidecSinistreDetailPage'
import { BcegSinistreDetailPage } from '@/features/sinistres/bceg/BcegSinistreDetailPage'
import { EdgSinistreDetailPage } from '@/features/sinistres/edg/EdgSinistreDetailPage'
import { SodecSinistreDetailPage } from '@/features/sinistres/sodec/SodecSinistreDetailPage'

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

          // ✅ Détails dédiés par EMF
          { path: 'bamboo/:id', element: <BambooContratDetailPage /> },
          { path: 'sodec/:id', element: <SodecContratDetailPage /> },
          { path: 'sodec/:id/print', element: <SodecContratPrintPage /> },
          { path: 'cofidec/:id', element: <CofidecContratDetailPage /> },
          { path: 'cofidec/:id/print', element: <CofidecContratPrintPage /> },
          { path: 'bceg/:id', element: <BcegContratDetailPage /> },
          { path: 'bceg/:id/print', element: <BcegContratPrintPage /> },
          { path: 'edg/:id', element: <EdgContratDetailPage /> },

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
              { path: 'edg', element: <EdgContractCreateOfficial /> },
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
          
          // Déclaration générique (fallback)
          { path: 'nouveau', element: <SinistreDeclarationForm /> },
          
          // ✅ Déclarations dédiées par EMF
          { path: 'nouveau/bamboo', element: <BambooSinistreDeclarationForm /> },
          { path: 'nouveau/sodec', element: <SodecSinistreDeclarationForm /> },
          { path: 'nouveau/cofidec', element: <CofidecSinistreDeclarationForm /> },
          { path: 'nouveau/bceg', element: <BcegSinistreDeclarationForm /> },
          { path: 'nouveau/edg', element: <EdgSinistreDeclarationForm /> },
          
          // ✅ Détails dédiés par EMF
          { path: 'bamboo/:id', element: <BambooSinistreDetailPage /> },
          { path: 'cofidec/:id', element: <CofidecSinistreDetailPage /> },
          { path: 'bceg/:id', element: <BcegSinistreDetailPage /> },
          { path: 'edg/:id', element: <EdgSinistreDetailPage /> },
          { path: 'sodec/:id', element: <SodecSinistreDetailPage /> },
          
          // Détail générique d'un sinistre (fallback)
          { path: ':id', element: <SinistreDetailPage /> },
        ],
      },

      // ========================================
      // EMF (Réservé aux administrateurs)
      // ========================================
      {
        path: 'emfs',
        element: (
          <ProtectedRoute requiredRole={['admin']}>
            <div />
          </ProtectedRoute>
        ),
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
        element: (
          <ProtectedRoute requiredRole={['admin']}>
            <div />
          </ProtectedRoute>
        ),
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
      // PARAMÈTRES
      // ========================================
      {
        path: 'settings',
        element: <SettingsPage />,
      },
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
