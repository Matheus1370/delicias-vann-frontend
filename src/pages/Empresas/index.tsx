import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Check, Gift, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useMinhaEmpresa, useSolicitarEmpresa } from '../../hooks/useEmpresa';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';

const BENEFICIOS = [
  {
    icon: Gift,
    titulo: 'desconto fixo',
    texto: 'sua empresa ganha um percentual sobre todos os pedidos, definido no momento da aprovação.',
  },
  {
    icon: Building2,
    titulo: 'condições especiais',
    texto: 'faturamento 30 dias, boleto e suporte direto via WhatsApp pro contato responsável.',
  },
  {
    icon: Mail,
    titulo: 'sem passar pelo wizard',
    texto: 'você fala direto comigo pelos kits empresariais — natal, reunião, integração, treinamentos.',
  },
];

export default function EmpresasPage() {
  const { isAuthenticated } = useAuthStore();
  const { data: minha, isLoading } = useMinhaEmpresa();
  const { mutateAsync: solicitar, isPending: enviando } = useSolicitarEmpresa();

  const [form, setForm] = useState({
    razaoSocial: '',
    cnpj: '',
    nomeFantasia: '',
    condicaoPagamento: '',
  });

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.razaoSocial.trim() || !form.cnpj.trim()) return;
    await solicitar({
      razaoSocial: form.razaoSocial,
      cnpj: form.cnpj,
      nomeFantasia: form.nomeFantasia || undefined,
      condicaoPagamento: form.condicaoPagamento || undefined,
    }).catch(() => {});
  };

  const statusCard = isAuthenticated && minha
    ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 24,
          background: BRAND.branco,
          borderRadius: 24,
          border: `1px solid ${BRAND.begeEsc}`,
          marginTop: 32,
        }}
      >
        <div className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          seu cadastro
        </div>
        <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color: BRAND.marrom, fontStyle: 'italic' }}>
          {minha.nomeFantasia || minha.razaoSocial}
        </div>
        <div style={{ fontSize: 13, color: `${BRAND.marrom}88`, marginTop: 4 }}>
          CNPJ {minha.cnpj}
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="font-mono"
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              background:
                minha.status === 'APROVADA'
                  ? '#15803d22'
                  : minha.status === 'REJEITADA'
                  ? '#FFE8E8'
                  : BRAND.bege,
              color:
                minha.status === 'APROVADA'
                  ? '#15803d'
                  : minha.status === 'REJEITADA'
                  ? '#CC0000'
                  : `${BRAND.marrom}aa`,
            }}
          >
            {minha.status === 'APROVADA' ? '✓ aprovada' : minha.status === 'REJEITADA' ? 'rejeitada' : 'em análise'}
          </span>
          {minha.status === 'APROVADA' && Number(minha.descontoPadrao) > 0 && (
            <span className="font-display" style={{ fontSize: 14, color: BRAND.rosa, fontWeight: 800 }}>
              -{Number(minha.descontoPadrao).toFixed(0)}% em todos pedidos
            </span>
          )}
        </div>
      </motion.div>
    )
    : null;

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Star11 size={12} color={BRAND.rosa} /> empresarial
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(44px, 8vw, 96px)',
              fontStyle: 'italic',
              fontWeight: 700,
              color: BRAND.marrom,
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
              margin: '8px 0 16px',
              maxWidth: 800,
            }}
          >
            kits que <span style={{ color: BRAND.rosa }}>fortalecem</span> a sua equipe.
          </h1>
          <p style={{ fontSize: 17, color: `${BRAND.marrom}aa`, lineHeight: 1.55, maxWidth: 580 }}>
            confeitaria artesanal pra cestas de natal, reuniões importantes, integrações e treinamentos. cadastre a empresa, a gente conversa direto, com condições especiais.
          </p>
        </motion.div>

        {statusCard}

        {/* Beneficios grid */}
        <div
          style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {BENEFICIOS.map((b, i) => (
            <motion.div
              key={b.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              style={{
                padding: 24,
                background: BRAND.branco,
                borderRadius: 20,
                border: `1px solid ${BRAND.begeEsc}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: `${BRAND.rosa}18`,
                  color: BRAND.rosa,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <b.icon size={20} />
              </div>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 700, fontStyle: 'italic', color: BRAND.marrom, marginBottom: 4 }}>
                {b.titulo}
              </div>
              <div style={{ fontSize: 13, color: `${BRAND.marrom}99`, lineHeight: 1.5 }}>
                {b.texto}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Formulario de auto-cadastro */}
        {!minha && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: 48,
              padding: 32,
              background: BRAND.branco,
              borderRadius: 24,
              border: `1px solid ${BRAND.begeEsc}`,
            }}
          >
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, fontStyle: 'italic', color: BRAND.marrom, marginBottom: 8 }}>
              cadastre sua <span style={{ color: BRAND.rosa }}>empresa</span>.
            </h2>
            <p style={{ fontSize: 14, color: `${BRAND.marrom}88`, marginBottom: 24, lineHeight: 1.5 }}>
              {isAuthenticated
                ? 'A confeitaria revisa e te chama via WhatsApp em 1 dia útil.'
                : 'Você precisa estar logado pra fazer o cadastro PJ. ' }
              {!isAuthenticated && (
                <Link to="/login" style={{ color: BRAND.rosa, fontWeight: 700, textDecoration: 'underline' }}>
                  entrar agora
                </Link>
              )}
            </p>

            {isAuthenticated && (
              <form onSubmit={submeter} style={{ display: 'grid', gap: 14 }}>
                <Field label="razão social">
                  <input
                    type="text"
                    required
                    placeholder="ex: Acme Bolos LTDA"
                    value={form.razaoSocial}
                    onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>
                <Field label="cnpj">
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>
                <Field label="nome fantasia (opcional)">
                  <input
                    type="text"
                    placeholder="ex: Acme"
                    value={form.nomeFantasia}
                    onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>
                <Field label="condição de pagamento desejada (opcional)">
                  <input
                    type="text"
                    placeholder="ex: faturamento 30 dias / boleto"
                    value={form.condicaoPagamento}
                    onChange={(e) => setForm({ ...form, condicaoPagamento: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>
                <button
                  type="submit"
                  disabled={enviando || !form.razaoSocial.trim() || !form.cnpj.trim()}
                  style={{
                    marginTop: 12,
                    padding: '16px 32px',
                    borderRadius: 999,
                    background: BRAND.rosa,
                    color: BRAND.branco,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: enviando ? 'wait' : 'pointer',
                    opacity: !form.razaoSocial.trim() || !form.cnpj.trim() ? 0.5 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Check size={16} />
                  {enviando ? 'enviando…' : 'enviar pra aprovação'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          color: BRAND.rosa,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${BRAND.begeEsc}`,
    background: BRAND.bege,
    fontFamily: 'inherit',
    fontSize: 14,
    color: BRAND.marrom,
    outline: 'none',
  };
}
