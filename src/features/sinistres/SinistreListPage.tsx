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
import { SinistreStatutBadge, TypeSinistreBadge, ArchiveBadge } from '@/components/sinistres';
import { Plus, Search, Eye, Settings, Archive, Filter, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sinistre, SinistreStatut } from '@/types/sinistre.types';
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
  const [showArchives, setShowArchives] = useState(false);
  
  // Vérification des droits admin
  const { isAdmin, peutCloturerSinistre } = useAuthStore();
  const isAdminUser = isAdmin();
  const canViewArchives = peutCloturerSinistre();

  // Récupérer tous les sinistres (une seule requête)
  const { data: allSinistresData, isLoading } = useQuery({
    queryKey: ['all-sinistres', statutFilter, showArchives],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        statut: statutFilter as SinistreStatut || undefined,
        inclure_archives: showArchives,
        per_page: 500, // Récupérer tous les sinistres
      });
      return response;
    },
  });

  // Récupérer les sinistres archivés séparément si demandé
  const { data: archivesData, isLoading: isLoadingArchives } = useQuery({
    queryKey: ['sinistres-archives'],
    queryFn: () => sinistreService.getArchives({ per_page: 100 }),
    enabled: showArchives && canViewArchives,
  });

  const allSinistres = useMemo(() => {
    let sinistres = Array.isArray(allSinistresData?.data) ? allSinistresData.data : [];
    
    // Ajouter les archives si activé
    if (showArchives && archivesData?.data) {
      const archiveIds = new Set(sinistres.filter((s: Sinistre) => s.est_archive).map((s: Sinistre) => s.id));
      const newArchives = (archivesData.data as Sinistre[]).filter((s: Sinistre) => !archiveIds.has(s.id));
      sinistres = [...sinistres, ...newArchives];
    }
    
    return sinistres;
  }, [allSinistresData, archivesData, showArchives]);

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
  const totalArchives = allSinistres.filter((s: Sinistre) => s.est_archive).length;

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

    // Filtre archives : si showArchives est false, exclure les archivés
    if (!showArchives) {
      sinistres = sinistres.filter((s: Sinistre) => !s.est_archive);
    }

    return sinistres;
  }, [selectedEmfId, allSinistres, search, typeFilter, showArchives]);

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
    // Navigation vers la page de détail V2 (avec quittances et délais)
    navigate(`/sinistres/${sinistre.id}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatutFilter('');
    setTypeFilter('');
    setSelectedEmfId(null);
    setShowArchives(false);
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
        <div className="flex items-center gap-3">
          {canViewArchives && (
            <Button 
              variant={showArchives ? "default" : "outline"}
              onClick={() => setShowArchives(!showArchives)}
              className={showArchives ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archives {totalArchives > 0 && `(${totalArchives})`}
            </Button>
          )}
          <Button onClick={() => navigate('/sinistres/nouveau')}>
            <Plus className="h-4 w-4 mr-2" />
            Déclarer un Sinistre
          </Button>
        </div>
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
      {(selectedEmfId !== null || showArchives || search || statutFilter || typeFilter) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filtres actifs:</span>
          {selectedEmfId !== null && (
            <Badge className={`${selectedEmfConfig.bgLight} ${selectedEmfConfig.textColor}`}>
              {selectedEmfConfig.label}
              <button onClick={() => setSelectedEmfId(null)} className="ml-1 hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          {showArchives && (
            <Badge className="bg-purple-100 text-purple-700">
              Archives inclus
              <button onClick={() => setShowArchives(false)} className="ml-1 hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          {statutFilter && (
            <Badge className="bg-gray-100 text-gray-700">
              Statut: {getStatusLabel(statutFilter)}
              <button onClick={() => setStatutFilter('')} className="ml-1 hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          {typeFilter && (
            <Badge className="bg-gray-100 text-gray-700">
              Type: {getTypeLabel(typeFilter)}
              <button onClick={() => setTypeFilter('')} className="ml-1 hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Effacer tout
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
                  const isArchived = sinistre.est_archive;
                  return (
                    <TableRow 
                      key={sinistre.id} 
                      className={`hover:bg-gray-50 ${isArchived ? 'bg-purple-50/30' : ''}`}
                    >
                      <TableCell>
                        <Badge className={`${emfConfig.bgLight} ${emfConfig.textColor}`}>
                          {emfConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          {sinistre.numero_sinistre}
                          {isArchived && (
                            <Archive size={14} className="text-purple-500" title="Archivé" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {sinistre.numero_police}
                      </TableCell>
                      <TableCell>
                        <TypeSinistreBadge type={sinistre.type_sinistre} size="sm" />
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
                        <SinistreStatutBadge statut={sinistre.statut} size="sm" />
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
                          variant={isAdminUser && !isArchived ? "default" : "ghost"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSinistreClick(sinistre);
                          }}
                          title={isArchived ? "Consulter l'archive" : (isAdminUser ? "Traiter le sinistre" : "Voir les détails")}
                        >
                          {isArchived ? (
                            <Archive className="h-4 w-4" />
                          ) : isAdminUser ? (
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
