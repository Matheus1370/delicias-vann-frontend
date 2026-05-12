import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface CreditoItem {
  id: string;
  valor: string | number;
  valorUsado: string | number;
  motivo: string;
  pedidoOrigemId: string | null;
  expiraEm: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface SaldoCredito {
  saldoTotal: number;
  itens: CreditoItem[];
}

export function useSaldoCredito() {
  return useQuery<SaldoCredito>({
    queryKey: ['credito', 'saldo'],
    queryFn: () => api.get('/creditos/saldo').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}
