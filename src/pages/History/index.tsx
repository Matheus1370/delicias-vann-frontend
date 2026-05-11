import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyOrders, useReorder } from '../../hooks/useOrders';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando', color: '#B5651D', bg: '#FFF3D4' },
  PAGO: { label: 'Pago', color: '#3355BB', bg: '#E8F0FF' },
  EM_PRODUCAO: { label: 'Em producao', color: '#B5651D', bg: '#FFF0E8' },
  PRONTO: { label: 'Pronto', color: '#2D7A2D', bg: '#E8F4E8' },
  EM_ENTREGA: { label: 'Em entrega', color: '#1A7B9A', bg: '#E8F7FC' },
  ENTREGUE: { label: 'Entregue', color: '#666', bg: '#F0F0F0' },
  CANCELADO: { label: 'Cancelado', color: '#CC0000', bg: '#FFE8E8' },
  ATRASADO: { label: 'Atrasado', color: '#CC0000', bg: '#FFE8E8' },
};

export default function History() {
  const { data: pedidos = [], isLoading } = useMyOrders();
  const { mutate: reorder } = useReorder();

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bege, padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-mono"
          style={{
            fontSize: 12,
            color: BRAND.rosa,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          &#10022; meus pedidos
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display"
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: BRAND.marrom,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: '0 0 48px',
          }}
        >
          historico de <span style={{ color: BRAND.rosa }}>pedidos</span>.
        </motion.h1>

        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              color: BRAND.marrom,
              opacity: 0.4,
            }}
          >
            <div
              className="font-display"
              style={{ fontStyle: 'italic', fontSize: 20 }}
            >
              carregando...
            </div>
          </div>
        ) : pedidos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <Star11 size={48} color={BRAND.begeEsc} fill={BRAND.begeEsc} stroke={0} />
            <div
              className="font-display"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontStyle: 'italic',
                color: BRAND.marrom,
                fontWeight: 700,
                marginTop: 20,
                lineHeight: 1.1,
              }}
            >
              ops, nada por aqui...
            </div>
            <p style={{ color: BRAND.marrom, opacity: 0.5, marginTop: 12, fontSize: 14 }}>
              seus pedidos vao aparecer aqui
            </p>
            <Link
              to="/cardapio"
              style={{
                display: 'inline-block',
                marginTop: 24,
                padding: '14px 32px',
                borderRadius: 999,
                background: BRAND.rosa,
                color: BRAND.branco,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ver cardapio
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidos.map((p: any, i: number) => {
              const sc = STATUS_LABEL[p.status] ?? { label: p.status, color: '#666', bg: '#EEE' };
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                  style={{
                    background: BRAND.branco,
                    borderRadius: 24,
                    padding: 24,
                    border: `1px solid ${BRAND.begeEsc}`,
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <Link
                      to={`/pedidos/${p.id}`}
                      className="font-display"
                      style={{
                        fontWeight: 700,
                        color: BRAND.marrom,
                        fontSize: 18,
                        textDecoration: 'none',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      #{p.id.slice(-6).toUpperCase()}
                    </Link>
                    <div
                      className="font-mono"
                      style={{
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: sc.bg,
                        color: sc.color,
                      }}
                    >
                      {sc.label}
                    </div>
                  </div>

                  {/* Items */}
                  <div
                    style={{
                      fontSize: 13,
                      color: BRAND.marrom,
                      opacity: 0.7,
                      marginBottom: 16,
                      lineHeight: 1.5,
                    }}
                  >
                    {p.itens?.map((it: any) => `${it.quantidade}x ${it.produto?.nome}`).join(', ')}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 14,
                      borderTop: `1px solid ${BRAND.begeEsc}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          color: BRAND.marrom,
                          opacity: 0.5,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div
                        className="font-display"
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: BRAND.marrom,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        R$ {Number(p.valorTotal).toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {p.status === 'ENTREGUE' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => reorder(p.id)}
                          style={{
                            padding: '8px 20px',
                            borderRadius: 999,
                            background: BRAND.rosa,
                            color: BRAND.branco,
                            fontWeight: 700,
                            fontSize: 12,
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '0.04em',
                          }}
                        >
                          repetir
                        </motion.button>
                      )}
                      <Link
                        to={`/pedidos/${p.id}`}
                        style={{
                          padding: '8px 20px',
                          borderRadius: 999,
                          background: 'transparent',
                          color: BRAND.marrom,
                          fontWeight: 700,
                          fontSize: 12,
                          border: `2px solid ${BRAND.marrom}`,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        ver detalhes
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
