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

export function useProductReviews(produtoId?: string) {
  return useQuery({
    queryKey: ['product-reviews', produtoId],
    enabled: !!produtoId,
    queryFn: () =>
      api.get(`/avaliacoes/produto/${produtoId}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
