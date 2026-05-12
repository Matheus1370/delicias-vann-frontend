import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export interface Indicacao {
  id: string;
  indicadorId: string;
  indicadoEmail: string | null;
  indicadoUsuarioId: string | null;
  codigo: string;
  pedidoConvertidoId: string | null;
  cupomRecompensaId: string | null;
  recompensaValor: string | number | null;
  status: 'PENDENTE' | 'CONVERTIDA';
  createdAt: string;
}

export interface IndicacaoConsulta {
  codigo: string;
  indicadorNome: string | null;
  valida: boolean;
}

export function useMinhasIndicacoes() {
  return useQuery<Indicacao[]>({
    queryKey: ['indicacoes', 'mine'],
    queryFn: () => api.get('/indicacoes/mine').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function useGerarIndicacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (indicadoEmail?: string) =>
      api.post('/indicacoes', { indicadoEmail }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicacoes'] });
      toast.success('Link de indicação gerado!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao gerar indicação');
    },
  });
}

export function useConsultarIndicacao(codigo: string | undefined | null) {
  return useQuery<IndicacaoConsulta>({
    queryKey: ['indicacoes', 'consulta', codigo],
    enabled: !!codigo,
    retry: false,
    queryFn: () => api.get(`/indicacoes/codigo/${codigo}`).then((r) => r.data),
  });
}
