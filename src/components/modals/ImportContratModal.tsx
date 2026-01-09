import React, { useState, useRef, useCallback } from 'react';
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
    ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { emfService } from '@/services/emf.service';
import api from '@/lib/api';

// Types de contrats disponibles
const CONTRAT_TYPES = [
    { value: 'bamboo', label: 'BAMBOO EMF', color: '#10b981' },
    { value: 'cofidec', label: 'COFIDEC', color: '#3b82f6' },
    { value: 'bceg', label: 'BCEG', color: '#8b5cf6' },
    { value: 'edg', label: 'EDG', color: '#f59e0b' },
    { value: 'sodec', label: 'SODEC', color: '#ec4899' },
    { value: 'finam', label: 'FINAM', color: '#06b6d4' },
    { value: 'cofiga', label: 'COFIGA', color: '#84cc16' },
    { value: 'agrpro', label: 'AGR PRO', color: '#f97316' },
    { value: 'arianefinance', label: 'ARIANE FINANCE', color: '#6366f1' },
];

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<ImportError[]>([]);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Récupérer la liste des EMFs uniquement si emfId n'est pas fourni
    const { data: emfsData, isLoading: isLoadingEmfs } = useQuery({
        queryKey: ['emfs-list'],
        queryFn: () => emfService.getAll(),
        enabled: !emfId && isOpen, // Ne charger que si emfId n'est pas fourni et le modal est ouvert
    });

    // S'assurer que emfsList est toujours un tableau valide
    const emfsList = Array.isArray(emfsData?.data) ? emfsData.data : [];

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

        // Utiliser emfId prop ou selectedEmfId state
        const finalEmfId = emfId || selectedEmfId;
        if (!finalEmfId) {
            setError('Veuillez sélectionner un EMF');
            return;
        }

        setLoading(true);
        setError(null);
        setErrors([]);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type_contrat', typeContrat);
            formData.append('emf_id', String(finalEmfId));

            if (exerciceId) {
                formData.append('exercice_id', String(exerciceId));
            }

            const response = await api.post('/contrats/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data?.data || response.data;

            setResult({
                success: true,
                message: data.message || 'Import réussi',
                contrats_crees: data.contrats_crees || data.count || 0,
                details: data,
            });

            if (onSuccess) {
                onSuccess({
                    success: true,
                    message: data.message || 'Import réussi',
                    contrats_crees: data.contrats_crees || data.count || 0,
                });
            }

        } catch (err: any) {
            console.error('Erreur import:', err);

            const errorData = err?.response?.data;
            const errorMessage = errorData?.message || err?.message || 'Une erreur est survenue lors de l\'import';

            setError(errorMessage);

            // Extraire les erreurs détaillées si disponibles
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
        setError(null);
        setErrors([]);
        setResult(null);
        setLoading(false);
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importer des contrats" size="lg">
            <div className="space-y-6">
                {/* Message de succès */}
                {result?.success && (
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">{result.message}</p>
                            {result.contrats_crees !== undefined && (
                                <p className="text-sm mt-1">
                                    <span className="font-bold text-emerald-800">{result.contrats_crees}</span> contrat(s) créé(s) avec succès
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Message d'erreur global */}
                {error && !result?.success && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium">{error}</p>
                            {errors.length > 0 && (
                                <div className="mt-2 max-h-32 overflow-y-auto">
                                    <ul className="text-sm space-y-1">
                                        {errors.slice(0, 10).map((e, i) => (
                                            <li key={i} className="flex gap-2">
                                                {e.ligne && <span className="font-mono bg-red-100 px-1 rounded">L{e.ligne}</span>}
                                                <span>{e.message}</span>
                                            </li>
                                        ))}
                                        {errors.length > 10 && (
                                            <li className="text-red-500 font-medium">
                                                ... et {errors.length - 10} autre(s) erreur(s)
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sélection du type de contrat */}
                {!result?.success && (
                    <>
                        {/* Sélection de l'EMF - uniquement si emfId n'est pas fourni */}
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

                        <div className="space-y-2">
                            <Label htmlFor="typeContrat">Type de contrat *</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {CONTRAT_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setTypeContrat(type.value)}
                                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${typeContrat === type.value
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Zone de drop */}
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
                                        ? 'border-blue-500 bg-blue-50'
                                        : file
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
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
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">{file.name}</p>
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
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Upload className={`h-8 w-8 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <p className="font-medium text-gray-700">
                                            {dragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier CSV'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">ou cliquez pour parcourir</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Informations */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
                            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium">Format attendu</p>
                                <p className="mt-1 text-blue-600">
                                    Le fichier CSV doit contenir les colonnes correspondant au type de contrat sélectionné.
                                    La première ligne doit contenir les en-têtes.
                                </p>
                                <button
                                    type="button"
                                    className="mt-2 inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-medium"
                                >
                                    <Download className="h-4 w-4" />
                                    Télécharger un modèle CSV
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        {result?.success ? 'Fermer' : 'Annuler'}
                    </Button>
                    {!result?.success && (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={loading || !file || !typeContrat || (!emfId && !selectedEmfId)}
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
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ImportContratModal;
