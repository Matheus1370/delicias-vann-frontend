import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useProducts(filters?: { categoria?: string; tipo?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/catalog/products', { params: filters }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/catalog/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/catalog/categories').then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });
}

export function useUpsellItems() {
  return useQuery({
    queryKey: ['upsell'],
    queryFn: () => api.get('/catalog/upsell').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export interface AdicionalItem {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  precoVenda: string | number;
  pontosEsforco: number;
  imagemUrl?: string;
  modalidadesPermitidas?: string[];
  unidade: 'PORCAO' | 'UNIDADE';
  quantidadeSugerida: number;
}

export interface AdicionaisResponse {
  itens: AdicionalItem[];
  meta: {
    numeroPessoas: number | null;
    docinhosPorPessoa: number;
    totalSugerido: number;
  };
}

export function useAdicionais(numeroPessoas?: number | null) {
  return useQuery<AdicionaisResponse>({
    queryKey: ['adicionais', numeroPessoas],
    queryFn: () =>
      api
        .get('/catalog/adicionais', {
          params: numeroPessoas ? { numeroPessoas } : undefined,
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReviews(produtoId?: string) {
  return useQuery({
    queryKey: ['product-reviews', produtoId],
    enabled: !!produtoId,
    queryFn: () =>
      api.get(`/avaliacoes/produto/${produtoId}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
