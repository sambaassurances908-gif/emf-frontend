import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EvolutionContrat {
  mois: string;
  nouveaux: number;
  resilie: number;
}

interface ContratChartProps {
  data: EvolutionContrat[];
}

export const ContratChart = ({ data }: ContratChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Contrats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Aucune donnée disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Contrats</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="nouveaux" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Nouveaux contrats"
            />
            <Line 
              type="monotone" 
              dataKey="resilie" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Résiliés"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
