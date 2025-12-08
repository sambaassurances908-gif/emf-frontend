import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Save, Search, AlertCircle } from 'lucide-react';
import { sinistreService } from '@/services/sinistre.service';
import { contratService } from '@/services/contrat.service';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

const sinistreSchema = z.object({
  numero_police: z.string().min(1, 'Numéro de police requis'),
  type_sinistre: z.enum(['deces', 'iad', 'maladie', 'perte_emploi', 'prevoyance']),
  date_survenance: z.string().min(1, 'Date de survenance requise'),
  date_declaration: z.string().min(1, 'Date de déclaration requise'),
  montant_reclame: z.string().min(1, 'Montant réclamé requis'),
  description: z.string().min(10, 'Description requise (min 10 caractères)'),
  cause_sinistre: z.string().optional(),
  nom_assure: z.string().min(2, 'Nom requis'),
  telephone_assure: z.string().min(8, 'Téléphone requis'),
  email_assure: z.string().email('Email invalide').optional().or(z.literal('')),
});

type SinistreFormData = z.infer<typeof sinistreSchema>;

interface ContratRecherche {
  id: number;
  numero_police: string;
  type: 'ContratBamboo' | 'ContratCofidec' | 'ContratBceg' | 'ContratEdg' | 'ContratSodec';
  nom_prenom?: string;
  nom?: string;
  prenom?: string;
  telephone_assure: string;
  email_assure?: string;
  montant_pret_assure?: number;
  montant_pret?: number;
  statut: string;
  emf?: {
    sigle: string;
  };
  garantie_deces_iad?: boolean;
  garantie_prevoyance?: boolean;
  garantie_perte_emploi?: boolean;
}

interface SinistreCreateData {
  numero_police: string;
  type_sinistre: 'deces' | 'iad' | 'maladie' | 'perte_emploi' | 'prevoyance';
  date_survenance: string;
  date_declaration: string;
  montant_reclame: number;
  description: string;
  cause_sinistre?: string;
  nom_assure: string;
  telephone_assure: string;
  email_assure?: string;
  contrat_type: 'ContratBamboo' | 'ContratCofidec' | 'ContratBceg' | 'ContratEdg' | 'ContratSodec';
  contrat_id: number;
  statut: 'en_attente' | 'en_cours' | 'valide' | 'rejete' | 'paye' | 'cloture';
}

export const SinistreDeclarationForm = () => {
  const navigate = useNavigate();
  const [searchPolice, setSearchPolice] = useState('');
  const [contratTrouve, setContratTrouve] = useState<ContratRecherche | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SinistreFormData>({
    resolver: zodResolver(sinistreSchema),
    defaultValues: {
      date_declaration: new Date().toISOString().split('T')[0],
    },
  });

  const typeSinistre = watch('type_sinistre');

  const createMutation = useMutation({
    mutationFn: (data: SinistreCreateData) => sinistreService.create(data),
    onSuccess: (response) => {
      toast.success('Sinistre déclaré avec succès');
      navigate(`/sinistres/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la déclaration');
    },
  });

  const handleSearchContrat = async () => {
    if (!searchPolice) {
      toast.error('Veuillez saisir un numéro de police');
      return;
    }

    setIsSearching(true);
    try {
      const response = await contratService.searchByPolice(searchPolice);
      
      if (response.data) {
        setContratTrouve(response.data as ContratRecherche);
        
        // Pré-remplir le formulaire
        setValue('numero_police', response.data.numero_police);
        setValue('nom_assure', response.data.nom_prenom || `${response.data.nom} ${response.data.prenom}`);
        setValue('telephone_assure', response.data.telephone_assure);
        setValue('email_assure', response.data.email_assure || '');
        
        toast.success('Contrat trouvé');
      } else {
        toast.error('Contrat non trouvé');
        setContratTrouve(null);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Contrat non trouvé');
      setContratTrouve(null);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (data: SinistreFormData) => {
    if (!contratTrouve) {
      toast.error('Veuillez d\'abord rechercher un contrat valide');
      return;
    }

    const formattedData: SinistreCreateData = {
      numero_police: data.numero_police,
      type_sinistre: data.type_sinistre,
      date_survenance: data.date_survenance,
      date_declaration: data.date_declaration,
      montant_reclame: parseFloat(data.montant_reclame),
      description: data.description,
      cause_sinistre: data.cause_sinistre,
      nom_assure: data.nom_assure,
      telephone_assure: data.telephone_assure,
      email_assure: data.email_assure,
      contrat_type: contratTrouve.type,
      contrat_id: contratTrouve.id,
      statut: 'en_attente',
    };

    createMutation.mutate(formattedData);
  };

  const getTypeSinistreOptions = () => {
    if (!contratTrouve) return [];

    const options = [
      { value: 'deces', label: 'Décès' },
      { value: 'iad', label: 'Invalidité Absolue Définitive (IAD)' },
    ];

    if (contratTrouve.garantie_prevoyance) {
      options.push({ value: 'prevoyance', label: 'Prévoyance (Maladie/Accident)' });
      options.push({ value: 'maladie', label: 'Maladie' });
    }

    if (contratTrouve.garantie_perte_emploi) {
      options.push({ value: 'perte_emploi', label: 'Perte d\'Emploi' });
    }

    return options;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/sinistres')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Déclarer un Sinistre
          </h1>
          <p className="text-gray-600 mt-1">
            Remplissez le formulaire de déclaration
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-900">
          <p className="font-semibold mb-1">Informations importantes</p>
          <ul className="space-y-1 text-yellow-700">
            <li>• Déclarez tout sinistre dans les délais impartis (généralement 180 jours)</li>
            <li>• Préparez tous les documents justificatifs nécessaires</li>
            <li>• Les fausses déclarations peuvent entraîner des sanctions</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Recherche de Contrat */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche du Contrat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                label="Numéro de police"
                placeholder="Ex: BAMBOO-2025-001"
                value={searchPolice}
                onChange={(e) => setSearchPolice(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearchContrat}
                disabled={isSearching}
                isLoading={isSearching}
                className="mt-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            {contratTrouve && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">
                  ✓ Contrat trouvé
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">Police</p>
                    <p className="font-semibold text-green-900">
                      {contratTrouve.numero_police}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">EMF/Banque</p>
                    <p className="font-semibold text-green-900">
                      {contratTrouve.emf?.sigle}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">Montant assuré</p>
                    <p className="font-semibold text-green-900">
                      {formatCurrency(contratTrouve.montant_pret_assure || contratTrouve.montant_pret || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">Statut</p>
                    <p className="font-semibold text-green-900">
                      {contratTrouve.statut}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-sm text-green-700">Garanties disponibles:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contratTrouve.garantie_deces_iad && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Décès & IAD
                      </span>
                    )}
                    {contratTrouve.garantie_prevoyance && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Prévoyance
                      </span>
                    )}
                    {contratTrouve.garantie_perte_emploi && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        Perte d'emploi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {contratTrouve && (
          <>
            {/* Type de Sinistre */}
            <Card>
              <CardHeader>
                <CardTitle>Type de Sinistre</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Type de sinistre"
                  options={getTypeSinistreOptions()}
                  placeholder="Sélectionnez le type"
                  error={errors.type_sinistre?.message}
                  {...register('type_sinistre')}
                />
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date de survenance"
                    type="date"
                    error={errors.date_survenance?.message}
                    {...register('date_survenance')}
                  />
                  <Input
                    label="Date de déclaration"
                    type="date"
                    error={errors.date_declaration?.message}
                    {...register('date_declaration')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Montant et Description */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du Sinistre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Montant réclamé (FCFA)"
                  type="number"
                  placeholder="0"
                  error={errors.montant_reclame?.message}
                  {...register('montant_reclame')}
                />
                
                {typeSinistre && (
                  <Input
                    label="Cause du sinistre"
                    placeholder={
                      typeSinistre === 'deces' ? 'Ex: Maladie, Accident...' :
                      typeSinistre === 'perte_emploi' ? 'Ex: Licenciement économique...' :
                      'Ex: Pathologie, Accident...'
                    }
                    error={errors.cause_sinistre?.message}
                    {...register('cause_sinistre')}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description détaillée <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    placeholder="Décrivez les circonstances du sinistre en détail..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations de l'Assuré */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'Assuré</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom complet"
                    placeholder="Nom et prénom"
                    error={errors.nom_assure?.message}
                    {...register('nom_assure')}
                  />
                  <Input
                    label="Téléphone"
                    placeholder="+241 XX XX XX XX"
                    error={errors.telephone_assure?.message}
                    {...register('telephone_assure')}
                  />
                  <Input
                    label="Email (optionnel)"
                    type="email"
                    placeholder="email@exemple.com"
                    error={errors.email_assure?.message}
                    {...register('email_assure')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documents à fournir */}
            <Card>
              <CardHeader>
                <CardTitle>Documents à Fournir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-2">
                    Documents nécessaires selon le type :
                  </p>
                  <ul className="space-y-2 text-sm text-blue-800">
                    {typeSinistre === 'deces' && (
                      <>
                        <li>• Acte de décès original</li>
                        <li>• Certificat médical de décès</li>
                        <li>• Copie de la carte d'identité du défunt</li>
                        <li>• Justificatif d'identité du bénéficiaire</li>
                      </>
                    )}
                    {typeSinistre === 'iad' && (
                      <>
                        <li>• Certificat médical détaillé</li>
                        <li>• Rapport d'expertise médicale</li>
                        <li>• Copie de la carte d'identité</li>
                        <li>• Dossier médical complet</li>
                      </>
                    )}
                    {typeSinistre === 'maladie' && (
                      <>
                        <li>• Certificat médical</li>
                        <li>• Ordonnances et factures</li>
                        <li>• Compte-rendu d'hospitalisation (si applicable)</li>
                      </>
                    )}
                    {typeSinistre === 'perte_emploi' && (
                      <>
                        <li>• Lettre de licenciement</li>
                        <li>• Certificat de travail</li>
                        <li>• Attestation Pôle Emploi/CNSS</li>
                        <li>• Copie du contrat de travail</li>
                      </>
                    )}
                    {typeSinistre === 'prevoyance' && (
                      <>
                        <li>• Acte de décès (en cas de décès)</li>
                        <li>• Certificat médical (en cas de maladie)</li>
                        <li>• Pièces d'identité</li>
                      </>
                    )}
                  </ul>
                  <p className="text-xs text-blue-700 mt-3">
                    * Ces documents pourront être uploadés après la déclaration
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avertissement */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900">
                  <p className="font-semibold mb-1">Déclaration sur l'honneur</p>
                  <p>
                    En soumettant ce formulaire, je certifie sur l'honneur l'exactitude 
                    des informations fournies. Toute fausse déclaration peut entraîner 
                    le rejet du sinistre et des poursuites judiciaires.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sinistres')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                isLoading={createMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Déclarer le Sinistre
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
