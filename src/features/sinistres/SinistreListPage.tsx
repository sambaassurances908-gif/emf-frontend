import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Search, Eye, Settings } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sinistre } from '@/types/sinistre.types';
import { sinistreService } from '@/services/sinistre.service';
import { useAuthStore } from '@/store/authStore';

// Configuration des EMFs avec leurs IDs
const EMF_CONFIG = [
  { id: null, key: 'all', label: 'Tous', color: 'bg-gray-600', ringColor: 'ring-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-600', icon: '📋', routePrefix: '' },
  { id: 1, key: 'bamboo', label: 'BAMBOO', color: 'bg-green-600', ringColor: 'ring-green-500', bgLight: 'bg-green-100', textColor: 'text-green-600', icon: '🎋', routePrefix: 'bamboo' },
  { id: 2, key: 'cofidec', label: 'COFIDEC', color: 'bg-blue-600', ringColor: 'ring-blue-500', bgLight: 'bg-blue-100', textColor: 'text-blue-600', icon: '🏦', routePrefix: 'cofidec' },
  { id: 3, key: 'bceg', label: 'BCEG', color: 'bg-purple-600', ringColor: 'ring-purple-500', bgLight: 'bg-purple-100', textColor: 'text-purple-600', icon: '🏢', routePrefix: 'bceg' },
  { id: 4, key: 'edg', label: 'EDG', color: 'bg-orange-600', ringColor: 'ring-orange-500', bgLight: 'bg-orange-100', textColor: 'text-orange-600', icon: '⚡', routePrefix: 'edg' },
  { id: 5, key: 'sodec', label: 'SODEC', color: 'bg-red-600', ringColor: 'ring-red-500', bgLight: 'bg-red-100', textColor: 'text-red-600', icon: '🔴', routePrefix: 'sodec' },
] as const;

const STATUTS_SINISTRE = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_instruction', label: 'En instruction' },
  { value: 'en_reglement', label: 'En règlement' },
  { value: 'en_paiement', label: 'En paiement' },
  { value: 'paye', label: 'Payé' },
  { value: 'rejete', label: 'Rejeté' },
  { value: 'cloture', label: 'Clôturé' },
];

const TYPES_SINISTRE = [
  { value: '', label: 'Tous les types' },
  { value: 'deces', label: 'Décès' },
  { value: 'iad', label: 'Invalidité Absolue Définitive' },
  { value: 'perte_emploi', label: 'Perte d\'emploi' },
  { value: 'perte_activite', label: 'Perte d\'activité' },
];

export const SinistreListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEmfId, setSelectedEmfId] = useState<number | null>(null);
  
  // Vérification des droits admin
  const { isAdmin } = useAuthStore();
  const isAdminUser = isAdmin();

  // Récupérer tous les sinistres (une seule requête)
  const { data: allSinistresData, isLoading } = useQuery({
    queryKey: ['all-sinistres', statutFilter],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        statut: statutFilter || undefined,
        per_page: 500, // Récupérer tous les sinistres
      });
      return response;
    },
  });

  const allSinistres = useMemo(() => {
    return Array.isArray(allSinistresData?.data) ? allSinistresData.data : [];
  }, [allSinistresData]);

  // Statistiques par EMF basées sur emf_id
  const emfStats = useMemo(() => {
    const stats: Record<number, { total: number; montant: number }> = {};
    
    // Initialiser les stats pour chaque EMF
    EMF_CONFIG.filter(e => e.id !== null).forEach(emf => {
      stats[emf.id!] = { total: 0, montant: 0 };
    });

    // Calculer les stats à partir des données
    allSinistres.forEach((sinistre: Sinistre) => {
      const emfId = sinistre.emf_id || sinistre.contrat?.emf_id;
      if (emfId && stats[emfId]) {
        stats[emfId].total++;
        stats[emfId].montant += sinistre.montant_reclame || 0;
      }
    });

    return stats;
  }, [allSinistres]);

  const totalSinistres = allSinistres.length;
  const totalMontant = allSinistres.reduce((acc: number, s: Sinistre) => acc + (s.montant_reclame || 0), 0);

  // Sinistres filtrés selon l'EMF sélectionné et les filtres de recherche
  const filteredSinistres = useMemo(() => {
    let sinistres = [...allSinistres];
    
    // Filtre par EMF
    if (selectedEmfId !== null) {
      sinistres = sinistres.filter((s: Sinistre) => {
        const emfId = s.emf_id || s.contrat?.emf_id;
        return emfId === selectedEmfId;
      });
    }

    // Filtre par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      sinistres = sinistres.filter((s: Sinistre) =>
        s.numero_sinistre?.toLowerCase().includes(searchLower) ||
        s.numero_police?.toLowerCase().includes(searchLower) ||
        s.nom_assure?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par type de sinistre
    if (typeFilter) {
      sinistres = sinistres.filter((s: Sinistre) => s.type_sinistre === typeFilter);
    }

    return sinistres;
  }, [selectedEmfId, allSinistres, search, typeFilter]);

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_cours: 'bg-yellow-100 text-yellow-800',
      en_instruction: 'bg-blue-100 text-blue-800',
      en_reglement: 'bg-indigo-100 text-indigo-800',
      en_paiement: 'bg-purple-100 text-purple-800',
      paye: 'bg-emerald-100 text-emerald-800',
      rejete: 'bg-red-100 text-red-800',
      cloture: 'bg-gray-100 text-gray-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      en_cours: 'En cours',
      en_instruction: 'En instruction',
      en_reglement: 'En règlement',
      en_paiement: 'En paiement',
      paye: 'Payé',
      rejete: 'Rejeté',
      cloture: 'Clôturé',
    };
    return labels[statut] || statut;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      deces: 'bg-black text-white',
      iad: 'bg-orange-100 text-orange-800',
      perte_emploi: 'bg-indigo-100 text-indigo-800',
      perte_activite: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deces: 'Décès',
      iad: 'IAD',
      perte_emploi: 'Perte emploi',
      perte_activite: 'Perte activité',
    };
    return labels[type] || type;
  };

  // Trouver la config EMF par ID
  const getEmfConfig = (emfId: number | null | undefined) => {
    return EMF_CONFIG.find(e => e.id === emfId) || EMF_CONFIG[0];
  };

  const selectedEmfConfig = EMF_CONFIG.find(e => e.id === selectedEmfId) || EMF_CONFIG[0];

  const handleSinistreClick = (sinistre: Sinistre) => {
    const emfId = sinistre.emf_id || sinistre.contrat?.emf_id;
    const emfConfig = getEmfConfig(emfId);
    // Navigation vers la page de détail appropriée selon l'EMF
    navigate(`/sinistres/${emfConfig.routePrefix || 'detail'}/${sinistre.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sinistres</h1>
          <p className="text-gray-600 mt-1">
            Gestion des déclarations de sinistres par EMF
          </p>
        </div>
        <Button onClick={() => navigate('/sinistres/nouveau')}>
          <Plus className="h-4 w-4 mr-2" />
          Déclarer un Sinistre
        </Button>
      </div>

      {/* Stats Cards par EMF */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {EMF_CONFIG.map((emf) => {
          const stats = emf.id === null 
            ? { total: totalSinistres, montant: totalMontant }
            : emfStats[emf.id] || { total: 0, montant: 0 };
          
          const isSelected = selectedEmfId === emf.id;
          
          return (
            <Card 
              key={emf.key}
              className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? `ring-2 ${emf.ringColor} shadow-lg` : ''}`}
              onClick={() => setSelectedEmfId(emf.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${emf.bgLight} rounded-xl flex items-center justify-center`}>
                    <span className="text-lg">{emf.icon}</span>
                  </div>
                  <div>
                    <p className={`text-xs ${emf.textColor} font-medium`}>{emf.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">{formatCurrency(stats.montant)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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

      {/* Selected EMF indicator */}
      {selectedEmfId !== null && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtre actif:</span>
          <Badge className={`${selectedEmfConfig.bgLight} ${selectedEmfConfig.textColor}`}>
            {selectedEmfConfig.label}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedEmfId(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            × Effacer
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" text="Chargement des sinistres..." />
            </div>
          ) : filteredSinistres.length === 0 ? (
            <EmptyState
              title="Aucun sinistre trouvé"
              description={selectedEmfId !== null 
                ? `Aucun sinistre ${selectedEmfConfig.label} ne correspond à vos critères`
                : "Aucun sinistre ne correspond à vos critères de recherche"
              }
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
                  <TableHead>EMF</TableHead>
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
                {filteredSinistres.map((sinistre: Sinistre) => {
                  const emfId = sinistre.emf_id || sinistre.contrat?.emf_id;
                  const emfConfig = getEmfConfig(emfId);
                  return (
                    <TableRow key={sinistre.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge className={`${emfConfig.bgLight} ${emfConfig.textColor}`}>
                          {emfConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">
                        {sinistre.numero_sinistre}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {sinistre.numero_police}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(sinistre.type_sinistre)}>
                          {getTypeLabel(sinistre.type_sinistre)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sinistre.nom_assure}</p>
                          <p className="text-sm text-gray-500">{sinistre.telephone_assure}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(sinistre.date_sinistre)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(sinistre.montant_reclame || sinistre.capital_restant_du)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(sinistre.statut)}>
                          {getStatusLabel(sinistre.statut)}
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
                          variant={isAdminUser ? "default" : "ghost"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSinistreClick(sinistre);
                          }}
                          title={isAdminUser ? "Traiter le sinistre" : "Voir les détails"}
                        >
                          {isAdminUser ? (
                            <Settings className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {filteredSinistres.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            {filteredSinistres.length} sinistre{filteredSinistres.length > 1 ? 's' : ''} affiché{filteredSinistres.length > 1 ? 's' : ''}
            {selectedEmfId !== null && ` pour ${selectedEmfConfig.label}`}
          </p>
          <p className="font-medium">
            Total réclamé: {formatCurrency(filteredSinistres.reduce((acc: number, s: Sinistre) => acc + (s.montant_reclame || 0), 0))}
          </p>
        </div>
      )}
    </div>
  );
};
