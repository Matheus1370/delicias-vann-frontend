import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export type NivelRegra = 'BLOQUEAR' | 'AVISAR';

export interface Violacao {
  regraId: string;
  nome: string;
  nivel: NivelRegra;
  mensagem: string;
}

export interface AvaliarInput {
  produtoId: string;
  opcoesEscolhidas: Record<string, string>;
  modalidade?: string;
  dataAgendamento?: string;
  temperaturaC?: number;
  numeroPessoas?: number;
}

export interface Regra {
  id: string;
  nome: string;
  nivel: NivelRegra;
  condicao: { todos: any[] };
  mensagem: string;
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAvaliarRegras() {
  return useMutation({
    mutationFn: (input: AvaliarInput) =>
      api.post<{ violacoes: Violacao[] }>('/regras/avaliar', input).then((r) => r.data),
  });
}

export function useRegras() {
  return useQuery<Regra[]>({
    queryKey: ['regras'],
    queryFn: () => api.get('/regras').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateRegra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Regra>) => api.post('/regras', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['regras'] });
      toast.success('Regra criada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao criar regra');
    },
  });
}

export function useUpdateRegra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Regra> }) =>
      api.patch(`/regras/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['regras'] });
      toast.success('Regra atualizada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao atualizar regra');
    },
  });
}

export function useDeleteRegra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/regras/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['regras'] });
      toast.success('Regra removida');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao remover');
    },
  });
}
