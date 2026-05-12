import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export interface Empresa {
  id: string;
  razaoSocial: string;
  cnpj: string;
  nomeFantasia: string | null;
  contatoPadraoId: string;
  condicaoPagamento: string | null;
  descontoPadrao: string | number;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  createdAt: string;
}

export function useMinhaEmpresa() {
  return useQuery<Empresa | null>({
    queryKey: ['empresa', 'mine'],
    queryFn: () => api.get('/empresas/mine').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function useSolicitarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      razaoSocial: string;
      cnpj: string;
      nomeFantasia?: string;
      condicaoPagamento?: string;
    }) => api.post('/empresas/solicitar', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresa'] });
      toast.success('Cadastro PJ enviado pra aprovação 💖');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao enviar cadastro');
    },
  });
}
