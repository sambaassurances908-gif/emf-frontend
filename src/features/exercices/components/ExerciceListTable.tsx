import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Exercice } from '@/types/exercice.types';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ListProps {
    exercices: Exercice[];
}

export const ExerciceListTable: React.FC<ListProps> = ({ exercices }) => {
    const navigate = useNavigate();

    return (
        <div className="rounded-md border bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Année</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exercices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                Aucun exercice trouvé.
                            </TableCell>
                        </TableRow>
                    ) : (
                        exercices.map((exercice) => (
                            <TableRow key={exercice.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium text-gray-900">{exercice.annee}</TableCell>
                                <TableCell>{new Date(exercice.date_debut).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(exercice.date_fin).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={exercice.statut === 'ouvert' ? 'success' : 'secondary'}>
                                        {exercice.statut.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="primary" // Changed to primary for solid look.
                                        className="bg-transparent hover:bg-gray-100 text-gray-700"
                                        size="sm"
                                        onClick={() => navigate(`/exercices/${exercice.id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Détails
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
