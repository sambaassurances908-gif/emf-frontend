import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { AlertCircle, Clock } from 'lucide-react';

interface SinistreRecent {
  id: number;
  numero_sinistre: string;
  numero_police: string;
  type_sinistre: string;
  montant_reclame: number;
  statut: string;
  date_declaration: string;
}

interface SinistresWidgetProps {
  sinistres: SinistreRecent[];
}

export const SinistresWidget = ({ sinistres }: SinistresWidgetProps) => {
  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      valide: 'bg-green-100 text-green-800',
      rejete: 'bg-red-100 text-red-800',
      paye: 'bg-purple-100 text-purple-800',
      cloture: 'bg-gray-100 text-gray-800',
    };
    return colors[statut] || 'bg-orange-100 text-orange-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sinistres Récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sinistres.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun sinistre récent</p>
            </div>
          ) : (
            sinistres.map((sinistre: SinistreRecent) => (
              <div key={sinistre.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {sinistre.type_sinistre}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Police: {sinistre.numero_police}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs ${getStatutColor(sinistre.statut)}`}>
                      {sinistre.statut}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(sinistre.date_declaration)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
