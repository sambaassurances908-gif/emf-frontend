// src/features/fpdg/FpdgSinistresPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  AlertTriangle, 
  Eye,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { sinistreService } from '@/services/sinistre.service';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUT_COLORS: Record<string, string> = {
  'declare': 'bg-blue-100 text-blue-700',
  'en_cours': 'bg-amber-100 text-amber-700',
  'valide': 'bg-emerald-100 text-emerald-700',
  'paye': 'bg-green-100 text-green-700',
  'rejete': 'bg-red-100 text-red-700',
  'clos': 'bg-gray-100 text-gray-700',
};

const STATUT_LABELS: Record<string, string> = {
  'declare': 'Déclaré',
  'en_cours': 'En cours',
  'valide': 'Validé',
  'paye': 'Payé',
  'rejete': 'Rejeté',
  'clos': 'Clôturé',
};

export const FpdgSinistresPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [emfFilter, setEmfFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fpdg-sinistres', page, search, statutFilter, emfFilter],
    queryFn: async () => {
      const params: any = { page, per_page: 15 };
      if (search) params.search = search;
      if (statutFilter) params.statut = statutFilter;
      if (emfFilter) params.emf_id = emfFilter;
      return sinistreService.getAll(params);
    },
  });

  const sinistres = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Tous les Sinistres
          </h1>
          <p className="text-gray-600">Supervision complète des sinistres</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher par référence, assuré..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white min-w-[150px]"
          >
            <option value="">Tous les statuts</option>
            <option value="declare">Déclaré</option>
            <option value="en_cours">En cours</option>
            <option value="valide">Validé</option>
            <option value="paye">Payé</option>
            <option value="clos">Clôturé</option>
          </select>
          <select
            value={emfFilter}
            onChange={(e) => setEmfFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white min-w-[150px]"
          >
            <option value="">Tous les EMF</option>
            <option value="1">BAMBOO</option>
            <option value="2">COFIDEC</option>
            <option value="3">BCEG</option>
            <option value="4">EDG</option>
            <option value="5">SODEC</option>
          </select>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-sm text-amber-600 font-medium">En cours</p>
          <p className="text-2xl font-bold text-gray-900">{sinistres.filter((s: any) => s.statut === 'en_cours').length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Déclarés</p>
          <p className="text-2xl font-bold text-gray-900">{sinistres.filter((s: any) => s.statut === 'declare').length}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium">Validés</p>
          <p className="text-2xl font-bold text-gray-900">{sinistres.filter((s: any) => s.statut === 'valide').length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Clôturés</p>
          <p className="text-2xl font-bold text-gray-900">{sinistres.filter((s: any) => s.statut === 'clos').length}</p>
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : sinistres.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          title="Aucun sinistre"
          description="Aucun sinistre ne correspond à vos critères"
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Référence</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">EMF</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Assuré</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sinistres.map((sinistre: any) => (
                  <tr key={sinistre.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-900">{sinistre.reference}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{sinistre.emf?.sigle || sinistre.contrat_type?.replace('Contrat', '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{sinistre.assure_nom || sinistre.contrat?.nom_complet || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{sinistre.type_sinistre}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {formatDate(sinistre.date_declaration || sinistre.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(sinistre.capital_restant_du || sinistre.montant_reclame || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[sinistre.statut] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUT_LABELS[sinistre.statut] || sinistre.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/sinistres/detail/${sinistre.id}`)}
                      >
                        <Eye size={16} className="mr-1" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Affichage {meta.from || 1} - {meta.to || sinistres.length} sur {meta.total || sinistres.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">Page {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (meta.last_page || 1)}
                  onClick={() => setPage(p => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FpdgSinistresPage;
