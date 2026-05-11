import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory, useMovimentarInsumo } from '../../../hooks/useInventory';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

const TIPOS: Array<{
  value: 'ENTRADA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'QUEBRA_DESPERDICIO';
  label: string;
}> = [
  { value: 'ENTRADA', label: 'Entrada (compra)' },
  { value: 'AJUSTE_POSITIVO', label: 'Ajuste +' },
  { value: 'AJUSTE_NEGATIVO', label: 'Ajuste −' },
  { value: 'QUEBRA_DESPERDICIO', label: 'Quebra / desperdicio' },
];

function fmtNumber(v: number | string, digits = 3) {
  return Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 999,
  border: `1.5px solid ${BRAND.begeEsc}`,
  background: BRAND.branco,
  fontSize: 13,
  fontWeight: 500,
  color: BRAND.marrom,
  outline: 'none',
  width: '100%',
};

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> controle de insumos
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
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
                estoque<span style={{ color: BRAND.rosa }}>.</span>
              </h1>
              <p className="font-mono" style={{ color: `${BRAND.marrom}88`, fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {insumos.length} insumos cadastrados
              </p>
            </div>

            {baixos > 0 && (
              <div
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  background: '#FEE2E2',
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ⚠ {baixos} {baixos === 1 ? 'insumo' : 'insumos'} abaixo do ponto de reposicao
              </div>
            )}
          </div>
        </motion.div>

        {/* Stock table */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77`, fontWeight: 500 }}
          >
            Carregando insumos...
          </motion.div>
        ) : (
          <div
            style={{
              background: BRAND.branco,
              borderRadius: 24,
              border: `1px solid ${BRAND.begeEsc}`,
              padding: 24,
            }}
          >
            {insumos.map((insumo: any, i: number) => {
              const low = insumo.precisaReposicao;
              return (
                <motion.div
                  key={insumo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 0',
                      borderBottom: i < insumos.length - 1 || editing === insumo.id ? `1px dashed ${BRAND.begeEsc}` : 'none',
                    }}
                  >
                    {/* Alert indicator */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: low ? '#DC2626' : `${BRAND.marrom}22`,
                        flexShrink: 0,
                      }}
                    />

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                        {insumo.nome}
                      </div>
                      <div className="font-mono" style={{ fontSize: 11, color: `${BRAND.marrom}88`, marginTop: 2 }}>
                        {insumo.codigoInterno ?? '\u2014'} · R$ {Number(insumo.precoUnitario).toFixed(2).replace('.', ',')}/{insumo.unidadeMedida}
                      </div>
                    </div>

                    {/* Stock level */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="font-display" style={{ fontWeight: 700, fontSize: 18, color: low ? '#DC2626' : BRAND.marrom }}>
                        {fmtNumber(insumo.estoqueAtual)}
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}66`, textTransform: 'uppercase' }}>
                        min {fmtNumber(insumo.pontoReposicao)} {insumo.unidadeMedida}
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => setEditing((v) => (v === insumo.id ? null : insumo.id))}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        color: BRAND.branco,
                        background: editing === insumo.id ? BRAND.marrom : BRAND.rosa,
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {editing === insumo.id ? 'Fechar' : 'Movimentar'}
                    </button>
                  </div>

                  {/* Inline movement form */}
                  <AnimatePresence>
                    {editing === insumo.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            padding: '16px 0',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 10,
                            borderBottom: i < insumos.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                          }}
                        >
                          <select
                            value={form.tipo}
                            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))}
                            style={inputStyle}
                          >
                            {TIPOS.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={`Qtd (${insumo.unidadeMedida})`}
                            value={form.quantidade}
                            onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
                            style={inputStyle}
                          />
                          <input
                            type="text"
                            placeholder="Motivo (opcional)"
                            value={form.motivo}
                            onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                            style={inputStyle}
                          />
                          <button
                            disabled={isPending}
                            onClick={() => submit(insumo.id)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              color: BRAND.branco,
                              background: BRAND.marrom,
                              border: 'none',
                              cursor: 'pointer',
                              opacity: isPending ? 0.5 : 1,
                            }}
                          >
                            Registrar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {insumos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: `${BRAND.marrom}66`, fontSize: 14 }}>
                Nenhum insumo cadastrado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
