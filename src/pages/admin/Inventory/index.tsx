import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory, useMovimentarInsumo } from '../../../hooks/useInventory';
import { BRAND } from '../../../styles/brand';

const TIPOS: Array<{
  value: 'ENTRADA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'QUEBRA_DESPERDICIO';
  label: string;
}> = [
  { value: 'ENTRADA', label: 'Entrada (compra)' },
  { value: 'AJUSTE_POSITIVO', label: 'Ajuste +' },
  { value: 'AJUSTE_NEGATIVO', label: 'Ajuste −' },
  { value: 'QUEBRA_DESPERDICIO', label: 'Quebra / desperdício' },
];

function fmtNumber(v: number | string, digits = 3) {
  return Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export default function AdminInventory() {
  const { data: insumos = [], isLoading } = useInventory();
  const { mutate: movimentar, isPending } = useMovimentarInsumo();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{
    tipo: (typeof TIPOS)[number]['value'];
    quantidade: string;
    motivo: string;
  }>({ tipo: 'ENTRADA', quantidade: '', motivo: '' });

  const submit = (id: string) => {
    const quantidade = parseFloat(form.quantidade.replace(',', '.'));
    if (!quantidade || quantidade <= 0) return;
    movimentar(
      { id, tipo: form.tipo, quantidade, motivo: form.motivo || undefined },
      {
        onSuccess: () => {
          setEditing(null);
          setForm({ tipo: 'ENTRADA', quantidade: '', motivo: '' });
        },
      },
    );
  };

  const baixos = insumos.filter((i: any) => i.precisaReposicao).length;

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-black text-brand-marrom">
              Estoque
            </h1>
            <p className="text-brand-marrom/60 mt-1">
              {insumos.length} insumos cadastrados
            </p>
          </div>
          {baixos > 0 && (
            <div
              className="px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: '#FFE8E8', color: '#CC0000' }}
            >
              ⚠ {baixos} {baixos === 1 ? 'insumo' : 'insumos'} abaixo do ponto de
              reposição
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-brand-marrom/50 font-medium">
            Carregando insumos...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {insumos.map((insumo: any, i: number) => {
              const low = insumo.precisaReposicao;
              return (
                <motion.div
                  key={insumo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-white rounded-2xl"
                  style={{
                    border: `1.5px solid ${low ? '#FFB4B4' : BRAND.begeEsc}`,
                    boxShadow: '0 2px 12px rgba(66,39,22,.04)',
                  }}
                >
                  <div className="flex items-center gap-4 p-5">
                    <div className="flex-1">
                      <div className="font-bold text-brand-marrom">
                        {insumo.nome}
                      </div>
                      <div className="text-xs text-brand-marrom/60 mt-0.5">
                        {insumo.codigoInterno ?? '—'} · R${' '}
                        {Number(insumo.precoUnitario).toFixed(2).replace('.', ',')}
                        /{insumo.unidadeMedida}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="font-bold"
                        style={{ color: low ? '#CC0000' : BRAND.marrom }}
                      >
                        {fmtNumber(insumo.estoqueAtual)} {insumo.unidadeMedida}
                      </div>
                      <div className="text-xs text-brand-marrom/50">
                        mín {fmtNumber(insumo.pontoReposicao)}{' '}
                        {insumo.unidadeMedida}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setEditing((v) => (v === insumo.id ? null : insumo.id))
                      }
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: BRAND.rosa }}
                    >
                      {editing === insumo.id ? 'Fechar' : 'Movimentar'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {editing === insumo.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 pb-5 pt-2 border-t"
                          style={{ borderColor: BRAND.begeEsc }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                            <select
                              value={form.tipo}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  tipo: e.target.value as any,
                                }))
                              }
                              className="px-3 py-2 rounded-xl bg-brand-bege text-sm font-medium text-brand-marrom"
                            >
                              {TIPOS.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder={`Qtd (${insumo.unidadeMedida})`}
                              value={form.quantidade}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  quantidade: e.target.value,
                                }))
                              }
                              className="px-3 py-2 rounded-xl bg-brand-bege text-sm font-medium text-brand-marrom"
                            />
                            <input
                              type="text"
                              placeholder="Motivo (opcional)"
                              value={form.motivo}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, motivo: e.target.value }))
                              }
                              className="px-3 py-2 rounded-xl bg-brand-bege text-sm font-medium text-brand-marrom md:col-span-1"
                            />
                            <button
                              disabled={isPending}
                              onClick={() => submit(insumo.id)}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                              style={{ background: BRAND.marrom }}
                            >
                              Registrar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
