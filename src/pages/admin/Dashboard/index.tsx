import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

const CARDS = [
  { to: '/admin/pedidos', titulo: 'Pedidos', descricao: 'Fila de producao e entrega', icon: '📋' },
  { to: '/admin/producao', titulo: 'Producao', descricao: 'Slots e capacidade', icon: '🎂' },
  { to: '/admin/balcao', titulo: 'Balcao', descricao: 'Vendas rapidas no local', icon: '🛒' },
  { to: '/admin/estoque', titulo: 'Estoque', descricao: 'Insumos e reposicao', icon: '📦' },
  { to: '/admin/cupons', titulo: 'Cupons', descricao: 'Campanhas e promocoes', icon: '🏷️' },
  { to: '/admin/relatorios', titulo: 'Relatorios', descricao: 'Vendas e indicadores', icon: '📊' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> painel administrativo
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
            delicias da <span style={{ color: BRAND.rosa }}>vann</span>.
          </h1>
          <p className="font-mono" style={{ color: `${BRAND.marrom}99`, fontSize: 13, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Administracao
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
            >
              <Link
                to={c.to}
                style={{
                  display: 'block',
                  background: BRAND.branco,
                  borderRadius: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                  padding: 24,
                  textDecoration: 'none',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px rgba(66,39,22,0.1)`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `${BRAND.rosa}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {c.icon}
                </div>
                <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: BRAND.marrom }}>
                  {c.titulo}
                </div>
                <div style={{ fontSize: 13, color: `${BRAND.marrom}88`, marginTop: 6 }}>
                  {c.descricao}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 11,
                    fontWeight: 700,
                    color: BRAND.rosa,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'Space Grotesk',
                  }}
                >
                  Acessar →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                background: BRAND.branco,
                border: `1.5px solid ${BRAND.begeEsc}`,
                fontSize: 12,
                fontWeight: 700,
                color: BRAND.marrom,
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = BRAND.rosa;
                (e.currentTarget as HTMLElement).style.color = BRAND.branco;
                (e.currentTarget as HTMLElement).style.borderColor = BRAND.rosa;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = BRAND.branco;
                (e.currentTarget as HTMLElement).style.color = BRAND.marrom;
                (e.currentTarget as HTMLElement).style.borderColor = BRAND.begeEsc;
              }}
            >
              {c.icon} {c.titulo}
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
