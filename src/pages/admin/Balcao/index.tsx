import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useProducts } from '../../../hooks/useProducts';
import { api } from '../../../services/api';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

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
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> ponto de venda
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              fontStyle: 'italic',
              color: BRAND.marrom,
              marginTop: 8,
            }}
          >
            pdv <span style={{ color: BRAND.rosa }}>balcao</span>.
          </h1>
          <p className="font-mono" style={{ color: `${BRAND.marrom}88`, fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vendas rapidas — estoque descontado automaticamente
          </p>
        </motion.div>

        {/* Main grid: products + cart sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Product grid */}
          <div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77` }}>
                Carregando...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {prontos.map((p: any, i: number) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAdd(p.id)}
                    disabled={p.fulfillment === 'MAKE_TO_STOCK' && p.estoqueVitrine <= 0}
                    style={{
                      background: BRAND.branco,
                      borderRadius: 24,
                      border: `1px solid ${BRAND.begeEsc}`,
                      padding: 16,
                      textAlign: 'left',
                      cursor: 'pointer',
                      opacity: p.fulfillment === 'MAKE_TO_STOCK' && p.estoqueVitrine <= 0 ? 0.35 : 1,
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(66,39,22,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {p.imagemUrl && (
                      <img
                        src={p.imagemUrl}
                        alt={p.nome}
                        style={{
                          width: '100%',
                          aspectRatio: '4/3',
                          objectFit: 'cover',
                          borderRadius: 16,
                          marginBottom: 10,
                        }}
                      />
                    )}
                    <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 13 }}>{p.nome}</div>
                    <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: BRAND.rosa, marginTop: 2 }}>
                      {currency(Number(p.precoVenda))}
                    </div>
                    {p.fulfillment === 'MAKE_TO_STOCK' && (
                      <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}66`, fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>
                        vitrine: {p.estoqueVitrine}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Cart sidebar (dark panel) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: BRAND.marrom,
              borderRadius: 24,
              padding: 24,
              position: 'sticky',
              top: 16,
              color: BRAND.bege,
            }}
          >
            <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.bege}88`, marginBottom: 16 }}>
              Venda atual
            </div>

            {Object.keys(itens).length === 0 ? (
              <div style={{ fontSize: 13, color: `${BRAND.bege}66`, padding: '16px 0' }}>
                Nenhum item adicionado
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
                {Object.entries(itens).map(([id, q]) => {
                  const p = produtos.find((pp: any) => pp.id === id);
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: `1px dashed ${BRAND.bege}22`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.bege }}>{p.nome}</div>
                        <div className="font-mono" style={{ fontSize: 11, color: `${BRAND.bege}88`, marginTop: 1 }}>
                          {q} x {currency(Number(p.precoVenda))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleRemove(id)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: `${BRAND.bege}22`,
                            color: BRAND.bege,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          −
                        </button>
                        <div style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 13, color: BRAND.bege }}>
                          {q}
                        </div>
                        <button
                          onClick={() => handleAdd(id)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: BRAND.rosa,
                            color: BRAND.branco,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Notes input */}
            <input
              placeholder="Observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 999,
                border: `1.5px solid ${BRAND.bege}33`,
                background: `${BRAND.bege}11`,
                fontSize: 13,
                color: BRAND.bege,
                outline: 'none',
                marginBottom: 16,
              }}
            />

            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderTop: `1.5px solid ${BRAND.bege}33`,
                marginBottom: 16,
              }}
            >
              <span className="font-display" style={{ fontWeight: 700, fontSize: 14, color: BRAND.bege }}>Total</span>
              <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: BRAND.rosa }}>
                {currency(total)}
              </span>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isPending || Object.keys(itens).length === 0}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 15,
                color: BRAND.marrom,
                background: BRAND.rosa,
                border: 'none',
                cursor: 'pointer',
                opacity: isPending || Object.keys(itens).length === 0 ? 0.4 : 1,
              }}
            >
              {isPending ? 'Registrando...' : 'Finalizar venda'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
