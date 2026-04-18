import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function useValidarCupom() {
  return useMutation({
    mutationFn: ({ codigo, subtotal }: { codigo: string; subtotal: number }) =>
      api
        .get('/cupons/validar', { params: { codigo, subtotal } })
        .then((r) => r.data),
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Cupom inválido');
    },
  });
}

export function useCupons() {
  return useQuery({
    queryKey: ['cupons'],
    queryFn: () => api.get('/cupons').then((r) => r.data),
  });
}

export function useCriarCupom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/cupons', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cupons'] });
      toast.success('Cupom criado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao criar cupom');
    },
  });
}

export function useToggleCupom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      api.patch(`/cupons/${id}/toggle`, { ativo }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cupons'] }),
  });
}
