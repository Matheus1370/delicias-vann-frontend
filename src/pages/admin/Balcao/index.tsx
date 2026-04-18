import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useProducts } from '../../../hooks/useProducts';
import { api } from '../../../services/api';
import { BRAND } from '../../../styles/brand';

const currency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Balcao() {
  const { data: produtos = [], isLoading } = useProducts();
  const qc = useQueryClient();

  const [itens, setItens] = useState<Record<string, number>>({});
  const [observacoes, setObservacoes] = useState('');

  const { mutate: registrar, isPending } = useMutation({
    mutationFn: (payload: any) =>
      api.post('/inventory/venda-balcao', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Venda registrada');
      setItens({});
      setObservacoes('');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Erro ao registrar venda');
    },
  });

  const total = useMemo(() => {
    return produtos.reduce((acc: number, p: any) => {
      const q = itens[p.id] ?? 0;
      return acc + q * Number(p.precoVenda);
    }, 0);
  }, [itens, produtos]);

  const handleAdd = (id: string) =>
    setItens((cur) => ({ ...cur, [id]: (cur[id] ?? 0) + 1 }));

  const handleRemove = (id: string) =>
    setItens((cur) => {
      const q = (cur[id] ?? 0) - 1;
      if (q <= 0) {
        const { [id]: _, ...rest } = cur;
        return rest;
      }
      return { ...cur, [id]: q };
    });

  const handleSubmit = () => {
    const lista = Object.entries(itens).map(([produtoId, quantidade]) => ({
      produtoId,
      quantidade,
    }));
    if (lista.length === 0) return;
    registrar({ itens: lista, observacoes: observacoes || undefined });
  };

  const prontos = produtos.filter(
    (p: any) => p.tipo !== 'MONTAVEL' && p.tipo !== 'ADICIONAL',
  );

  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-2">
          PDV Balcão
        </h1>
        <p className="text-brand-marrom/60 mb-8">
          Registre vendas rápidas — o estoque da vitrine é descontado automaticamente.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-20 text-brand-marrom/50">Carregando...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {prontos.map((p: any) => (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAdd(p.id)}
                    disabled={p.fulfillment === 'MAKE_TO_STOCK' && p.estoqueVitrine <= 0}
                    className="bg-white rounded-2xl p-4 text-left disabled:opacity-40"
                    style={{
                      border: `1.5px solid ${BRAND.begeEsc}`,
                      boxShadow: '0 2px 8px rgba(66,39,22,.05)',
                    }}
                  >
                    {p.imagemUrl && (
                      <img
                        src={p.imagemUrl}
                        alt={p.nome}
                        className="w-full aspect-[4/3] object-cover rounded-xl mb-2"
                      />
                    )}
                    <div className="font-bold text-brand-marrom text-sm">{p.nome}</div>
                    <div
                      className="font-display text-lg font-black"
                      style={{ color: BRAND.rosa }}
                    >
                      {currency(Number(p.precoVenda))}
                    </div>
                    {p.fulfillment === 'MAKE_TO_STOCK' && (
                      <div className="text-[10px] text-brand-marrom/50 font-bold">
                        vitrine: {p.estoqueVitrine}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div
            className="bg-white rounded-3xl p-6 h-fit sticky top-4"
            style={{ border: `2px solid ${BRAND.begeEsc}` }}
          >
            <div className="font-display text-sm font-bold text-brand-marrom/60 uppercase mb-4">
              Venda atual
            </div>
            {Object.keys(itens).length === 0 ? (
              <div className="text-sm text-brand-marrom/50 py-4">Nenhum item</div>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {Object.entries(itens).map(([id, q]) => {
                  const p = produtos.find((pp: any) => pp.id === id);
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between py-2 border-b border-brand-bege"
                    >
                      <div className="flex-1 text-sm">
                        <div className="font-bold text-brand-marrom">{p.nome}</div>
                        <div className="text-xs text-brand-marrom/60">
                          {q} × {currency(Number(p.precoVenda))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemove(id)}
                          className="w-6 h-6 rounded-lg bg-brand-bege font-bold"
                        >
                          −
                        </button>
                        <div className="w-6 text-center font-bold text-sm">{q}</div>
                        <button
                          onClick={() => handleAdd(id)}
                          className="w-6 h-6 rounded-lg text-white font-bold text-xs"
                          style={{ background: BRAND.rosa }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <input
              placeholder="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full p-2 rounded-xl text-sm mb-3"
              style={{ background: BRAND.bege, border: `1.5px solid ${BRAND.begeEsc}` }}
            />

            <div className="flex justify-between mb-4 pt-3 border-t-2 border-brand-bege">
              <span className="font-display font-bold text-brand-marrom">Total</span>
              <span
                className="font-display text-2xl font-black"
                style={{ color: BRAND.rosa }}
              >
                {currency(total)}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPending || Object.keys(itens).length === 0}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40"
              style={{ background: BRAND.rosa }}
            >
              {isPending ? 'Registrando...' : 'Finalizar venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
