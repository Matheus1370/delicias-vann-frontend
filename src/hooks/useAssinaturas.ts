import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function useMinhasAssinaturas() {
  return useQuery({
    queryKey: ['assinaturas-mine'],
    queryFn: () => api.get('/assinaturas/mine').then((r) => r.data),
  });
}

export function useCriarAssinatura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { produtoId: string; frequenciaDias?: number }) =>
      api.post('/assinaturas', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assinaturas-mine'] });
      toast.success('Assinatura criada');
    },
  });
}

export function useMudarAssinatura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, acao }: { id: string; acao: 'pausar' | 'retomar' | 'cancelar' }) =>
      api.patch(`/assinaturas/${id}/${acao}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assinaturas-mine'] });
    },
  });
}
