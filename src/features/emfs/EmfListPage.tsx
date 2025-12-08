import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Search, Eye, Edit, Building2, TrendingUp } from 'lucide-react';
import { emfService } from '@/services/emf.service';
import { Emf } from '@/types/emf.types';

const TYPES_EMF = [
  { value: '', label: 'Tous les types' },
  { value: 'emf', label: 'EMF' },
  { value: 'banque', label: 'Banque' },
];

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'suspendu', label: 'Suspendu' },
];

interface EmfWithCount extends Emf {
  contrats_count?: number;
}

export const EmfListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'emf' | 'banque'>('');
  const [statutFilter, setStatutFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['emfs', { search, typeFilter, statutFilter, page }],
    queryFn: async () => {
      return await emfService.getAll({
        search,
        type: typeFilter || undefined,
        statut: statutFilter,
        page,
      });
    },
  });

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      suspendu: 'bg-orange-100 text-orange-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    return type === 'emf' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EMFs & Banques</h1>
          <p className="text-gray-600 mt-1">
            Gestion des établissements de microfinance et banques partenaires
          </p>
        </div>
        <Button onClick={() => navigate('/emfs/nouveau')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Partenaire
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Partenaires</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data?.meta?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">EMFs</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {data?.stats?.total_emfs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Banques</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {data?.stats?.total_banques || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {data?.stats?.total_actifs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, sigle, ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              placeholder="Tous les types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as '' | 'emf' | 'banque')}
              options={TYPES_EMF}
            />
            <Select
              placeholder="Tous les statuts"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              options={STATUTS}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" text="Chargement des partenaires..." />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              title="Aucun partenaire trouvé"
              description="Commencez par ajouter un EMF ou une banque"
              action={
                <Button onClick={() => navigate('/emfs/nouveau')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un partenaire
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sigle</TableHead>
                  <TableHead>Raison Sociale</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Contrats</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((emf: EmfWithCount) => (
                  <TableRow key={emf.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-semibold">{emf.sigle}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{emf.raison_sociale}</p>
                        <p className="text-sm text-gray-500">{emf.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(emf.type)}>
                        {emf.type === 'emf' ? 'EMF' : 'Banque'}
                      </Badge>
                    </TableCell>
                    <TableCell>{emf.ville}</TableCell>
                    <TableCell>{emf.telephone}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{emf.contrats_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatutColor(emf.statut)}>
                        {emf.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/emfs/${emf.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/emfs/${emf.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Affichage de {data.meta.from} à {data.meta.to} sur {data.meta.total} partenaires
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} sur {data.meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.meta.last_page}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
