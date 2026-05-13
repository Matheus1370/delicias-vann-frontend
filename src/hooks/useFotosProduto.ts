import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export type TipoFotoProduto = 'PRINCIPAL' | 'CORTADO' | 'DETALHE';

export interface FotoProduto {
  id: string;
  produtoId: string;
  url: string;
  tipo: TipoFotoProduto;
  ordem: number;
  createdAt: string;
}

export function useFotosProduto(produtoId?: string) {
  return useQuery<FotoProduto[]>({
    queryKey: ['fotos-produto', produtoId],
    queryFn: () => api.get(`/catalog/products/${produtoId}/fotos`).then((r) => r.data),
    enabled: !!produtoId,
  });
}

export function useAdicionarFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      produtoId,
      data,
    }: {
      produtoId: string;
      data: { url: string; tipo?: TipoFotoProduto; ordem?: number };
    }) => api.post(`/catalog/products/${produtoId}/fotos`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fotos-produto', vars.produtoId] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Foto adicionada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao adicionar foto');
    },
  });
}

export function useAtualizarFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fotoId,
      data,
    }: {
      fotoId: string;
      produtoId: string;
      data: Partial<{ url: string; tipo: TipoFotoProduto; ordem: number }>;
    }) => api.patch(`/catalog/fotos/${fotoId}`, data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fotos-produto', vars.produtoId] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Atualizada');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao atualizar');
    },
  });
}

export function useRemoverFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fotoId }: { fotoId: string; produtoId: string }) =>
      api.delete(`/catalog/fotos/${fotoId}`).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fotos-produto', vars.produtoId] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Removida');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao remover');
    },
  });
}
