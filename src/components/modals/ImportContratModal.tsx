import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import {
    Upload,
    FileSpreadsheet,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Download,
    Info,
    Building2,
    ChevronDown,
    Calendar,
    FileText,
    Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { emfService } from '@/services/emf.service';
import { exerciceService } from '@/services/exercice.service';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 CONFIGURATION DES EMFs AVEC TEMPLATES DYNAMIQUES
// ═══════════════════════════════════════════════════════════════════════════

// URL de base pour les templates (sans /api)
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '');

// Fonction pour obtenir l'URL du template depuis le backend
const getTemplateUrl = (emfType: string): string => {
    return `${API_BASE_URL}/templates/template_import_${emfType}.csv`;
};

const EMF_CONFIG: Record<string, {
    label: string;
    templateKey: string; // Clé pour construire l'URL du template
    model?: string;
    table?: string;
    color: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    description?: string;
    colonnes?: string[];
}> = {
    bamboo: {
        label: 'Bamboo EMF',
        templateKey: 'bamboo',
        model: 'ContratBambooEmf',
        table: 'contrat_bamboo_emfs',
        color: '#10b981',
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone_assure', 'montant_pret_assure', 'duree_pret_mois', 'date_effet', 'date_fin_echeance', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    edg: {
        label: 'EDG',
        templateKey: 'edg',
        model: 'ContratEdg',
        table: 'contrat_edgs',
        color: '#f59e0b',
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    bceg: {
        label: 'BCEG',
        templateKey: 'bceg',
        model: 'ContratBceg',
        table: 'contrat_bcegs',
        color: '#8b5cf6',
        colorClass: 'text-violet-600',
        bgClass: 'bg-violet-50',
        borderClass: 'border-violet-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    cofidec: {
        label: 'COFIDEC',
        templateKey: 'cofidec',
        model: 'ContratCofidec',
        table: 'contrat_cofidecs',
        color: '#3b82f6',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    cofiga: {
        label: 'COFIGA',
        templateKey: 'cofiga',
        model: 'ContratCofiga',
        table: 'contrat_cofigas',
        color: '#84cc16',
        colorClass: 'text-lime-600',
        bgClass: 'bg-lime-50',
        borderClass: 'border-lime-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    finam: {
        label: 'FINAM',
        templateKey: 'finam',
        model: 'ContratFinam',
        table: 'contrat_finams',
        color: '#06b6d4',
        colorClass: 'text-cyan-600',
        bgClass: 'bg-cyan-50',
        borderClass: 'border-cyan-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    sodec: {
        label: 'SODEC',
        templateKey: 'sodec',
        model: 'ContratSodec',
        table: 'contrat_sodecs',
        color: '#ec4899',
        colorClass: 'text-pink-600',
        bgClass: 'bg-pink-50',
        borderClass: 'border-pink-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    arianefinance: {
        label: 'Ariane Finance',
        templateKey: 'ariane', // Le backend utilise 'ariane' et non 'arianefinance'
        model: 'ContratArianeFinance',
        table: 'contrat_ariane_finances',
        color: '#6366f1',
        colorClass: 'text-indigo-600',
        bgClass: 'bg-indigo-50',
        borderClass: 'border-indigo-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    agrpro: {
        label: 'AGR PRO',
        templateKey: 'agrpro',
        model: 'ContratAgrPro',
        table: 'contrat_agr_pros',
        color: '#f97316',
        colorClass: 'text-orange-600',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
        colonnes: ['numero_police', 'nom_prenom', 'telephone', 'montant', 'duree_mois', 'date_effet', 'date_fin', 'prime_ttc_recue', 'commission', 'taxes', 'prime_nette']
    },
    universel: {
        label: '📊 Template Universel',
        templateKey: 'universel',
        color: '#6b7280',
        colorClass: 'text-gray-600',
        bgClass: 'bg-gray-50',
        borderClass: 'border-gray-200',
        description: 'Format CSV standard - Compatible avec toutes les EMFs',
        colonnes: ['NUMERO_POLICE', 'NOM_PRENOM', 'TELEPHONE', 'MONTANT', 'DUREE', 'DATE_EFFET', 'DATE_FIN', 'PRIME_TTC', 'COMMISSION', 'TAXES', 'PRIME_NETTE']
    }
};

interface ImportContratModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (result: ImportResult) => void;
    defaultTypeContrat?: string;
    emfId?: number | null;
    exerciceId?: number | null;
}

interface ImportResult {
    success: boolean;
    message: string;
    contrats_crees?: number;
    erreurs?: string[];
    details?: any;
    stats?: {
        total: number;
        success: number;
        errors: string[];
    };
}

interface ImportError {
    ligne?: number;
    message: string;
}

export const ImportContratModal: React.FC<ImportContratModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    defaultTypeContrat,
    emfId,
    exerciceId,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [typeContrat, setTypeContrat] = useState(defaultTypeContrat || '');
    const [selectedEmfId, setSelectedEmfId] = useState<number | null>(emfId || null);
    const [selectedExerciceId, setSelectedExerciceId] = useState<number | null>(exerciceId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<ImportError[]>([]);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [showColonnes, setShowColonnes] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Récupérer la liste des EMFs uniquement si emfId n'est pas fourni
    const { data: emfsData, isLoading: isLoadingEmfs } = useQuery({
        queryKey: ['emfs-list-import'],
        queryFn: () => emfService.getAll(),
        enabled: !emfId && isOpen,
        staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
        retry: 2,
    });

    // Récupérer la liste des exercices uniquement si exerciceId n'est pas fourni
    // Ne pas filtrer par statut pour afficher tous les exercices disponibles
    const { data: exercicesData, isLoading: isLoadingExercices } = useQuery({
        queryKey: ['exercices-list-import'],
        queryFn: () => exerciceService.getAll(),
        enabled: !exerciceId && isOpen,
        staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
        retry: 2,
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔧 EXTRACTION ROBUSTE DES DONNÉES - Gère tous les formats de réponse API
    // ═══════════════════════════════════════════════════════════════════════════

    // Fonction utilitaire pour extraire un tableau de manière robuste
    const extractArrayFromResponse = useCallback((data: any): any[] => {
        if (!data) return [];

        // Cas 1: C'est déjà un tableau
        if (Array.isArray(data)) return data;

        // Cas 2: { data: [...] } - Format standard Laravel Resource
        if (data.data && Array.isArray(data.data)) return data.data;

        // Cas 3: { data: { data: [...] } } - Double enveloppe (Axios + Laravel)
        if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;

        // Cas 4: Structure paginée Laravel { data: { data: [...], meta: {...} } }
        if (typeof data.data === 'object' && data.data !== null) {
            // Chercher un tableau dans les clés de l'objet
            for (const key of Object.keys(data.data)) {
                if (Array.isArray(data.data[key])) return data.data[key];
            }
        }

        // Cas 5: Chercher un tableau dans les clés de premier niveau
        for (const key of Object.keys(data)) {
            if (Array.isArray(data[key]) && key !== 'meta' && key !== 'links') {
                return data[key];
            }
        }

        console.warn('⚠️ Impossible d\'extraire un tableau de:', data);
        return [];
    }, []);

    // Extraction stable des EMFs avec useMemo
    const emfsList = useMemo(() => {
        const list = extractArrayFromResponse(emfsData);
        if (isOpen && emfsData) {
            console.log('📦 EMFs Extraction:', {
                rawDataType: typeof emfsData,
                rawDataKeys: emfsData ? Object.keys(emfsData) : [],
                extractedCount: list.length,
                firstItem: list[0] ? { id: list[0].id, sigle: list[0].sigle } : null
            });
        }
        return list;
    }, [emfsData, isOpen, extractArrayFromResponse]);

    // Extraction stable des Exercices avec useMemo
    const exercicesList = useMemo(() => {
        const list = extractArrayFromResponse(exercicesData);
        if (isOpen && exercicesData) {
            console.log('📅 Exercices Extraction:', {
                rawDataType: typeof exercicesData,
                isArray: Array.isArray(exercicesData),
                extractedCount: list.length,
                firstItem: list[0] ? { id: list[0].id, annee: list[0].annee } : null
            });
        }
        return list;
    }, [exercicesData, isOpen, extractArrayFromResponse]);

    // Configuration de l'EMF sélectionnée
    const selectedEmfConfig = typeContrat ? EMF_CONFIG[typeContrat] : null;

    // Gestion du drag & drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setError(null);
                setResult(null);
                setErrors([]);
            } else {
                setError('Seuls les fichiers .csv sont acceptés');
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setError(null);
                setResult(null);
                setErrors([]);
            } else {
                setError('Seuls les fichiers .csv sont acceptés');
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setError(null);
        setResult(null);
        setErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier CSV');
            return;
        }

        if (!typeContrat) {
            setError('Veuillez sélectionner un type de contrat');
            return;
        }

        const finalEmfId = emfId || selectedEmfId;
        if (!finalEmfId) {
            setError('Veuillez sélectionner un EMF');
            return;
        }

        const finalExerciceId = exerciceId || selectedExerciceId;
        if (!finalExerciceId) {
            setError('Veuillez sélectionner un exercice fiscal');
            return;
        }

        setLoading(true);
        setError(null);
        setErrors([]);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            // Utiliser la templateKey (ex: 'ariane') au lieu de la clé de l'objet (ex: 'arianefinance')
            // car le backend attend 'ariane' pour l'import
            const backendType = EMF_CONFIG[typeContrat]?.templateKey || typeContrat;
            formData.append('type_contrat', backendType);
            formData.append('emf_id', String(finalEmfId));
            formData.append('exercice_id', String(finalExerciceId));

            const response = await api.post('/contrats/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data?.data || response.data;

            const stats = data.stats || {
                total: data.contrats_crees || data.count || 0,
                success: data.contrats_crees || data.count || 0,
                errors: data.erreurs || []
            };

            setResult({
                success: true,
                message: data.message || 'Import réussi',
                contrats_crees: stats.success,
                stats: stats,
                details: data,
            });

            if (stats.errors && stats.errors.length > 0) {
                setErrors(stats.errors.map((errMsg: string) => ({
                    ligne: undefined,
                    message: errMsg,
                })));
            }

            if (onSuccess) {
                onSuccess({
                    success: true,
                    message: data.message || 'Import réussi',
                    contrats_crees: stats.success,
                    stats: stats,
                });
            }

        } catch (err: any) {
            console.error('Erreur import:', err);

            const errorData = err?.response?.data;
            const errorMessage = errorData?.message || err?.message || 'Une erreur est survenue lors de l\'import';

            setError(errorMessage);

            if (errorData?.errors) {
                if (Array.isArray(errorData.errors)) {
                    setErrors(errorData.errors.map((e: any, i: number) => ({
                        ligne: e.ligne || i + 1,
                        message: typeof e === 'string' ? e : e.message || JSON.stringify(e),
                    })));
                } else if (typeof errorData.errors === 'object') {
                    const errorList: ImportError[] = [];
                    Object.entries(errorData.errors).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            value.forEach((v: string) => errorList.push({ message: `${key}: ${v}` }));
                        } else {
                            errorList.push({ message: `${key}: ${value}` });
                        }
                    });
                    setErrors(errorList);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setTypeContrat(defaultTypeContrat || '');
        setSelectedEmfId(emfId || null);
        setSelectedExerciceId(exerciceId || null);
        setError(null);
        setErrors([]);
        setResult(null);
        setLoading(false);
        setShowColonnes(false);
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Télécharger le template CSV depuis le backend
    const handleDownloadTemplate = () => {
        if (!typeContrat || !selectedEmfConfig) {
            setError('Veuillez d\'abord sélectionner un type de contrat');
            return;
        }

        // Construire l'URL du template depuis le backend
        const templateUrl = getTemplateUrl(selectedEmfConfig.templateKey);

        // Ouvrir le lien dans une nouvelle fenêtre pour télécharger
        window.open(templateUrl, '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={result ? "Résultat de l'import" : "Importer des contrats"} size="lg">
            <div className="space-y-6">
                {/* ═══════════════════════════════════════════════════════════════════════════ */}
                {/* 🎉 ÉCRAN DE RÉCAPITULATIF - SUCCÈS */}
                {/* ═══════════════════════════════════════════════════════════════════════════ */}
                {result?.success && (
                    <div className="space-y-6">
                        {/* En-tête avec animation de succès */}
                        <div className="text-center py-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 mb-4 animate-pulse">
                                <CheckCircle2 className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Import Réussi !</h2>
                            <p className="text-gray-600 mt-1">{result.message}</p>
                        </div>

                        {/* Statistiques en grille */}
                        {result.stats && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center border border-gray-200 shadow-sm">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <FileSpreadsheet className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <p className="text-3xl font-bold text-gray-800">{result.stats.total}</p>
                                    <p className="text-sm text-gray-500 font-medium">Lignes traitées</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-4 text-center border border-emerald-200 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-600">{result.stats.success}</p>
                                    <p className="text-sm text-emerald-700 font-medium">Contrats créés</p>
                                </div>
                                <div className={`rounded-2xl p-4 text-center border shadow-sm ${(result.stats.errors?.length || 0) > 0
                                    ? 'bg-gradient-to-br from-red-50 to-orange-100 border-red-200'
                                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
                                    }`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${(result.stats.errors?.length || 0) > 0 ? 'bg-red-200' : 'bg-blue-200'
                                        }`}>
                                        {(result.stats.errors?.length || 0) > 0
                                            ? <AlertCircle className="h-6 w-6 text-red-600" />
                                            : <Sparkles className="h-6 w-6 text-blue-600" />
                                        }
                                    </div>
                                    <p className={`text-3xl font-bold ${(result.stats.errors?.length || 0) > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {result.stats.errors?.length || 0}
                                    </p>
                                    <p className={`text-sm font-medium ${(result.stats.errors?.length || 0) > 0 ? 'text-red-700' : 'text-blue-700'}`}>
                                        {(result.stats.errors?.length || 0) > 0 ? 'Erreurs' : 'Sans erreur'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Barre de progression visuelle */}
                        {result.stats && result.stats.total > 0 && (
                            <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(result.stats.success / result.stats.total) * 100}%` }}
                                />
                            </div>
                        )}

                        {/* Détails des erreurs (si présentes) */}
                        {errors.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-3 px-4 py-3 bg-amber-100 border-b border-amber-200">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    <span className="font-semibold text-amber-800">
                                        {errors.length} ligne(s) non importée(s)
                                    </span>
                                </div>
                                <div className="p-4 max-h-48 overflow-y-auto">
                                    <ul className="space-y-2">
                                        {errors.map((e, idx) => (
                                            <li key={idx} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-amber-100">
                                                {e.ligne && (
                                                    <span className="flex-shrink-0 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-mono font-bold rounded">
                                                        Ligne {e.ligne}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-700">{e.message}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Informations sur le fichier importé */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{file?.name || 'Fichier CSV'}</p>
                                <p className="text-sm text-gray-500">
                                    Type: <span className="font-medium">{selectedEmfConfig?.label || typeContrat}</span>
                                    {file && ` • ${formatFileSize(file.size)}`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════════════ */}
                {/* ❌ ÉCRAN DE RÉCAPITULATIF - ÉCHEC */}
                {/* ═══════════════════════════════════════════════════════════════════════════ */}
                {error && !result?.success && (
                    <div className="space-y-6">
                        {/* En-tête avec animation d'erreur */}
                        <div className="text-center py-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 mb-4">
                                <X className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Échec de l'Import</h2>
                            <p className="text-red-600 mt-1 font-medium">{error}</p>
                        </div>

                        {/* Détails des erreurs */}
                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-3 px-4 py-3 bg-red-100 border-b border-red-200">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-red-800">
                                        Détails des erreurs ({errors.length})
                                    </span>
                                </div>
                                <div className="p-4 max-h-64 overflow-y-auto">
                                    <ul className="space-y-2">
                                        {errors.map((e, idx) => (
                                            <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
                                                    {e.ligne || idx + 1}
                                                </span>
                                                <span className="text-sm text-gray-700">{e.message}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Conseils pour résoudre */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Conseils pour résoudre :</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Vérifiez que le format du fichier est correct (CSV)</li>
                                    <li>Assurez-vous que les colonnes correspondent au template</li>
                                    <li>Vérifiez que les dates sont au format JJ/MM/AAAA</li>
                                    <li>Les montants doivent être des nombres sans symbole monétaire</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulaire d'import - affiché uniquement si pas de résultat ni d'erreur */}
                {!result?.success && !error && (
                    <>
                        {/* Sélection de l'EMF */}
                        {!emfId && (
                            <div className="space-y-2">
                                <Label htmlFor="emfSelect">EMF / Banque *</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        id="emfSelect"
                                        value={selectedEmfId || ''}
                                        onChange={(e) => setSelectedEmfId(e.target.value ? Number(e.target.value) : null)}
                                        disabled={isLoadingEmfs}
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:border-gray-900 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {isLoadingEmfs ? 'Chargement...' : 'Sélectionnez un EMF...'}
                                        </option>
                                        {emfsList.map((emf) => (
                                            <option key={emf.id} value={emf.id}>
                                                {emf.sigle} - {emf.raison_sociale}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingEmfs ? (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                                    ) : (
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sélection de l'Exercice */}
                        {!exerciceId && (
                            <div className="space-y-2">
                                <Label htmlFor="exerciceSelect">Exercice Fiscal *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        id="exerciceSelect"
                                        value={selectedExerciceId || ''}
                                        onChange={(e) => setSelectedExerciceId(e.target.value ? Number(e.target.value) : null)}
                                        disabled={isLoadingExercices}
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:border-gray-900 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {isLoadingExercices ? 'Chargement...' : 'Sélectionnez un exercice...'}
                                        </option>
                                        {exercicesList.map((exercice: any) => (
                                            <option key={exercice.id} value={exercice.id}>
                                                {exercice.annee} - {exercice.libelle || `Exercice ${exercice.annee}`}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingExercices ? (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                                    ) : (
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sélection du type de contrat avec badges colorés */}
                        <div className="space-y-2">
                            <Label htmlFor="typeContrat">Type de contrat / EMF *</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(EMF_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTypeContrat(key)}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${typeContrat === key
                                            ? `${config.borderClass} ${config.bgClass} ${config.colorClass} ring-2 ring-offset-2`
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        style={typeContrat === key ? { '--tw-ring-color': config.color } as any : {}}
                                    >
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: config.color }}
                                        />
                                        <span className="truncate">{config.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Encadré de téléchargement du template */}
                        {selectedEmfConfig && (
                            <div className={`p-4 ${selectedEmfConfig.bgClass} border ${selectedEmfConfig.borderClass} rounded-xl`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className={`h-5 w-5 ${selectedEmfConfig.colorClass}`} />
                                            <p className={`font-semibold ${selectedEmfConfig.colorClass}`}>
                                                Template {selectedEmfConfig.label}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedEmfConfig.description || 'Téléchargez ce template, remplissez-le avec vos données, puis importez-le'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={handleDownloadTemplate}
                                        className="flex-shrink-0 gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Télécharger
                                    </Button>
                                </div>

                                {/* Affichage des colonnes attendues */}
                                {selectedEmfConfig.colonnes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200/50">
                                        <button
                                            type="button"
                                            onClick={() => setShowColonnes(!showColonnes)}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Voir les colonnes attendues</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${showColonnes ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showColonnes && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {selectedEmfConfig.colonnes.map((col, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-white/70 text-xs font-mono rounded border border-gray-200"
                                                    >
                                                        {col}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Zone de drop améliorée */}
                        <div className="space-y-2">
                            <Label>Fichier CSV *</Label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                                    ${dragActive
                                        ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                                        : file
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {file ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">{file.name}</p>
                                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile();
                                            }}
                                            className="ml-4 p-2 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5 text-red-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${dragActive ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                            <Upload className={`h-8 w-8 transition-colors ${dragActive ? 'text-blue-500' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <p className="font-semibold text-gray-700">
                                            {dragActive ? '🎯 Déposez le fichier ici !' : 'Glissez-déposez votre fichier CSV'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">ou cliquez pour parcourir</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Informations sur le format */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
                            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium">Format attendu</p>
                                <p className="mt-1 text-blue-600">
                                    Le fichier CSV doit contenir les colonnes correspondant au type sélectionné.
                                    La première ligne doit contenir les en-têtes. Séparateur : point-virgule (;) ou virgule (,).
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    {/* Boutons après un résultat */}
                    {(result?.success || error) ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setFile(null);
                                    setError(null);
                                    setErrors([]);
                                    setResult(null);
                                }}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Nouvel Import
                            </Button>
                            <Button variant="primary" onClick={handleClose}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Terminer
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={handleClose} disabled={loading}>
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={loading || !file || !typeContrat || (!emfId && !selectedEmfId) || (!exerciceId && !selectedExerciceId)}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Import en cours...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Importer
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ImportContratModal;
