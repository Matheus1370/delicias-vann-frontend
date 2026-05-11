import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useMinhasAssinaturas,
  useMudarAssinatura,
} from '../../hooks/useAssinaturas';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  ATIVA: { label: 'Ativa', color: '#2D7A2D', bg: '#E8F4E8' },
  PAUSADA: { label: 'Pausada', color: '#B5651D', bg: '#FFF3D4' },
  CANCELADA: { label: 'Cancelada', color: '#CC0000', bg: '#FFE8E8' },
};

export default function Subscriptions() {
  const { data: assinaturas = [], isLoading } = useMinhasAssinaturas();
  const { mutate: mudar } = useMudarAssinatura();

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bege, padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
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
          &#10022; assinaturas
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
            margin: '0 0 8px',
          }}
        >
          minhas <span style={{ color: BRAND.rosa }}>assinaturas</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 15,
            color: BRAND.marrom,
            opacity: 0.5,
            marginBottom: 48,
          }}
        >
          doces entregues automaticamente na frequencia que voce escolher.
        </motion.p>

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
        ) : assinaturas.length === 0 ? (
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
              experimente nossos produtos e assine os seus favoritos!
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
            {assinaturas.map((a: any, i: number) => {
              const st = STATUS_MAP[a.status] ?? { label: a.status, color: '#666', bg: '#EEE' };
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  style={{
                    background: BRAND.branco,
                    borderRadius: 24,
                    padding: 24,
                    border: `1px solid ${BRAND.begeEsc}`,
                    display: 'flex',
                    gap: 20,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Product image */}
                  {a.produto?.imagemUrl && (
                    <img
                      src={a.produto.imagemUrl}
                      alt={a.produto.nome}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 16,
                        objectFit: 'cover',
                        border: `1px solid ${BRAND.begeEsc}`,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 700,
                          color: BRAND.marrom,
                          fontSize: 18,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {a.produto?.nome}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </div>
                    </div>

                    {/* Details */}
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        color: BRAND.marrom,
                        opacity: 0.5,
                        letterSpacing: '0.06em',
                        marginBottom: 4,
                      }}
                    >
                      a cada {a.frequenciaDias} dias
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        color: BRAND.marrom,
                        opacity: 0.5,
                        letterSpacing: '0.06em',
                        marginBottom: 16,
                      }}
                    >
                      proxima entrega:{' '}
                      {new Date(a.proximaGeracao).toLocaleDateString('pt-BR')}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {a.status === 'ATIVA' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => mudar({ id: a.id, acao: 'pausar' })}
                          style={{
                            padding: '8px 20px',
                            borderRadius: 999,
                            background: 'transparent',
                            color: BRAND.marrom,
                            fontWeight: 700,
                            fontSize: 12,
                            border: `2px solid ${BRAND.marrom}`,
                            cursor: 'pointer',
                          }}
                        >
                          pausar
                        </motion.button>
                      )}
                      {a.status === 'PAUSADA' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => mudar({ id: a.id, acao: 'retomar' })}
                          style={{
                            padding: '8px 20px',
                            borderRadius: 999,
                            background: BRAND.rosa,
                            color: BRAND.branco,
                            fontWeight: 700,
                            fontSize: 12,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          retomar
                        </motion.button>
                      )}
                      {a.status !== 'CANCELADA' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (confirm('Cancelar esta assinatura?')) {
                              mudar({ id: a.id, acao: 'cancelar' });
                            }
                          }}
                          style={{
                            padding: '8px 20px',
                            borderRadius: 999,
                            background: 'rgba(255,232,232,0.8)',
                            color: '#CC0000',
                            fontWeight: 700,
                            fontSize: 12,
                            border: '1.5px solid #FFB4B4',
                            cursor: 'pointer',
                          }}
                        >
                          cancelar
                        </motion.button>
                      )}
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
