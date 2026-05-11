import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useCupons,
  useCriarCupom,
  useToggleCupom,
} from '../../../hooks/useCupons';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

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

export default function AdminCoupons() {
  const { data: cupons = [], isLoading } = useCupons();
  const { mutate: criar, isPending } = useCriarCupom();
  const { mutate: toggle } = useToggleCupom();

  const [form, setForm] = useState({
    codigo: '',
    tipo: 'PERCENTUAL' as 'PERCENTUAL' | 'FIXO',
    valor: '',
    minimoCompra: '',
    usoMaximo: '',
    validoAte: '',
    descricao: '',
    campanha: '',
  });

  const submit = () => {
    criar(
      {
        codigo: form.codigo,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        minimoCompra: form.minimoCompra ? parseFloat(form.minimoCompra) : 0,
        usoMaximo: form.usoMaximo ? parseInt(form.usoMaximo, 10) : undefined,
        validoAte: form.validoAte,
        descricao: form.descricao || undefined,
        campanha: form.campanha || undefined,
      },
      {
        onSuccess: () =>
          setForm({
            codigo: '',
            tipo: 'PERCENTUAL',
            valor: '',
            minimoCompra: '',
            usoMaximo: '',
            validoAte: '',
            descricao: '',
            campanha: '',
          }),
      },
    );
  };

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> campanhas e descontos
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
            cupons<span style={{ color: BRAND.rosa }}>.</span>
          </h1>
        </motion.div>

        {/* Create form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: BRAND.branco,
            borderRadius: 24,
            border: `1px solid ${BRAND.begeEsc}`,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}88`, marginBottom: 16 }}>
            Novo cupom
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <input
              placeholder="Codigo (ex: NIVER15)"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              style={inputStyle}
            />
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))}
              style={inputStyle}
            >
              <option value="PERCENTUAL">% desconto</option>
              <option value="FIXO">R$ fixo</option>
            </select>
            <input
              placeholder="Valor"
              value={form.valor}
              onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Minimo R$"
              value={form.minimoCompra}
              onChange={(e) => setForm((f) => ({ ...f, minimoCompra: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Uso maximo (opcional)"
              value={form.usoMaximo}
              onChange={(e) => setForm((f) => ({ ...f, usoMaximo: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="date"
              value={form.validoAte}
              onChange={(e) => setForm((f) => ({ ...f, validoAte: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Campanha"
              value={form.campanha}
              onChange={(e) => setForm((f) => ({ ...f, campanha: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Descricao"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <button
            disabled={isPending || !form.codigo || !form.valor || !form.validoAte}
            onClick={submit}
            style={{
              marginTop: 16,
              padding: '12px 28px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              color: BRAND.branco,
              background: BRAND.rosa,
              border: 'none',
              cursor: 'pointer',
              opacity: isPending || !form.codigo || !form.valor || !form.validoAte ? 0.4 : 1,
            }}
          >
            Criar cupom
          </button>
        </motion.div>

        {/* Coupon list */}
        {isLoading ? (
          <div style={{ textAlign: 'center', color: `${BRAND.marrom}77`, padding: '48px 0' }}>Carregando...</div>
        ) : (
          <div
            style={{
              background: BRAND.branco,
              borderRadius: 24,
              border: `1px solid ${BRAND.begeEsc}`,
              padding: 24,
            }}
          >
            {cupons.map((c: any, i: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 0',
                  borderBottom: i < cupons.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                  opacity: c.ativo ? 1 : 0.5,
                }}
              >
                {/* Active indicator */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: c.ativo ? BRAND.rosa : `${BRAND.marrom}33`,
                    flexShrink: 0,
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: BRAND.marrom }}>
                      {c.codigo}
                    </span>
                    {c.campanha && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 10px',
                          borderRadius: 999,
                          background: BRAND.bege,
                          color: `${BRAND.marrom}88`,
                          fontWeight: 600,
                        }}
                      >
                        {c.campanha}
                      </span>
                    )}
                  </div>
                  <div className="font-mono" style={{ fontSize: 11, color: `${BRAND.marrom}88`, marginTop: 4 }}>
                    {c.tipo === 'PERCENTUAL'
                      ? `${c.valor}% off`
                      : `R$ ${Number(c.valor).toFixed(2)}`}{' '}
                    · min R$ {Number(c.minimoCompra).toFixed(2)} · usos {c.usoAtual}
                    {c.usoMaximo ? `/${c.usoMaximo}` : ''}
                  </div>
                  {c.descricao && (
                    <div style={{ fontSize: 12, color: `${BRAND.marrom}66`, fontStyle: 'italic', marginTop: 2 }}>
                      {c.descricao}
                    </div>
                  )}
                </div>

                {/* Expiry */}
                <div className="font-mono" style={{ fontSize: 11, color: `${BRAND.marrom}66`, flexShrink: 0 }}>
                  ate {new Date(c.validoAte).toLocaleDateString('pt-BR')}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle({ id: c.id, ativo: !c.ativo })}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    color: BRAND.branco,
                    background: c.ativo ? BRAND.marrom : BRAND.rosa,
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {c.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </motion.div>
            ))}

            {cupons.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: `${BRAND.marrom}66`, fontSize: 14 }}>
                Nenhum cupom criado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
