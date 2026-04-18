import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useCartStore } from '../store/cart.store';
import toast from 'react-hot-toast';

export function useMyOrders() {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/mine').then((r) => r.data),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    enabled: !!id,
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    refetchInterval: 20 * 1000,
  });
}

export function useAdminOrders(filters?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => api.get('/orders', { params: filters }).then((r) => r.data),
    refetchInterval: 30 * 1000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);

  return useMutation({
    mutationFn: (data: any) => api.post('/orders', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart();
      toast.success('Pedido criado com sucesso!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Erro ao criar pedido';
      toast.error(msg);
    },
  });
}

export function useReorder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/reorder`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Pedido refeito!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao repetir pedido');
    },
  });
}

export function useCancelarPedidoCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      api.post(`/orders/${id}/cancelar`, { motivo }).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['order', variables.id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Pedido cancelado');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Não foi possível cancelar');
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      motivo,
    }: {
      id: string;
      status: string;
      motivo?: string;
    }) =>
      api.patch(`/orders/${id}/status`, { status, motivo }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Status atualizado');
    },
  });
}
