import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function useAvaliar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { pedidoId: string; nota: number; comentario?: string }) =>
      api.post('/avaliacoes', data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['order', variables.pedidoId] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Obrigado pela avaliação!');
    },
  });
}
