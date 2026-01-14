# 🔧 DOCUMENTATION TECHNIQUE - SAMB'A Assurances Frontend

> Documentation destinée aux développeurs pour la maintenance et l'évolution de l'application.

---

## Table des Matières

1. [Installation et Configuration](#1-installation-et-configuration)
2. [Architecture Technique Détaillée](#2-architecture-technique-détaillée)
3. [Endpoints API Backend](#3-endpoints-api-backend)
4. [Patterns de Développement](#4-patterns-de-développement)
5. [Gestion des Formulaires](#5-gestion-des-formulaires)
6. [Système d'Import CSV](#6-système-dimport-csv)
7. [Gestion des Erreurs](#7-gestion-des-erreurs)
8. [Tests et Qualité](#8-tests-et-qualité)
9. [Déploiement](#9-déploiement)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Installation et Configuration

### 1.1 Prérequis

- **Node.js** : v18.x ou supérieur
- **npm** : v9.x ou supérieur
- **Backend Laravel** : API fonctionnelle sur `http://localhost:8000`

### 1.2 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd samba-assurance-frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

### 1.3 Variables d'Environnement

```env
# .env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=SAMB'A Assurances
VITE_APP_ENV=development
```

### 1.4 Configuration Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 2. Architecture Technique Détaillée

### 2.1 Flux de Données

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐ │
│  │  Components  │ ──▶ │    Hooks     │ ──▶ │      Services        │ │
│  │              │     │ (TanStack Q) │     │   (Axios + API)      │ │
│  └──────────────┘     └──────────────┘     └──────────┬───────────┘ │
│         ▲                    │                        │             │
│         │                    │                        │             │
│         │              ┌─────▼─────┐                  │             │
│         │              │   Store   │                  │             │
│         │              │ (Zustand) │                  │             │
│         │              └───────────┘                  │             │
│         │                                             │             │
│         └─────────────────────────────────────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │    BACKEND LARAVEL    │
                        │      /api/...         │
                        └───────────────────────┘
```

### 2.2 Structure des Features

Chaque module fonctionnel (feature) suit cette structure :

```
features/
└── contrats/
    ├── bamboo/
    │   ├── BambooContractsList.tsx      # Liste des contrats
    │   ├── BambooContractCreateOfficial.tsx  # Formulaire création
    │   ├── BambooContratDetailPage.tsx  # Page détail
    │   └── BambooContratPrintPage.tsx   # Page impression
    ├── pages/
    │   └── dashboard/
    │       └── BambooDashboard.tsx      # Dashboard EMF
    └── ContratListPage.tsx              # Liste générale
```

### 2.3 Conventions de Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| **Composants** | PascalCase | `BambooContractsList.tsx` |
| **Hooks** | camelCase avec préfixe `use` | `useBambooContracts.ts` |
| **Services** | camelCase avec suffixe `Service` | `contrat.service.ts` |
| **Types** | PascalCase | `BambooContrat` |
| **Constantes** | SCREAMING_SNAKE_CASE | `BAMBOO_CONSTANTS` |

---

## 3. Endpoints API Backend

### 3.1 Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/logout` | Déconnexion |
| `POST` | `/api/auth/refresh` | Rafraîchir token |
| `GET` | `/api/auth/me` | Utilisateur courant |
| `POST` | `/api/auth/forgot-password` | Mot de passe oublié |
| `POST` | `/api/auth/reset-password` | Réinitialisation |

### 3.2 Dashboard

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/dashboard/statistiques` | Stats globales |
| `GET` | `/api/dashboard/statistiques?annee=2026` | Stats par année |

### 3.3 Contrats par EMF

#### BAMBOO EMF
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/bamboo-emf/contrats` | Liste |
| `GET` | `/api/bamboo-emf/contrats/:id` | Détail |
| `POST` | `/api/bamboo-emf/contrats` | Création |
| `PUT` | `/api/bamboo-emf/contrats/:id` | Modification |
| `DELETE` | `/api/bamboo-emf/contrats/:id` | Suppression |
| `POST` | `/api/bamboo-emf/simuler-tarification` | Simulation |
| `GET` | `/api/bamboo-emf/statistiques` | Stats EMF |
| `POST` | `/api/bamboo-emf/import-universel` | Import CSV |

#### Autres EMF (même structure)
- `/api/cofidec/contrats/...`
- `/api/bceg/contrats/...`
- `/api/edg/contrats/...`
- `/api/sodec/contrats/...`
- `/api/finam/contrats/...`
- `/api/cofiga/contrats/...`
- `/api/agr-pro/contrats/...`
- `/api/ariane-finance/contrats/...`

### 3.4 Sinistres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/sinistres` | Liste avec pagination |
| `GET` | `/api/sinistres/:id` | Détail avec quittances |
| `POST` | `/api/sinistres` | Déclaration (multipart) |
| `PUT` | `/api/sinistres/:id` | Modification |
| `DELETE` | `/api/sinistres/:id` | Suppression |
| `GET` | `/api/sinistres/statistiques/global` | Statistiques |
| `POST` | `/api/sinistres/:id/cloturer` | Clôture |
| `GET` | `/api/sinistres/archives` | Sinistres archivés |

### 3.5 Quittances

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/sinistres/:id/quittances` | Liste quittances |
| `POST` | `/api/sinistres/:id/quittances` | Créer quittance |
| `POST` | `/api/sinistres/:id/quittances/generer` | Générer multiples |
| `POST` | `/api/sinistres/:id/quittances/:qid/valider` | Valider |
| `POST` | `/api/sinistres/:id/quittances/:qid/payer` | Payer |
| `POST` | `/api/sinistres/:id/quittances/:qid/annuler` | Annuler |
| `DELETE` | `/api/sinistres/:id/quittances/:qid` | Supprimer |

### 3.6 Documents Sinistres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/sinistres/:id/documents` | Liste documents |
| `POST` | `/api/sinistres/:id/documents` | Upload (multipart) |
| `GET` | `/api/sinistres/:id/documents/:type/telecharger` | Télécharger |
| `DELETE` | `/api/sinistres/:id/documents/:docId` | Supprimer |

### 3.7 Comptabilité

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/comptable/dashboard` | Dashboard comptable |
| `GET` | `/api/comptable/quittances-en-attente` | Quittances à payer |
| `GET` | `/api/comptable/historique-paiements` | Historique |
| `GET` | `/api/comptable/rapport-financier` | Rapport |

### 3.8 Exercices

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/exercices` | Liste exercices |
| `GET` | `/api/exercices/courant` | Exercice courant |
| `GET` | `/api/exercices/:id` | Détail exercice |
| `GET` | `/api/exercices/:id/rapport` | Rapport exercice |
| `POST` | `/api/exercices` | Créer exercice |
| `PUT` | `/api/exercices/:id/cloturer` | Clôturer |

### 3.9 EMF et Utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/emfs` | Liste EMF |
| `GET` | `/api/emfs/:id` | Détail EMF |
| `POST` | `/api/emfs` | Créer EMF |
| `PUT` | `/api/emfs/:id` | Modifier EMF |
| `GET` | `/api/users` | Liste utilisateurs |
| `POST` | `/api/users` | Créer utilisateur |

---

## 4. Patterns de Développement

### 4.1 Custom Hook avec TanStack Query

```typescript
// hooks/useBambooContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { BambooContrat, PaginatedResponse } from '@/types/bamboo';

interface UseContractsParams {
  search?: string;
  statut?: string;
  page?: number;
  per_page?: number;
}

// Hook de lecture
export function useBambooContracts(params?: UseContractsParams) {
  return useQuery({
    queryKey: ['bamboo-contrats', params],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: PaginatedResponse<BambooContrat> }>(
        '/bamboo-emf/contrats',
        { params }
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de création
export function useCreateBambooContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<BambooContrat>) => {
      const response = await api.post('/bamboo-emf/contrats', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalider le cache pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['bamboo-contrats'] });
    },
    onError: (error: any) => {
      console.error('Erreur création:', error.response?.data?.message);
    },
  });
}

// Hook de mise à jour
export function useUpdateBambooContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BambooContrat> }) => {
      const response = await api.put(`/bamboo-emf/contrats/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bamboo-contrats'] });
      queryClient.invalidateQueries({ queryKey: ['bamboo-contrat', variables.id] });
    },
  });
}
```

### 4.2 Composant de Formulaire avec React Hook Form

```typescript
// components/forms/ContratForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

// Schéma de validation Zod
const contratSchema = z.object({
  nom_prenom: z.string().min(2, 'Nom requis'),
  telephone_assure: z.string().regex(/^6[0-9]{8}$/, 'Numéro invalide'),
  montant_pret_assure: z.number().min(100000, 'Montant minimum 100.000 FCFA'),
  duree_pret_mois: z.number().min(1).max(60),
  date_effet: z.string().min(1, 'Date requise'),
  categorie: z.enum(['commercants', 'salaries_public', 'salaries_prive', 'autre']),
});

type ContratFormData = z.infer<typeof contratSchema>;

export function ContratForm({ onSubmit, defaultValues }: {
  onSubmit: (data: ContratFormData) => Promise<void>;
  defaultValues?: Partial<ContratFormData>;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContratFormData>({
    resolver: zodResolver(contratSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nom et Prénom"
        {...register('nom_prenom')}
        error={errors.nom_prenom?.message}
      />

      <Input
        label="Téléphone"
        {...register('telephone_assure')}
        error={errors.telephone_assure?.message}
      />

      <Input
        label="Montant du prêt (FCFA)"
        type="number"
        {...register('montant_pret_assure', { valueAsNumber: true })}
        error={errors.montant_pret_assure?.message}
      />

      <Controller
        name="categorie"
        control={control}
        render={({ field }) => (
          <Select
            label="Catégorie"
            {...field}
            options={[
              { value: 'commercants', label: 'Commerçants' },
              { value: 'salaries_public', label: 'Salariés du public' },
              { value: 'salaries_prive', label: 'Salariés du privé' },
              { value: 'autre', label: 'Autre' },
            ]}
            error={errors.categorie?.message}
          />
        )}
      />

      <Button type="submit" isLoading={isSubmitting}>
        Enregistrer le contrat
      </Button>
    </form>
  );
}
```

### 4.3 Composant de Tableau avec TanStack Table

```typescript
// components/tables/ContratTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { BambooContrat } from '@/types/bamboo';
import { formatCurrency, formatDate } from '@/lib/utils';

const columns: ColumnDef<BambooContrat>[] = [
  {
    accessorKey: 'numero_police',
    header: 'N° Police',
  },
  {
    accessorKey: 'nom_prenom',
    header: 'Assuré',
  },
  {
    accessorKey: 'montant_pret_assure',
    header: 'Montant',
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: 'date_effet',
    header: 'Date d\'effet',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'statut',
    header: 'Statut',
    cell: ({ getValue }) => (
      <Badge variant={getValue() === 'actif' ? 'success' : 'warning'}>
        {getValue() as string}
      </Badge>
    ),
  },
];

export function ContratTable({ data }: { data: BambooContrat[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
        </span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
```

### 4.4 Utilitaires Courants

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Fusion classes TailwindCSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatage monétaire FCFA
export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' FCFA';
}

// Formatage court pour les graphiques
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Md`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return String(amount);
}

// Formatage date
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '-';
  }
}

// Formatage date longue
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMMM yyyy', { locale: fr });
  } catch {
    return '-';
  }
}

// Nombre sécurisé (évite NaN)
export function safeNumber(value: any, fallback = 0): number {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) || !isFinite(num) ? fallback : num;
}
```

---

## 5. Gestion des Formulaires

### 5.1 Structure de Formulaire de Création

```typescript
// Exemple: BambooContractCreateOfficial.tsx

// 1. Imports
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateBambooContract, useUpdateBambooContract, useBambooContratDetail } from '@/hooks/useBambooContracts';
import { toast } from 'react-hot-toast';

// 2. Composant
export function BambooContractCreateOfficial() {
  const navigate = useNavigate();
  const { id } = useParams(); // Si édition
  const isEditMode = Boolean(id);

  // 3. Données existantes (mode édition)
  const { data: existingContract } = useBambooContratDetail(
    id ? parseInt(id) : undefined
  );

  // 4. État du formulaire
  const [formData, setFormData] = useState({
    nom_prenom: '',
    telephone_assure: '',
    montant_pret_assure: 0,
    duree_pret_mois: 12,
    date_effet: new Date().toISOString().split('T')[0],
    // ...
  });

  // 5. Pré-remplissage en mode édition
  useEffect(() => {
    if (existingContract) {
      setFormData({
        nom_prenom: existingContract.nom_prenom || '',
        // ...
      });
    }
  }, [existingContract]);

  // 6. Mutations
  const createMutation = useCreateBambooContract();
  const updateMutation = useUpdateBambooContract();

  // 7. Calculs automatiques
  const cotisation = useMemo(() => {
    const taux = 0.015; // 1.5%
    return formData.montant_pret_assure * taux * (formData.duree_pret_mois / 12);
  }, [formData.montant_pret_assure, formData.duree_pret_mois]);

  // 8. Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      emf_id: 1, // BAMBOO
      cotisation_totale_ttc: cotisation,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: parseInt(id!), data: payload });
        toast.success('Contrat modifié avec succès');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Contrat créé avec succès');
      }
      navigate('/contrats/bamboo');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  // 9. Rendu
  return (
    <form onSubmit={handleSubmit}>
      {/* Champs du formulaire */}
    </form>
  );
}
```

### 5.2 Validation avec Zod

```typescript
// types/validation.ts
import { z } from 'zod';

export const contratBambooSchema = z.object({
  nom_prenom: z.string()
    .min(2, 'Nom trop court')
    .max(100, 'Nom trop long'),
  
  telephone_assure: z.string()
    .regex(/^6[0-9]{8}$/, 'Numéro invalide (format: 6XXXXXXXX)'),
  
  email_assure: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  
  montant_pret_assure: z.number()
    .min(100000, 'Montant minimum: 100.000 FCFA')
    .max(50000000, 'Montant maximum: 50.000.000 FCFA'),
  
  duree_pret_mois: z.number()
    .min(1, 'Durée minimum: 1 mois')
    .max(60, 'Durée maximum: 60 mois'),
  
  date_effet: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date invalide'),
  
  categorie: z.enum([
    'commercants',
    'salaries_public',
    'salaries_prive',
    'retraites',
    'autre'
  ], {
    errorMap: () => ({ message: 'Catégorie invalide' }),
  }),
  
  garantie_deces_iad: z.boolean().default(true),
  garantie_perte_emploi: z.boolean().default(false),
});

export type ContratBambooFormData = z.infer<typeof contratBambooSchema>;
```

---

## 6. Système d'Import CSV

### 6.1 Modal d'Import

Le composant `ImportContratModal` gère l'import massif de contrats via CSV.

```typescript
// components/modals/ImportContratModal.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

interface ImportResult {
  success: boolean;
  message: string;
  importes: number;
  erreurs: Array<{ ligne: number; erreur: string }>;
  ignores: number;
}

export function ImportContratModal({ 
  emf, 
  isOpen, 
  onClose 
}: {
  emf: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<ImportResult>(
        `/${emf}/import-universel`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`${emf}-contrats`] });
      toast.success(`${result.importes} contrats importés`);
      if (result.erreurs.length > 0) {
        toast.warning(`${result.erreurs.length} erreurs`);
      }
      onClose();
    },
  });

  const handleImport = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    importMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import CSV">
      {/* Template téléchargeable */}
      <a 
        href={`/templates/template_import_${emf}.csv`}
        download
        className="text-blue-600 hover:underline"
      >
        Télécharger le template
      </a>

      {/* Zone d'upload */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Bouton import */}
      <Button
        onClick={handleImport}
        isLoading={importMutation.isPending}
        disabled={!file}
      >
        Importer
      </Button>

      {/* Affichage erreurs */}
      {importMutation.data?.erreurs.map((err, i) => (
        <div key={i} className="text-red-500 text-sm">
          Ligne {err.ligne}: {err.erreur}
        </div>
      ))}
    </Modal>
  );
}
```

### 6.2 Normalisation des Données (Backend)

Le backend Laravel effectue la normalisation automatique :

```php
// Exemple de normalisation
class CsvImportService {
    
    // Normalisation des dates multi-format
    public function normalizeDate($value) {
        $formats = ['d/m/Y', 'Y-m-d', 'd-m-Y', 'j/n/Y'];
        foreach ($formats as $format) {
            try {
                return Carbon::createFromFormat($format, $value)->format('Y-m-d');
            } catch (\Exception $e) {
                continue;
            }
        }
        return null;
    }
    
    // Normalisation des montants
    public function normalizeAmount($value) {
        // Supprimer espaces, symboles monétaires
        $clean = preg_replace('/[^\d.,]/', '', $value);
        // Gérer virgule/point décimal
        $clean = str_replace(',', '.', $clean);
        return floatval($clean);
    }
    
    // Normalisation booléens
    public function normalizeBoolean($value) {
        $truthy = ['oui', 'yes', '1', 'true', 'o', 'y'];
        return in_array(strtolower(trim($value)), $truthy);
    }
}
```

---

## 7. Gestion des Erreurs

### 7.1 Intercepteur Axios

```typescript
// lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercepteur requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Erreur 401 = token expiré
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Erreur 403 = accès interdit
    if (error.response?.status === 403) {
      toast.error('Accès non autorisé');
    }
    
    // Erreur 422 = validation
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg: string) => {
          toast.error(msg);
        });
      }
    }
    
    // Erreur 500 = serveur
    if (error.response?.status >= 500) {
      toast.error('Erreur serveur, veuillez réessayer');
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 7.2 Gestion Erreurs dans les Composants

```typescript
// Pattern de gestion d'erreur dans un composant
function ContratsList() {
  const { data, isLoading, isError, error, refetch } = useBambooContracts();

  if (isLoading) {
    return <LoadingSpinner text="Chargement des contrats..." />;
  }

  if (isError) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-xl">
        <h3 className="text-red-600 font-bold">Erreur de chargement</h3>
        <p className="text-red-500 text-sm">
          {error?.message || 'Impossible de charger les données'}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <ContratTable data={data?.data || []} />
  );
}
```

---

## 8. Tests et Qualité

### 8.1 ESLint Configuration

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
```

### 8.2 TypeScript Strict

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 9. Déploiement

### 9.1 Build de Production

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers statiques
```

### 9.2 Configuration Nginx

```nginx
server {
    listen 80;
    server_name samba-assurance.example.com;
    root /var/www/samba-assurance-frontend/dist;
    index index.html;

    # Redirection SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API vers backend Laravel
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 9.3 Variables d'Environnement Production

```env
VITE_API_URL=https://api.samba-assurance.example.com/api
VITE_APP_NAME=SAMB'A Assurances
VITE_APP_ENV=production
```

---

## 10. Troubleshooting

### 10.1 Problèmes Courants

| Problème | Cause | Solution |
|----------|-------|----------|
| **401 Unauthorized** | Token expiré | Reconnecter l'utilisateur |
| **CORS error** | API non configurée | Vérifier config Laravel CORS |
| **NaN dans les graphiques** | Données nulles | Utiliser `safeNumber()` |
| **Dates incorrectes** | Formats différents | Utiliser `date-fns` avec `parseISO` |
| **Import CSV échoue** | Encodage UTF-8 | Convertir le fichier en UTF-8 |

### 10.2 Debug TanStack Query

```typescript
// main.tsx - Activer les DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 10.3 Logs Console

Le code inclut des logs de debug avec émojis pour faciliter le troubleshooting :

```typescript
console.log('🔐 Envoi requête login');
console.log('📦 Réponse complète:', response);
console.log('✅ Format détecté:', format);
console.error('❌ Erreur:', error);
```

---

## Appendice: Schéma de la Base de Données

Les principales tables backend :

```
┌─────────────────┐     ┌─────────────────┐
│      emfs       │     │     users       │
├─────────────────┤     ├─────────────────┤
│ id              │◄───►│ emf_id          │
│ sigle           │     │ role            │
│ raison_sociale  │     │ email           │
└─────────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────┐
│            contrat_*_emf                │
│   (bamboo_emf, cofidec, bceg, etc.)     │
├─────────────────────────────────────────┤
│ id                                      │
│ emf_id                                  │
│ numero_police                           │
│ nom_prenom                              │
│ montant_pret_assure                     │
│ ...                                     │
└─────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│    sinistres    │     │   quittances    │
├─────────────────┤     ├─────────────────┤
│ id              │◄───►│ sinistre_id     │
│ contrat_type    │     │ type            │
│ contrat_id      │     │ montant         │
│ type_sinistre   │     │ statut          │
│ statut          │     │ beneficiaire    │
└─────────────────┘     └─────────────────┘
```

---

*Documentation technique générée le 14 janvier 2026*  
*Version 1.0.0*
