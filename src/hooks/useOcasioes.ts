import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export interface Ocasiao {
  id: string;
  titulo: string;
  diaMes: string;
  ano: number | null;
  pedidoOriginalId: string | null;
  ativa: boolean;
  ultimoLembreteAno: number | null;
  createdAt: string;
}

export function useMinhasOcasioes() {
  return useQuery<Ocasiao[]>({
    queryKey: ['ocasioes', 'mine'],
    queryFn: () => api.get('/ocasioes/mine').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function useCriarOcasiao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { titulo: string; diaMes: string; pedidoOriginalId?: string; ano?: number }) =>
      api.post('/ocasioes', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocasioes'] });
      toast.success('Ocasião guardada! A gente te lembra 60 dias antes');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao guardar');
    },
  });
}

export function useEditarOcasiao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ocasiao> }) =>
      api.patch(`/ocasioes/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocasioes'] });
      toast.success('Ocasião atualizada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao atualizar');
    },
  });
}

export function useRemoverOcasiao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ocasioes/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocasioes'] });
      toast.success('Ocasião removida');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao remover');
    },
  });
}
