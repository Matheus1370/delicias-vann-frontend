import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export interface Inspiracao {
  id: string;
  titulo: string;
  fotoUrl: string;
  tagsMassa: string[];
  tagsRecheio: string[];
  tagsCobertura: string[];
  tagsTopo: string[];
  ocasiao: string | null;
  publicado: boolean;
  pedidoOrigemId: string | null;
  createdAt: string;
}

export interface FiltrosInspiracao {
  massa?: string[];
  recheio?: string[];
  cobertura?: string[];
  topo?: string[];
  ocasiao?: string;
}

function montarParams(f?: FiltrosInspiracao): Record<string, string> {
  if (!f) return {};
  const params: Record<string, string> = {};
  if (f.massa?.length) params.massa = f.massa.join(',');
  if (f.recheio?.length) params.recheio = f.recheio.join(',');
  if (f.cobertura?.length) params.cobertura = f.cobertura.join(',');
  if (f.topo?.length) params.topo = f.topo.join(',');
  if (f.ocasiao) params.ocasiao = f.ocasiao;
  return params;
}

export function useInspiracoes(filtros?: FiltrosInspiracao) {
  return useQuery<Inspiracao[]>({
    queryKey: ['inspiracoes', filtros ?? {}],
    queryFn: () =>
      api
        .get('/inspiracoes', { params: montarParams(filtros) })
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useInspiracoesAdmin() {
  return useQuery<Inspiracao[]>({
    queryKey: ['inspiracoes', 'admin'],
    queryFn: () => api.get('/inspiracoes/admin/list').then((r) => r.data),
  });
}

export function useCreateInspiracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Inspiracao>) =>
      api.post('/inspiracoes', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspiracoes'] });
      toast.success('Inspiração criada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao criar');
    },
  });
}

export function useUpdateInspiracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Inspiracao> }) =>
      api.patch(`/inspiracoes/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspiracoes'] });
      toast.success('Atualizada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao atualizar');
    },
  });
}

export function useDeleteInspiracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inspiracoes/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspiracoes'] });
      toast.success('Removida');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao remover');
    },
  });
}
