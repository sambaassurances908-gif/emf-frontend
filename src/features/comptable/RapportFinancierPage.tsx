// src/features/comptable/RapportFinancierPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Download,
  TrendingUp,
  Building2,
  PieChart,
  BarChart3,
  Wallet,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { comptableService } from '@/services/comptable.service';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const EMF_OPTIONS = [
  { value: '', label: 'Tous les EMFs' },
  { value: '1', label: 'BAMBOO' },
  { value: '2', label: 'COFIDEC' },
  { value: '3', label: 'BCEG' },
  { value: '4', label: 'EDG' },
  { value: '5', label: 'SODEC' },
];

const TYPE_QUITTANCE_LABELS: Record<string, string> = {
  capital_sans_interets: 'Capital sans intérêts',
  capital_restant_du: 'Capital restant dû',
  capital_prevoyance: 'Capital prévoyance',
  indemnite_journaliere: 'Indemnité journalière',
  frais_medicaux: 'Frais médicaux',
};

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  virement: 'Virement',
  cheque: 'Chèque',
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
};

// Date par défaut: premier jour du mois en cours
const getDefaultDates = () => {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    debut: debut.toISOString().split('T')[0],
    fin: fin.toISOString().split('T')[0],
  };
};

export const RapportFinancierPage = () => {
  const { user } = useAuthStore();
  const defaultDates = getDefaultDates();
  
  const [selectedEmfId, setSelectedEmfId] = useState('');
  const [dateDebut, setDateDebut] = useState(defaultDates.debut);
  const [dateFin, setDateFin] = useState(defaultDates.fin);

  const userEmfId = user?.emf_id;
  const effectiveEmfId = userEmfId || (selectedEmfId ? Number(selectedEmfId) : undefined);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['comptable', 'rapport', effectiveEmfId, dateDebut, dateFin],
    queryFn: () => comptableService.getRapportFinancier({
      emf_id: effectiveEmfId,
      date_debut: dateDebut,
      date_fin: dateFin,
      grouper_par: 'mois',
    }),
    enabled: !!dateDebut && !!dateFin,
  });

  const rapport = data?.data;

  const handleExport = async () => {
    try {
      await comptableService.downloadExport({
        emf_id: effectiveEmfId,
        date_debut: dateDebut,
        date_fin: dateFin,
        format: 'csv',
      });
      toast.success('Rapport exporté avec succès');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  // Calcul du pourcentage pour les barres de progression
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapport Financier</h1>
          <p className="text-gray-600 mt-1">
            Analyse détaillée des paiements par période
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download size={16} className="mr-2" />
          Exporter le rapport
        </Button>
      </div>

      {/* Filtres de période */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            {!userEmfId && (
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">EMF</label>
                <Select
                  value={selectedEmfId}
                  onChange={(e) => setSelectedEmfId(e.target.value)}
                  options={EMF_OPTIONS}
                />
              </div>
            )}
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date début</label>
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !rapport ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Aucune donnée"
          description="Sélectionnez une période pour générer le rapport"
        />
      ) : (
        <>
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Wallet className="text-emerald-600" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant total payé</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(rapport.resume?.montant_total || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="text-blue-600" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre de paiements</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rapport.resume?.total_paiements || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sinistres réglés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rapport.resume?.nombre_sinistres_regles || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails par EMF */}
          {rapport.par_emf && rapport.par_emf.length > 0 && (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={18} />
                  Répartition par EMF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rapport.par_emf.map((emf) => (
                    <div key={emf.emf_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{emf.emf_sigle}</Badge>
                          <span className="text-sm text-gray-600">{emf.emf_nom}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(emf.montant_total)}</p>
                          <p className="text-xs text-gray-500">
                            {emf.nombre_paiements} paiement(s)
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${getPercentage(emf.montant_total, rapport.resume?.montant_total || 1)}%` 
                          }}
                        />
                      </div>
                      {emf.montant_en_attente > 0 && (
                        <p className="text-xs text-yellow-600">
                          {formatCurrency(emf.montant_en_attente)} en attente 
                          ({emf.quittances_en_attente} quittance(s))
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Par type de quittance */}
            {rapport.par_type_quittance && rapport.par_type_quittance.length > 0 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={18} />
                    Par type de quittance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rapport.par_type_quittance.map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">
                            {TYPE_QUITTANCE_LABELS[item.type] || item.type}
                          </p>
                          <p className="text-xs text-gray-500">{item.nombre} paiement(s)</p>
                        </div>
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(item.montant)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Par mode de paiement */}
            {rapport.par_mode_paiement && rapport.par_mode_paiement.length > 0 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet size={18} />
                    Par mode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rapport.par_mode_paiement.map((item) => (
                      <div key={item.mode} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">
                            {MODE_PAIEMENT_LABELS[item.mode] || item.mode}
                          </p>
                          <p className="text-xs text-gray-500">{item.nombre} paiement(s)</p>
                        </div>
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(item.montant)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RapportFinancierPage;
