import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface ContratRecent {
  id: number;
  numero_police: string;
  nom_prenom: string;
  montant_pret_assure: number;
  statut: string;
  created_at: string;
  emf?: {
    sigle: string;
  };
}

interface RecentContractsProps {
  contracts: ContratRecent[];
}

export const RecentContracts = ({ contracts }: RecentContractsProps) => {
  const navigate = useNavigate();

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      suspendu: 'bg-orange-100 text-orange-800',
      expire: 'bg-red-100 text-red-800',
      en_attente: 'bg-yellow-100 text-yellow-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contrats Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Aucun contrat récent
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrats Récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Police</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>EMF</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract: ContratRecent, index: number) => (
                <TableRow key={`${contract.emf?.sigle || 'unknown'}-${contract.id}-${index}`}>
                  <TableCell className="font-mono text-sm">
                    {contract.numero_police}
                  </TableCell>
                  <TableCell>{contract.nom_prenom}</TableCell>
                  <TableCell>{contract.emf?.sigle || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(contract.montant_pret_assure)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contract.statut)}>
                      {contract.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(contract.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/contrats/${contract.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
