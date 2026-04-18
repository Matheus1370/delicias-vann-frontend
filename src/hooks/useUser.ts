import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Dados atualizados');
    },
  });
}

export function useAnonimizar() {
  return useMutation({
    mutationFn: () => api.post('/users/me/anonimizar').then((r) => r.data),
    onSuccess: () => toast.success('Seus dados foram anonimizados'),
  });
}
