import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface PedidoPublico {
  pedidoId: string;
  clienteNome: string | null;
  status: string;
  jaAvaliado: boolean;
  itens: Array<{ quantidade: number; nome: string | null }>;
}

export function usePedidoPublico(token: string | undefined) {
  return useQuery<PedidoPublico>({
    queryKey: ['avaliacao-publica', token],
    enabled: !!token,
    queryFn: () => api.get(`/avaliacoes/publica/${token}`).then((r) => r.data),
    retry: false,
  });
}

export function useEnviarAvaliacaoPublica() {
  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: {
        notaNPS: number;
        comentario?: string;
        fotoFesta?: string;
        permiteUsoFoto?: boolean;
      };
    }) => api.post(`/avaliacoes/publica/${token}`, data).then((r) => r.data),
  });
}
