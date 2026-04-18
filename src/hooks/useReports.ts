import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useOverview(days = 30) {
  return useQuery({
    queryKey: ['report-overview', days],
    queryFn: () =>
      api.get('/reports/overview', { params: { days } }).then((r) => r.data),
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useVendasDiarias(days = 14) {
  return useQuery({
    queryKey: ['report-vendas-diarias', days],
    queryFn: () =>
      api
        .get('/reports/vendas-diarias', { params: { days } })
        .then((r) => r.data),
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useMargemProduto(days = 30) {
  return useQuery({
    queryKey: ['report-margem-produto', days],
    queryFn: () =>
      api.get('/reports/margem-produto', { params: { days } }).then((r) => r.data),
  });
}

export function useCohort(days = 90) {
  return useQuery({
    queryKey: ['report-cohort', days],
    queryFn: () => api.get('/reports/cohort', { params: { days } }).then((r) => r.data),
  });
}

export function useOcupacaoSlots(days = 30) {
  return useQuery({
    queryKey: ['report-ocupacao', days],
    queryFn: () =>
      api.get('/reports/ocupacao-slots', { params: { days } }).then((r) => r.data),
  });
}

export function useGastoInsumo(days = 30) {
  return useQuery({
    queryKey: ['report-gasto-insumo', days],
    queryFn: () =>
      api.get('/reports/gasto-insumo', { params: { days } }).then((r) => r.data),
  });
}
