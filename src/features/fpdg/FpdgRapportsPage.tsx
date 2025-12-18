// src/features/fpdg/FpdgRapportsPage.tsx

import { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  FileText,
  Printer,
  Mail,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDate, cn } from '@/lib/utils';
import { sinistreService } from '@/services/sinistre.service';
import { SinistreStatut } from '@/types/sinistre.types';
import toast from 'react-hot-toast';

interface RapportConfig {
  id: string;
  titre: string;
  description: string;
  icon: typeof FileText;
  color: string;
  formats: string[];
  parametres: {
    dateDebut?: boolean;
    dateFin?: boolean;
    emf?: boolean;
    statut?: boolean;
  };
}

const RAPPORTS_DISPONIBLES: RapportConfig[] = [
  {
    id: 'sinistres',
    titre: 'Rapport Sinistres',
    description: 'Liste complète des sinistres avec statuts et montants',
    icon: AlertCircle,
    color: 'text-red-600 bg-red-100',
    formats: ['pdf', 'excel', 'csv'],
    parametres: { dateDebut: true, dateFin: true, emf: true, statut: true },
  },
  {
    id: 'quittances',
    titre: 'Rapport Quittances',
    description: 'Synthèse des quittances validées et payées',
    icon: FileText,
    color: 'text-blue-600 bg-blue-100',
    formats: ['pdf', 'excel'],
    parametres: { dateDebut: true, dateFin: true, emf: true },
  },
  {
    id: 'performance',
    titre: 'Rapport Performance EMF',
    description: 'Analyse de performance par EMF partenaire',
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-100',
    formats: ['pdf', 'excel'],
    parametres: { dateDebut: true, dateFin: true },
  },
  {
    id: 'cotisations',
    titre: 'Rapport Cotisations',
    description: 'État des cotisations collectées par période',
    icon: DollarSign,
    color: 'text-amber-600 bg-amber-100',
    formats: ['pdf', 'excel', 'csv'],
    parametres: { dateDebut: true, dateFin: true, emf: true },
  },
  {
    id: 'contrats',
    titre: 'Rapport Contrats Actifs',
    description: 'Liste des contrats en cours par EMF',
    icon: Users,
    color: 'text-purple-600 bg-purple-100',
    formats: ['pdf', 'excel', 'csv'],
    parametres: { emf: true },
  },
  {
    id: 'clotures',
    titre: 'Rapport Clôtures',
    description: 'Historique des sinistres clôturés',
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-100',
    formats: ['pdf', 'excel'],
    parametres: { dateDebut: true, dateFin: true },
  },
];

interface RapportGenere {
  id: number;
  type: string;
  titre: string;
  format: string;
  statut: 'en_cours' | 'termine' | 'erreur';
  url?: string;
  created_at: string;
  user_name: string;
}

export const FpdgRapportsPage = () => {
  const [selectedRapport, setSelectedRapport] = useState<RapportConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rapportsGeneres, setRapportsGeneres] = useState<RapportGenere[]>([]);
  const [params, setParams] = useState({
    dateDebut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    emf: '',
    statut: '',
    format: 'pdf',
  });



  // Générer le CSV des sinistres
  const generateSinistresCsv = (sinistres: any[]) => {
    const headers = [
      'Référence',
      'Type',
      'Assuré',
      'EMF',
      'Date Sinistre',
      'Date Déclaration',
      'Statut',
      'Montant Indemnisation',
      'Montant Payé'
    ];
    
    const rows = sinistres.map(s => [
      s.numero_sinistre || '',
      s.type_sinistre || '',
      s.nom_assure || s.contrat?.nom_prenom || '',
      s.contrat?.emf?.sigle || '',
      s.date_sinistre || '',
      s.date_declaration || '',
      s.statut || '',
      s.montant_indemnisation?.toString() || '0',
      s.montant_paye?.toString() || '0'
    ]);
    
    return [headers, ...rows].map(row => row.join(';')).join('\n');
  };

  const handleGenerate = async () => {
    if (!selectedRapport) return;
    
    setIsGenerating(true);
    
    try {
      // Récupérer les données
      const response = await sinistreService.getAll({
        date_debut: params.dateDebut || undefined,
        date_fin: params.dateFin || undefined,
        emf_id: params.emf ? Number(params.emf) : undefined,
        statut: (params.statut || undefined) as SinistreStatut | undefined,
        per_page: 1000,
      });
      
      const sinistres = response.data || [];
      
      if (params.format === 'csv') {
        // Générer CSV côté client
        const csv = generateSinistresCsv(sinistres);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-${selectedRapport.id}-${params.dateDebut}-${params.dateFin}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        // Ajouter à l'historique local
        const newRapport: RapportGenere = {
          id: Date.now(),
          type: selectedRapport.id,
          titre: `${selectedRapport.titre} - ${formatDate(params.dateDebut)} au ${formatDate(params.dateFin)}`,
          format: 'csv',
          statut: 'termine',
          created_at: new Date().toISOString(),
          user_name: 'FPDG User',
        };
        setRapportsGeneres(prev => [newRapport, ...prev]);
        
        toast.success('Rapport CSV téléchargé avec succès');
      } else if (params.format === 'excel') {
        // Pour Excel, on génère un CSV compatible
        const csv = generateSinistresCsv(sinistres);
        const blob = new Blob(['\ufeff' + csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-${selectedRapport.id}-${params.dateDebut}-${params.dateFin}.xls`;
        link.click();
        URL.revokeObjectURL(url);
        
        const newRapport: RapportGenere = {
          id: Date.now(),
          type: selectedRapport.id,
          titre: `${selectedRapport.titre} - ${formatDate(params.dateDebut)} au ${formatDate(params.dateFin)}`,
          format: 'excel',
          statut: 'termine',
          created_at: new Date().toISOString(),
          user_name: 'FPDG User',
        };
        setRapportsGeneres(prev => [newRapport, ...prev]);
        
        toast.success('Rapport Excel téléchargé avec succès');
      } else {
        // Pour PDF, afficher un message
        toast.error('Export PDF non disponible. Utilisez CSV ou Excel.');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  const openGenerateModal = (rapport: RapportConfig) => {
    setSelectedRapport(rapport);
    setParams(prev => ({
      ...prev,
      format: rapport.formats[0],
    }));
    setIsModalOpen(true);
  };

  // Supprimé: handleGenerate est maintenant au-dessus

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'termine':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <CheckCircle2 size={12} /> Terminé
          </span>
        );
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Clock size={12} className="animate-spin" /> En cours
          </span>
        );
      case 'erreur':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle size={12} /> Erreur
          </span>
        );
      default:
        return null;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'excel':
        return <FileSpreadsheet size={16} className="text-green-500" />;
      case 'csv':
        return <FileText size={16} className="text-gray-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="text-amber-500" />
            Rapports & Exports
          </h1>
          <p className="text-gray-600">Générez des rapports personnalisés</p>
        </div>
        <Button variant="outline" onClick={() => setRapportsGeneres([])} size="sm">
          <RefreshCw size={16} className="mr-2" />
          Effacer l'historique
        </Button>
      </div>

      {/* Rapports disponibles */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-6">Rapports disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RAPPORTS_DISPONIBLES.map((rapport) => {
            const Icon = rapport.icon;
            return (
              <div
                key={rapport.id}
                className="p-4 border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => openGenerateModal(rapport)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", rapport.color)}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {rapport.titre}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{rapport.description}</p>
                    <div className="flex gap-2 mt-3">
                      {rapport.formats.map(format => (
                        <span
                          key={format}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs uppercase"
                        >
                          {getFormatIcon(format)}
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">Actions rapides</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => openGenerateModal(RAPPORTS_DISPONIBLES[0])}
          >
            <Download size={16} className="mr-2" />
            Export Sinistres
          </Button>
          <Button 
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => openGenerateModal(RAPPORTS_DISPONIBLES[3])}
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Export Cotisations
          </Button>
          <Button 
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Printer size={16} className="mr-2" />
            Imprimer Synthèse
          </Button>
          <Button 
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Mail size={16} className="mr-2" />
            Envoyer par Email
          </Button>
        </div>
      </div>

      {/* Rapports récents */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Rapports générés récemment</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {rapportsGeneres?.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileBarChart className="mx-auto mb-4 text-gray-300" size={48} />
              <p>Aucun rapport généré</p>
              <p className="text-sm mt-1">Sélectionnez un type de rapport pour commencer</p>
            </div>
          ) : (
            rapportsGeneres?.map((rapport) => (
              <div key={rapport.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFormatIcon(rapport.format)}
                  <div>
                    <p className="font-medium text-gray-900">{rapport.titre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        <Calendar size={12} className="inline mr-1" />
                        {formatDate(rapport.created_at)}
                      </span>
                      <span className="text-xs text-gray-400">par {rapport.user_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(rapport.statut)}
                  {rapport.statut === 'termine' && rapport.url && (
                    <a href={rapport.url} download>
                      <Button variant="outline" size="sm">
                        <Download size={14} className="mr-1" />
                        Télécharger
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Génération */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Générer ${selectedRapport?.titre}`}
        size="md"
      >
        {selectedRapport && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">{selectedRapport.description}</p>

            {/* Paramètres */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {selectedRapport.parametres.dateDebut && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <Input
                    type="date"
                    value={params.dateDebut}
                    onChange={(e) => setParams(prev => ({ ...prev, dateDebut: e.target.value }))}
                  />
                </div>
              )}

              {selectedRapport.parametres.dateFin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin
                  </label>
                  <Input
                    type="date"
                    value={params.dateFin}
                    onChange={(e) => setParams(prev => ({ ...prev, dateFin: e.target.value }))}
                  />
                </div>
              )}

              {selectedRapport.parametres.emf && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EMF
                  </label>
                  <Select
                    value={params.emf}
                    onChange={(e) => setParams(prev => ({ ...prev, emf: e.target.value }))}
                    options={[
                      { value: '', label: 'Tous les EMF' },
                      { value: 'BAMBOO', label: 'BAMBOO' },
                      { value: 'COFIDEC', label: 'COFIDEC' },
                      { value: 'BCEG', label: 'BCEG' },
                      { value: 'EDG', label: 'EDG' },
                      { value: 'SODEC', label: 'SODEC' },
                    ]}
                  />
                </div>
              )}

              {selectedRapport.parametres.statut && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Select
                    value={params.statut}
                    onChange={(e) => setParams(prev => ({ ...prev, statut: e.target.value }))}
                    options={[
                      { value: '', label: 'Tous les statuts' },
                      { value: 'en_cours', label: 'En cours' },
                      { value: 'valide', label: 'Validé' },
                      { value: 'cloture', label: 'Clôturé' },
                    ]}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format d'export
                </label>
                <Select
                  value={params.format}
                  onChange={(e) => setParams(prev => ({ ...prev, format: e.target.value }))}
                  options={selectedRapport.formats.map(f => ({
                    value: f,
                    label: f.toUpperCase(),
                  }))}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Générer le rapport
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FpdgRapportsPage;
