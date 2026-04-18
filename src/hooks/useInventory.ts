import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then((r) => r.data),
    refetchInterval: 60 * 1000,
  });
}

export function useMovimentarInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tipo,
      quantidade,
      motivo,
    }: {
      id: string;
      tipo: 'ENTRADA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'QUEBRA_DESPERDICIO';
      quantidade: number;
      motivo?: string;
    }) =>
      api
        .post(`/inventory/${id}/movimentacao`, { tipo, quantidade, motivo })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Estoque atualizado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao atualizar estoque');
    },
  });
}
