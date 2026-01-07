// hooks/useEdgRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useEdgRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<any[]>({
    queryKey: ['edg-recent-contracts-all', emfId, limit],
    queryFn: async () => {
      console.log('🔍 EDG DASHBOARD - Récupération contrats récents (Standard + Taxi):', { emfId, limit });

      const [resStandard, resTaxiPR, resTaxiPD] = await Promise.allSettled([
        api.get('/edg/contrats', { params: { emf_id: emfId, limit, page: 1 } }),
        api.get('/edg-taxi-perte-recette/contrats', { params: { emf_id: emfId, limit, page: 1 } }),
        api.get('/edg-taxi-prevoyance-deces/contrats', { params: { emf_id: emfId, limit, page: 1 } })
      ]);

      const extractData = (res: PromiseSettledResult<any>) => {
        if (res.status !== 'fulfilled') return [];
        const data = res.value.data;
        // Adjust extraction based on common API response patterns
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.data?.data)) return data.data.data;
        return [];
      };

      const contratsStandard = extractData(resStandard).map((c: any) => ({ ...c, source: 'standard' }));
      const contratsTaxiPR = extractData(resTaxiPR).map((c: any) => ({
        ...c,
        source: 'taxi_perte_recette',
        montant_pret_assure: 0,
        nom_prenom: `${c.nom || ''} ${c.prenom || ''}`.trim(),
        statut: c.statut || 'actif'
      }));
      const contratsTaxiPD = extractData(resTaxiPD).map((c: any) => ({
        ...c,
        source: 'taxi_prevoyance_deces',
        montant_pret_assure: 0,
        nom_prenom: `${c.nom || ''} ${c.prenom || ''}`.trim(),
        statut: c.statut || 'actif'
      }));

      const merged = [...contratsStandard, ...contratsTaxiPR, ...contratsTaxiPD]
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, limit);

      return merged;
    },
    enabled: !!emfId,
    staleTime: 3 * 60 * 1000,
  });
};

export default useEdgRecentContracts
