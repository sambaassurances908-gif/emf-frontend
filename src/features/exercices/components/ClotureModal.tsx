import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { exerciceService } from '@/services/exercice.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    exerciceId: number;
    onSuccess: () => void;
}

export const ClotureModal: React.FC<Props> = ({ isOpen, onClose, exerciceId, onSuccess }) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await exerciceService.cloturer(exerciceId, { confirmer: true, notes });
            onSuccess();
            setNotes(''); // Reset
        } catch (error) {
            console.error(error);
            // Ideally handle error display here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clôturer l'exercice">
            <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                L'exercice suivant sera automatiquement créé. Cette action marquera l'exercice actuel comme terminé.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notes de clôture</Label>
                    <Textarea
                        id="notes"
                        placeholder="Rapport de fin d'année, observations..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
                    <Button variant="danger" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Clôture...' : 'Confirmer la Clôture'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
