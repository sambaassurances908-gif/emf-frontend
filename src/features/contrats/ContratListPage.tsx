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
import { Plus, Search, Download, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { STATUTS_CONTRAT } from '@/lib/constants';
import { contratService } from '@/services/contrat.service';
import { Modal } from '@/components/ui/Modal';

interface Contrat {
  id: number;
  numero_police: string | null;
  nom_prenom: string;
  telephone_assure: string;
  montant_pret: string | number;
  duree_pret_mois: number;
  statut: string;
  date_effet: string;
  type_contrat: string;
  cotisation_totale_ttc?: number;
  prime_collectee?: number;
  // Champs supplémentaires pour calcul cotisation
  cotisation_deces_iad?: number;
  cotisation_prevoyance?: number;
  cotisation_perte_emploi?: number;
  prime_deces?: number;
  prime_iad?: number;
  prime_perte_emploi?: number;
  emf: {
    sigle: string;
  };
}

// On assouplit le type pour accepter les deux formats possibles
type ApiResponse = {
  success?: boolean;
  data?: Contrat[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
} | Contrat[]; // Cas où l'API renvoie directement le tableau

export const ContratListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [emfFilter, setEmfFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['contrats', { search, statutFilter, emfFilter, page }],
    queryFn: async () => {
      const response = await contratService.getAll({
        search,
        statut: statutFilter,
        emf_id: emfFilter,
        page,
      });
      // On retourne response.data qui peut être { data: [...], meta: ... } OU [...]
      return response.data;
    },
  });

  // Extraction robuste des données
  let contrats: Contrat[] = [];
  let meta = { from: 0, to: 0, total: 0, last_page: 1, current_page: 1, per_page: 15 };

  if (Array.isArray(data)) {
    // Cas où l'API renvoie directement le tableau (vos logs montrent ce cas parfois)
    contrats = data;
    meta.total = data.length;
    meta.to = data.length;
    meta.from = data.length > 0 ? 1 : 0;
  } else if (data?.data && Array.isArray(data.data)) {
    // Cas standard Laravel { data: [...], meta: ... }
    contrats = data.data;
    if (data.meta) {
      meta = data.meta;
    }
  }

  console.log('🔍 Data brute:', data);
  console.log('✅ Contrats extraits:', contrats);

  const handleCreateContrat = (type: string) => {
    setShowTypeModal(false);
    setTimeout(() => {
      navigate(`/contrats/nouveau/${type}`);
    }, 100);
  };

  // Fonction pour calculer/récupérer la cotisation d'un contrat
  const getCotisation = (contrat: Contrat): number | null => {
    // 1. Si cotisation_totale_ttc est disponible directement
    if (contrat.cotisation_totale_ttc && contrat.cotisation_totale_ttc > 0) {
      return contrat.cotisation_totale_ttc;
    }
    
    // 2. Si prime_collectee est disponible
    if (contrat.prime_collectee && contrat.prime_collectee > 0) {
      return contrat.prime_collectee;
    }
    
    // 3. Calculer à partir des composants si disponibles
    const cotisationDeces = contrat.cotisation_deces_iad || contrat.prime_deces || 0;
    const cotisationPrevoyance = contrat.cotisation_prevoyance || 0;
    const cotisationPerteEmploi = contrat.cotisation_perte_emploi || contrat.prime_perte_emploi || 0;
    const cotisationIad = contrat.prime_iad || 0;
    
    const total = cotisationDeces + cotisationPrevoyance + cotisationPerteEmploi + cotisationIad;
    
    if (total > 0) {
      return total;
    }
    
    // 4. Pas de cotisation disponible
    return null;
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      suspendu: 'bg-orange-100 text-orange-800',
      resilie: 'bg-red-100 text-red-800',
      termine: 'bg-gray-100 text-gray-800',
      en_attente: 'bg-yellow-100 text-yellow-800',
      sinistre: 'bg-purple-100 text-purple-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Une erreur est survenue lors du chargement des contrats.</p>
            <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contrats</h1>
          <p className="text-gray-600 mt-1">
            Gérez tous vos contrats d&apos;assurance
          </p>
        </div>
        <Button type="button" onClick={() => setShowTypeModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contrat
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro, client..."
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
              options={[
                { value: '', label: 'Tous les statuts' },
                ...STATUTS_CONTRAT,
              ]}
            />
            <Select
              placeholder="Toutes les EMF"
              value={emfFilter}
              onChange={(e) => setEmfFilter(e.target.value)}
              options={[
                { value: '', label: 'Toutes les EMF' },
                { value: 'bamboo', label: 'BAMBOO EMF' },
                { value: 'cofidec', label: 'COFIDEC' },
                { value: 'bceg', label: 'BCEG' },
                { value: 'edg', label: 'EDG' },
                { value: 'sodec', label: 'SODEC' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" text="Chargement des contrats..." />
            </div>
          ) : !contrats || contrats.length === 0 ? (
            <EmptyState
              title="Aucun contrat trouvé"
              description="Commencez par créer votre premier contrat ou modifiez vos filtres."
              action={
                <Button type="button" onClick={() => setShowTypeModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un contrat
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Police</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>EMF</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Cotisation</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date Effet</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contrats.map((contrat) => (
                    <TableRow key={`${contrat.type_contrat}-${contrat.id}`}>
                      <TableCell className="font-mono text-sm font-medium">
                        {contrat.numero_police || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{contrat.nom_prenom}</p>
                          <p className="text-xs text-gray-500">{contrat.telephone_assure}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                          {contrat.emf?.sigle || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {contrat.type_contrat}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatCurrency(Number(contrat.montant_pret))}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {(() => {
                          const cotisation = getCotisation(contrat);
                          if (cotisation !== null && cotisation > 0) {
                            return <span className="text-emerald-600">{formatCurrency(cotisation)}</span>;
                          }
                          return (
                            <span 
                              className="text-xs text-gray-400 hover:text-blue-500 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/contrats/${contrat.type_contrat.toLowerCase().replace(/\s+/g, '-')}/${contrat.id}`);
                              }}
                              title="Voir le détail pour la cotisation"
                            >
                              Voir détail →
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-gray-600">{contrat.duree_pret_mois} mois</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contrat.statut)}>
                          {contrat.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatDate(contrat.date_effet)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/contrats/${contrat.type_contrat.toLowerCase().replace(/\s+/g, '-')}/${contrat.id}`)}
                            title="Voir le détail"
                            className="p-2 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => console.log('Download PDF', contrat.id)}
                            title="Télécharger"
                            className="p-2 hover:bg-gray-100"
                          >
                            <Download className="h-4 w-4 text-gray-500 hover:text-green-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.total > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-600">
            Affichage de <span className="font-medium">{meta.from}</span> à <span className="font-medium">{meta.to}</span> sur <span className="font-medium">{meta.total}</span> contrats
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </Button>
            <span className="text-sm font-medium text-gray-900 px-3">
              Page {page} / {meta.last_page}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Modal de sélection du type de contrat */}
      <Modal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title="Choisir le type de contrat"
        size="md"
      >
        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto p-1">
          <button
            type="button"
            onClick={() => handleCreateContrat('bamboo')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
              BAMBOO EMF
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Contrat collectif de micro-assurance BAMBOO EMF
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleCreateContrat('cofidec')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
              COFIDEC
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Contrat prévoyance crédits COFIDEC
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleCreateContrat('bceg')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
              BCEG
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Contrat décès emprunteur & prévoyance BCEG
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleCreateContrat('edg')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-700">
              EDG
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Contrat prévoyance crédits EDG (Standard/VIP)
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleCreateContrat('sodec')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-red-700">
              SODEC
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Contrat prévoyance crédits SODEC (Option A/B)
            </p>
          </button>
        </div>
      </Modal>
    </div>
  );
};
