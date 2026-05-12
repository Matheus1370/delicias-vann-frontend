import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, MessageCircle, Share2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';
import { useMinhasIndicacoes, useGerarIndicacao, type Indicacao } from '../../hooks/useIndicacoes';

const ORIGEM_APP =
  typeof window !== 'undefined' ? window.location.origin : 'https://deliciasdavann.com.br';

function montarLink(codigo: string) {
  return `${ORIGEM_APP}/cadastro?ref=${codigo}`;
}

function montarMensagem(codigo: string) {
  const link = montarLink(codigo);
  return `oi! aqui é da Delícias da Vann 🎂\n\nuse meu link e ganhe 10% de desconto no primeiro pedido:\n${link}`;
}

export default function IndicarPage() {
  const { data: indicacoes = [], isLoading } = useMinhasIndicacoes();
  const { mutateAsync: gerar, isPending: gerando } = useGerarIndicacao();
  const [copiado, setCopiado] = useState<string | null>(null);

  const indicacaoAtiva = useMemo<Indicacao | null>(() => {
    return indicacoes.find((i) => i.status === 'PENDENTE') ?? indicacoes[0] ?? null;
  }, [indicacoes]);

  useEffect(() => {
    // Se cliente nunca gerou link, cria um sozinho
    if (!isLoading && indicacoes.length === 0) {
      gerar(undefined).catch(() => {});
    }
  }, [isLoading, indicacoes.length, gerar]);

  const copiar = async (texto: string, marker: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(marker);
      toast.success('copiado!');
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      toast.error('não consegui copiar');
    }
  };

  const compartilhar = async (codigo: string) => {
    const mensagem = montarMensagem(codigo);
    if (navigator.share) {
      try {
        await navigator.share({ text: mensagem });
      } catch {
        // cancelou
      }
    } else {
      await copiar(mensagem, 'share');
    }
  };

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: BRAND.rosa,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star11 size={12} color={BRAND.rosa} /> programa de indicação
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(40px, 6vw, 64px)',
              fontStyle: 'italic',
              fontWeight: 700,
              color: BRAND.marrom,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              margin: '8px 0 16px',
            }}
          >
            convide quem você <span style={{ color: BRAND.rosa }}>ama</span>.
          </h1>
          <p style={{ fontSize: 16, color: `${BRAND.marrom}aa`, lineHeight: 1.55, maxWidth: 540 }}>
            seu indicado ganha <strong>10% no 1° pedido</strong>. quando ele pagar, você também ganha um cupom de
            10% pra usar em até 90 dias. 💖
          </p>
        </motion.div>

        {/* Cartão do link */}
        {indicacaoAtiva && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              marginTop: 32,
              padding: 28,
              background: BRAND.branco,
              borderRadius: 24,
              border: `1px solid ${BRAND.begeEsc}`,
            }}
          >
            <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}88`, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              seu código
            </div>
            <div
              className="font-display"
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 800,
                color: BRAND.rosa,
                letterSpacing: '0.15em',
                fontStyle: 'italic',
              }}
            >
              {indicacaoAtiva.codigo}
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}88`, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                link único
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: BRAND.bege,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  fontSize: 13,
                  fontFamily: 'Space Grotesk, monospace',
                  color: BRAND.marrom,
                  overflow: 'auto',
                }}
              >
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {montarLink(indicacaoAtiva.codigo)}
                </span>
                <button
                  onClick={() => copiar(montarLink(indicacaoAtiva.codigo), 'link')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: BRAND.marrom,
                    color: BRAND.bege,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {copiado === 'link' ? <Check size={12} /> : <Copy size={12} />}
                  copiar
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(montarMensagem(indicacaoAtiva.codigo))}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: '14px 20px',
                  borderRadius: 999,
                  background: '#25D366',
                  color: BRAND.branco,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <MessageCircle size={16} /> compartilhar no whatsapp
              </a>
              <button
                onClick={() => compartilhar(indicacaoAtiva.codigo)}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '14px 20px',
                  borderRadius: 999,
                  background: BRAND.rosa,
                  color: BRAND.branco,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Share2 size={16} /> outros canais
              </button>
            </div>
          </motion.div>
        )}

        {gerando && !indicacaoAtiva && (
          <div style={{ marginTop: 24, textAlign: 'center', color: `${BRAND.marrom}66`, fontSize: 13 }}>
            gerando seu link...
          </div>
        )}

        {/* Histórico de indicações */}
        {indicacoes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              marginTop: 32,
              padding: 28,
              background: BRAND.branco,
              borderRadius: 24,
              border: `1px solid ${BRAND.begeEsc}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Gift size={16} style={{ color: BRAND.rosa }} />
              <div className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                minhas indicações
              </div>
            </div>
            <AnimatePresence>
              {indicacoes.map((ind, i) => {
                const convertida = ind.status === 'CONVERTIDA';
                return (
                  <motion.div
                    key={ind.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 0',
                      borderBottom: i < indicacoes.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                    }}
                  >
                    <div
                      className="font-mono"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: BRAND.bege,
                        color: BRAND.marrom,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {ind.codigo}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: BRAND.marrom }}>
                        {ind.indicadoEmail ?? <span style={{ fontStyle: 'italic', opacity: 0.6 }}>sem destinatário</span>}
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}66`, marginTop: 2 }}>
                        criado em {new Date(ind.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span
                      className="font-mono"
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        background: convertida ? `${BRAND.rosa}22` : BRAND.bege,
                        color: convertida ? BRAND.rosa : `${BRAND.marrom}88`,
                      }}
                    >
                      {convertida ? 'convertida 🎉' : 'pendente'}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
