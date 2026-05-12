import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface ConfiguracaoEntrega {
  id: string;
  modalidade: string;
  valorFreteBase: string | number;
  valorMinimoPedido: string | number;
  valorFreteGratisAcimaDe: string | number | null;
  raioKm: number | null;
  ativa: boolean;
}

export function useConfiguracoesEntrega() {
  return useQuery<ConfiguracaoEntrega[]>({
    queryKey: ['entrega', 'configuracoes'],
    queryFn: () => api.get('/entrega/configuracoes').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
}
