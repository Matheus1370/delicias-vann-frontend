import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useCartStore } from '../store/cart.store';

export function useSlotsRange(from: string, to: string) {
  return useQuery({
    queryKey: ['slots-range', from, to],
    queryFn: () =>
      api
        .get('/capacity/slots/range', { params: { from, to } })
        .then((r) => r.data),
    enabled: !!from && !!to,
    refetchInterval: 60 * 1000,
  });
}

export function useAvailableSlots(date: string) {
  const totalPontos = useCartStore((s) => s.totalPontos());

  return useQuery({
    queryKey: ['slots', date, totalPontos],
    queryFn: () =>
      api
        .get('/capacity/slots', { params: { date, points: totalPontos } })
        .then((r) => r.data),
    enabled: !!date && totalPontos > 0,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
