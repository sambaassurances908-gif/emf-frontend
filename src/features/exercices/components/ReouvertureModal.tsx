import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { exerciceService } from '@/services/exercice.service';
import { AlertCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    exerciceId: number;
    onSuccess: () => void;
}

const MIN_MOTIF_LENGTH = 10;

export const ReouvertureModal: React.FC<Props> = ({ isOpen, onClose, exerciceId, onSuccess }) => {
    const [motif, setMotif] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isMotifValid = motif.trim().length >= MIN_MOTIF_LENGTH;

    const handleSubmit = async () => {
        if (!isMotifValid) {
            setError(`Le motif doit contenir au moins ${MIN_MOTIF_LENGTH} caractères.`);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await exerciceService.reouvrir(exerciceId, { motif: motif.trim() });
            onSuccess();
            setMotif('');
            setError(null);
        } catch (err: any) {
            console.error(err);
            const serverMessage = err?.response?.data?.message || err?.message || 'Une erreur est survenue';
            setError(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMotif('');
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Réouvrir l'exercice">
            <div className="space-y-4">
                {error && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">{error}</div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="motif">Motif de réouverture (Obligatoire)</Label>
                    <Textarea
                        id="motif"
                        placeholder="Ex: Correction d'écritures comptables suite à une erreur de saisie..."
                        value={motif}
                        onChange={(e) => {
                            setMotif(e.target.value);
                            if (error) setError(null);
                        }}
                        rows={4}
                        className={!isMotifValid && motif.length > 0 ? 'border-orange-400' : ''}
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            Expliquez pourquoi vous souhaitez réouvrir cet exercice.
                        </p>
                        <span className={`text-xs font-medium ${motif.trim().length < MIN_MOTIF_LENGTH
                                ? 'text-orange-500'
                                : 'text-green-600'
                            }`}>
                            {motif.trim().length}/{MIN_MOTIF_LENGTH} min
                        </span>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !isMotifValid}
                    >
                        {loading ? 'Réouverture en cours...' : 'Confirmer la réouverture'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
