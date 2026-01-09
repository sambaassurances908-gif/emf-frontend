import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, DollarSign, PieChart, TrendingUp } from 'lucide-react';

interface StatsProps {
    stats: {
        total_primes: number;
        total_sinistres: number;
        marge: number;
        ratio_sp: number;
        progression_annuelle: number;
    };
}

export const ExerciceStatsCards: React.FC<StatsProps> = ({ stats }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(value);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Primes</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_primes)}</div>
                    <p className={`text-xs ${stats.progression_annuelle >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.progression_annuelle > 0 ? '+' : ''}{stats.progression_annuelle}% par rapport à l'an dernier
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sinistres Payés</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_sinistres)}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Marge</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.marge)}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ratio S/P</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.ratio_sp > 50 ? 'text-red-500' : 'text-green-500'}`}>
                        {stats.ratio_sp}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cible &lt; 50%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
