import { useState, useCallback, useEffect } from 'react';
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
import { Plus, Search, Eye, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { sinistreService } from '@/services/sinistre.service';
import { Sinistre } from '@/types/sinistre.types';

const STATUTS_SINISTRE = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'valide', label: 'Validé' },
  { value: 'rejete', label: 'Rejeté' },
  { value: 'paye', label: 'Payé' },
  { value: 'cloture', label: 'Clôturé' },
];

const TYPES_SINISTRE = [
  { value: '', label: 'Tous les types' },
  { value: 'deces', label: 'Décès' },
  { value: 'iad', label: 'Invalidité Absolue Définitive' },
  { value: 'maladie', label: 'Maladie' },
  { value: 'perte_emploi', label: 'Perte d\'emploi' },
  { value: 'prevoyance', label: 'Prévoyance' },
];

export const SinistreListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // ✅ DEBOUNCE pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset à la page 1 lors du changement de filtre
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, statutFilter, typeFilter]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sinistres', { search, statutFilter, typeFilter, page }],
    queryFn: async () => {
      return await sinistreService.getAll({
        search,
        statut: statutFilter,
        type_sinistre: typeFilter,
        page,
      });
    },
  });

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['sinistres-stats'],
    queryFn: async () => {
      return await sinistreService.getStats().catch(() => null); // ✅ Ignore les erreurs stats
    },
    retry: false,
  });

  // ✅ PROTECTION CONTRE data.data undefined/non-array
  const sinistres = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};
  const stats = statsResponse?.data || {};

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      valide: 'bg-green-100 text-green-800',
      rejete: 'bg-red-100 text-red-800',
      paye: 'bg-purple-100 text-purple-800',
      cloture: 'bg-gray-100 text-gray-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      deces: 'bg-black text-white',
      iad: 'bg-orange-100 text-orange-800',
      maladie: 'bg-pink-100 text-pink-800',
      perte_emploi: 'bg-indigo-100 text-indigo-800',
      prevoyance: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sinistres</h1>
          <p className="text-gray-600 mt-1">
            Gestion des déclarations de sinistres
          </p>
        </div>
        <Button onClick={() => navigate('/sinistres/nouveau')}>
          <Plus className="h-4 w-4 mr-2" />
          Déclarer un Sinistre
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {stats.en_attente || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.en_cours || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant réclamé</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.montant_total_reclame || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant payé</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {formatCurrency(stats.montant_total_paye || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro, police, assuré..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              placeholder="Tous les statuts"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              options={STATUTS_SINISTRE}
            />
            <Select
              placeholder="Tous les types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={TYPES_SINISTRE}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" text="Chargement des sinistres..." />
            </div>
          ) : isError ? (
            <div className="py-12">
              <EmptyState
                title="Erreur de chargement"
                description={`Impossible de charger les sinistres: ${error?.message || 'Erreur inconnue'}`}
                action={
                  <Button onClick={() => window.location.reload()}>
                    Réessayer
                  </Button>
                }
              />
            </div>
          ) : sinistres.length === 0 ? (
            <EmptyState
              title="Aucun sinistre trouvé"
              description="Aucun sinistre ne correspond à vos critères de recherche"
              action={
                <Button onClick={() => navigate('/sinistres/nouveau')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Déclarer un sinistre
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Sinistre</TableHead>
                  <TableHead>N° Police</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assuré</TableHead>
                  <TableHead>Date Survenance</TableHead>
                  <TableHead>Montant Réclamé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Délai</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sinistres.map((sinistre: Sinistre) => (
                  <TableRow key={sinistre.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm font-semibold">
                      {sinistre.numero_sinistre}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sinistre.numero_police}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(sinistre.type_sinistre)}>
                        {sinistre.type_sinistre}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sinistre.nom_assure}</p>
                        <p className="text-sm text-gray-500">{sinistre.telephone_assure}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(sinistre.date_survenance)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(sinistre.montant_reclame)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sinistre.statut)}>
                        {sinistre.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sinistre.delai_traitement_jours !== undefined && sinistre.delai_traitement_jours !== null ? (
                        <span className={`text-sm ${
                          sinistre.delai_traitement_jours > 15 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {sinistre.delai_traitement_jours}j
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sinistres/${sinistre.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.last_page && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Affichage de {meta.from || 0} à {meta.to || 0} sur {meta.total || 0} sinistres
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} sur {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.last_page || isLoading}
              onClick={() => handlePageChange(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
