import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useOrder,
  useReorder,
  useCancelarPedidoCliente,
} from '../../hooks/useOrders';
import { useAvaliar } from '../../hooks/useAvaliacoes';
import { useMinhasOcasioes, useCriarOcasiao } from '../../hooks/useOcasioes';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';
import { Calendar } from 'lucide-react';

const STEPS = [
  { key: 'AGUARDANDO_AVALIACAO_COMPLEXIDADE', label: 'Avaliando referência' },
  { key: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando pagamento' },
  { key: 'PAGO', label: 'Pagamento confirmado' },
  { key: 'EM_PRODUCAO', label: 'Em producao' },
  { key: 'PRONTO', label: 'Pronto' },
  { key: 'EM_ENTREGA', label: 'Saiu para entrega' },
  { key: 'ENTREGUE', label: 'Entregue' },
] as const;

const currency = (v: number | string) =>
  `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '\u2014';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pedido, isLoading, error } = useOrder(id);
  const { mutate: reorder, isPending: reorderPending } = useReorder();
  const { mutate: cancelar, isPending: cancelPending } = useCancelarPedidoCliente();
  const { mutate: avaliar, isPending: avaliarPending } = useAvaliar();
  const { data: minhasOcasioes = [] } = useMinhasOcasioes();
  const { mutate: criarOcasiao, isPending: criandoOcasiao } = useCriarOcasiao();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [tituloOcasiao, setTituloOcasiao] = useState('');

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BRAND.bege,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="font-display"
          style={{ color: BRAND.marrom, opacity: 0.4, fontStyle: 'italic', fontSize: 20 }}
        >
          carregando pedido...
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BRAND.bege,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Star11 size={48} color={BRAND.begeEsc} fill={BRAND.begeEsc} stroke={0} />
        <div
          className="font-display"
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontStyle: 'italic',
            color: BRAND.marrom,
            fontWeight: 700,
          }}
        >
          ops, nada por aqui...
        </div>
        <Link
          to="/"
          style={{
            padding: '14px 32px',
            borderRadius: 999,
            background: BRAND.rosa,
            color: BRAND.branco,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          voltar para o inicio
        </Link>
      </div>
    );
  }

  const status: string = pedido.status;
  const cancelado = status === 'CANCELADO' || status === 'FALHA_ENTREGA';
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bege, padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Link
            to="/pedidos"
            className="font-mono"
            style={{
              fontSize: 12,
              color: BRAND.marrom,
              opacity: 0.6,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            &#8592; voltar aos pedidos
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div>
            <div
              className="font-mono"
              style={{
                fontSize: 12,
                color: BRAND.rosa,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              &#10022; acompanhamento
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 700,
                fontStyle: 'italic',
                color: BRAND.marrom,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
              }}
            >
              pedido <span style={{ color: BRAND.rosa }}>#{pedido.id.slice(-6).toUpperCase()}</span>
            </h1>
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                color: BRAND.marrom,
                opacity: 0.5,
                letterSpacing: '0.06em',
                marginTop: 8,
              }}
            >
              feito em {fmtDate(pedido.createdAt)}
            </div>
          </div>

          <div
            className="font-mono"
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: cancelado ? '#FFE8E8' : BRAND.rosa,
              color: cancelado ? '#CC0000' : BRAND.branco,
            }}
          >
            {cancelado ? 'cancelado' : STEPS[currentIdx]?.label ?? status}
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Foto do bolo pronto */}
            {pedido.fotosEntrega && pedido.fotosEntrega.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: `1px solid ${BRAND.begeEsc}`,
                  boxShadow: `0 12px 32px ${BRAND.rosa}1a`,
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4/3', background: BRAND.bege }}>
                  <img
                    src={pedido.fotosEntrega[0].url}
                    alt="Seu bolo pronto"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: BRAND.rosa,
                      color: BRAND.branco,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    pronto pra você
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      fontStyle: 'italic',
                      color: BRAND.marrom,
                      lineHeight: 1.2,
                    }}
                  >
                    olha como ficou <span style={{ color: BRAND.rosa }}>✨</span>
                  </div>
                  {pedido.fotosEntrega[0].legenda && (
                    <p style={{ fontSize: 14, color: `${BRAND.marrom}aa`, marginTop: 8, lineHeight: 1.45 }}>
                      {pedido.fotosEntrega[0].legenda}
                    </p>
                  )}
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: `${BRAND.marrom}66`,
                      letterSpacing: '0.06em',
                      marginTop: 10,
                    }}
                  >
                    enviada em {fmtDate(pedido.fotosEntrega[0].enviadaEm)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            {!cancelado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 28,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 24,
                  }}
                >
                  acompanhe a producao
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {STEPS.map((step, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const isLast = i === STEPS.length - 1;
                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{ display: 'flex', gap: 16 }}
                      >
                        {/* Dot + line */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 24,
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: active ? 24 : 16,
                              height: active ? 24 : 16,
                              borderRadius: '50%',
                              background: done ? BRAND.rosa : BRAND.begeEsc,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: BRAND.branco,
                              fontSize: 10,
                              fontWeight: 800,
                              transition: 'all 0.3s',
                              boxShadow: active ? `0 0 0 4px ${BRAND.rosa}33` : 'none',
                            }}
                          >
                            {done && '\u2713'}
                          </div>
                          {!isLast && (
                            <div
                              style={{
                                width: 2,
                                height: 28,
                                background: done && i < currentIdx ? BRAND.rosa : BRAND.begeEsc,
                                transition: 'background 0.3s',
                              }}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <div
                          style={{
                            paddingBottom: isLast ? 0 : 16,
                            fontSize: 14,
                            fontWeight: active ? 800 : done ? 600 : 400,
                            color: active ? BRAND.marrom : done ? BRAND.marrom : `${BRAND.marrom}88`,
                            lineHeight: active ? '24px' : '16px',
                          }}
                        >
                          {step.label}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Aguardando avaliação de complexidade — orçamento extra antes do pagamento */}
            {status === 'AGUARDANDO_AVALIACAO_COMPLEXIDADE' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: BRAND.ciano + '22',
                  border: `2px solid ${BRAND.ciano}`,
                  borderRadius: 20,
                  padding: 24,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Space Grotesk',
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: BRAND.marrom,
                    opacity: 0.7,
                    marginBottom: 6,
                  }}
                >
                  avaliando sua referência
                </div>
                <h3 style={{ fontFamily: 'Fraunces', fontSize: 24, fontWeight: 500, color: BRAND.marrom, margin: 0 }}>
                  pagamento sai depois do orçamento
                </h3>
                <p style={{ fontFamily: 'Quicksand', fontSize: 14, color: BRAND.marrom, opacity: 0.8, marginTop: 10, lineHeight: 1.5 }}>
                  a foto que você mandou exige uma análise rápida — em até 2h a confeiteira define
                  o custo extra (se houver) e libera o link Pix aqui mesmo. <strong>nada é cobrado antes da sua confirmação.</strong>
                </p>
              </motion.div>
            )}

            {/* PIX payment - dark card */}
            {pedido.pagamento?.status === 'PENDENTE' && pedido.pagamento?.pixCopiaCola && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  background: BRAND.marrom,
                  borderRadius: 24,
                  padding: 28,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                  }}
                >
                  pagamento via pix
                </div>

                {pedido.pagamento.pixQrCodeUrl && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img
                      src={pedido.pagamento.pixQrCodeUrl}
                      alt="QR Code Pix"
                      style={{
                        width: 180,
                        height: 180,
                        borderRadius: 16,
                        background: BRAND.branco,
                        padding: 8,
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    background: `${BRAND.bege}18`,
                    borderRadius: 16,
                    padding: 14,
                    fontSize: 11,
                    color: BRAND.bege,
                    opacity: 0.8,
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                    fontFamily: 'monospace',
                  }}
                >
                  {pedido.pagamento.pixCopiaCola}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigator.clipboard.writeText(pedido.pagamento.pixCopiaCola)
                  }
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '14px 24px',
                    borderRadius: 999,
                    background: BRAND.rosa,
                    color: BRAND.branco,
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  copiar codigo pix
                </motion.button>
              </motion.div>
            )}

            {/* Production window */}
            {pedido.reservaProducao?.slot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  janela de producao
                </div>
                <div style={{ fontSize: 14, color: BRAND.marrom, opacity: 0.8 }}>
                  {fmtDate(pedido.reservaProducao.slot.horaInicio)} \u2014{' '}
                  {fmtDate(pedido.reservaProducao.slot.horaFim)}
                </div>
              </motion.div>
            )}

            {/* Janela festa/despacho */}
            {pedido.horaFestaPrevista && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  sua janela
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, color: `${BRAND.marrom}99` }}>🎉 festa</span>
                    <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: BRAND.marrom }}>
                      {fmtDate(pedido.horaFestaPrevista)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, color: `${BRAND.marrom}99` }}>📦 despacho</span>
                    <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: BRAND.rosa }}>
                      {fmtDate(pedido.dataAgendamento)}
                    </span>
                  </div>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}77`, letterSpacing: '0.05em' }}>
                  bolo sai {pedido.bufferHorasAntes}h antes da festa
                </div>
              </motion.div>
            )}

            {/* Guardar ocasiao */}
            {pedido.horaFestaPrevista &&
              ['PAGO', 'EM_PRODUCAO', 'PRONTO', 'EM_ENTREGA', 'ENTREGUE'].includes(status) &&
              !minhasOcasioes.some((o) => o.pedidoOriginalId === pedido.id) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.27 }}
                  style={{
                    background: `${BRAND.rosa}0c`,
                    borderRadius: 24,
                    padding: 24,
                    border: `1.5px dashed ${BRAND.rosa}55`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Calendar size={16} style={{ color: BRAND.rosa }} />
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        color: BRAND.rosa,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      essa data se repete?
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: `${BRAND.marrom}aa`, lineHeight: 1.5, marginBottom: 14 }}>
                    Se for, a gente te avisa <strong>60 dias antes</strong> no ano que vem pra você reservar o bolo a tempo.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="ex: aniversário da Sofia"
                      value={tituloOcasiao}
                      onChange={(e) => setTituloOcasiao(e.target.value)}
                      maxLength={60}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${BRAND.begeEsc}`,
                        background: BRAND.branco,
                        fontSize: 13,
                        color: BRAND.marrom,
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!tituloOcasiao.trim()) return;
                        const data = new Date(pedido.horaFestaPrevista);
                        const mm = String(data.getMonth() + 1).padStart(2, '0');
                        const dd = String(data.getDate()).padStart(2, '0');
                        criarOcasiao(
                          {
                            titulo: tituloOcasiao.trim(),
                            diaMes: `${mm}-${dd}`,
                            pedidoOriginalId: pedido.id,
                            ano: data.getFullYear(),
                          },
                          { onSuccess: () => setTituloOcasiao('') },
                        );
                      }}
                      disabled={!tituloOcasiao.trim() || criandoOcasiao}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 999,
                        background: tituloOcasiao.trim() ? BRAND.rosa : BRAND.begeEsc,
                        color: tituloOcasiao.trim() ? BRAND.branco : `${BRAND.marrom}66`,
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: tituloOcasiao.trim() && !criandoOcasiao ? 'pointer' : 'not-allowed',
                      }}
                    >
                      guardar
                    </button>
                  </div>
                </motion.div>
              )}

            {/* Politica de reembolso enquanto cancelavel */}
            {['AGUARDANDO_PAGAMENTO', 'PAGO'].includes(status) && pedido.dataAgendamento && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  política de cancelamento
                </div>
                {(() => {
                  const despacho = new Date(pedido.dataAgendamento);
                  const janela = pedido.janelaReembolsoHoras ?? 48;
                  const limiteTotal = new Date(despacho.getTime() - janela * 60 * 60 * 1000);
                  const limiteParcial = new Date(despacho.getTime() - (janela / 2) * 60 * 60 * 1000);
                  return (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li style={{ fontSize: 13, color: BRAND.marrom, lineHeight: 1.45 }}>
                        🟢 100% reembolsável até <strong>{fmtDate(limiteTotal.toISOString())}</strong>
                      </li>
                      <li style={{ fontSize: 13, color: BRAND.marrom, lineHeight: 1.45 }}>
                        🟡 50% + 50% em crédito até <strong>{fmtDate(limiteParcial.toISOString())}</strong>
                      </li>
                      <li style={{ fontSize: 13, color: BRAND.marrom, lineHeight: 1.45 }}>
                        🔴 sem reembolso depois disso
                      </li>
                    </ul>
                  );
                })()}
              </motion.div>
            )}

            {/* Reembolso confirmado (CANCELADO) */}
            {status === 'CANCELADO' && pedido.valorReembolso != null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: '#CC0000',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  reembolso
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: `${BRAND.marrom}99` }}>valor reembolsado</span>
                  <span className="font-display" style={{ fontSize: 20, fontWeight: 800, color: BRAND.marrom }}>
                    R$ {Number(pedido.valorReembolso).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {pedido.valorCreditoFuturo != null && Number(pedido.valorCreditoFuturo) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: `${BRAND.marrom}99` }}>crédito pra próximo pedido</span>
                    <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: BRAND.rosa }}>
                      R$ {Number(pedido.valorCreditoFuturo).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}77`, letterSpacing: '0.05em' }}>
                  o reembolso entra na conta de origem em até 5 dias úteis
                </div>
              </motion.div>
            )}

            {/* Delivery tracking */}
            {pedido.entrega?.trackingCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  entrega
                </div>
                <div style={{ fontSize: 13, color: BRAND.marrom, opacity: 0.7 }}>
                  codigo de rastreio:{' '}
                  <span
                    className="font-mono"
                    style={{ fontWeight: 700, color: BRAND.marrom, opacity: 1 }}
                  >
                    {pedido.entrega.trackingCode}
                  </span>
                </div>
                {pedido.entrega.previsaoEntrega && (
                  <div style={{ fontSize: 13, color: BRAND.marrom, opacity: 0.7, marginTop: 4 }}>
                    previsao: {fmtDate(pedido.entrega.previsaoEntrega)}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Items card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{
                background: BRAND.branco,
                borderRadius: 24,
                padding: 28,
                border: `1px solid ${BRAND.begeEsc}`,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: BRAND.rosa,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                itens do pedido
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pedido.itens?.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: 12,
                      borderBottom: `1px solid ${BRAND.begeEsc}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                        {item.quantidade}\u00d7 {item.produto?.nome}
                      </div>
                      {item.personalizacao && (
                        <div
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            color: BRAND.marrom,
                            opacity: 0.5,
                            marginTop: 4,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.personalizacao}
                        </div>
                      )}
                    </div>
                    <div
                      className="font-display"
                      style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 15 }}
                    >
                      {currency(Number(item.precoUnitario) * item.quantidade)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: `2px solid ${BRAND.begeEsc}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.marrom,
                    opacity: 0.6,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  total
                </div>
                <div
                  className="font-display"
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: BRAND.marrom,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {currency(pedido.valorTotal)}
                </div>
              </div>
            </motion.div>

            {/* Review section */}
            {status === 'ENTREGUE' && !pedido.avaliacao && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 28,
                  border: `2px solid ${BRAND.rosa}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                  }}
                >
                  avaliacao
                </div>
                <div
                  className="font-display"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: BRAND.marrom,
                    marginBottom: 16,
                  }}
                >
                  como foi sua experiencia?
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setNota(n)}
                      style={{
                        fontSize: 28,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        filter: n <= nota ? 'none' : 'grayscale(100%) opacity(0.3)',
                        transition: 'filter 0.2s',
                        padding: 4,
                      }}
                    >
                      \u2b50
                    </motion.button>
                  ))}
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="conta pra gente como foi (opcional)"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 16,
                    border: `1.5px solid ${BRAND.begeEsc}`,
                    background: BRAND.bege,
                    fontSize: 13,
                    color: BRAND.marrom,
                    resize: 'none',
                    minHeight: 72,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={nota === 0 || avaliarPending}
                  onClick={() =>
                    avaliar({ pedidoId: pedido.id, nota, comentario: comentario || undefined })
                  }
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '14px 24px',
                    borderRadius: 999,
                    background: BRAND.rosa,
                    color: BRAND.branco,
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: nota === 0 || avaliarPending ? 'not-allowed' : 'pointer',
                    opacity: nota === 0 || avaliarPending ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  enviar avaliacao
                </motion.button>
              </motion.div>
            )}

            {/* Existing review */}
            {pedido.avaliacao && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: BRAND.branco,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: BRAND.rosa,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  sua avaliacao
                </div>
                <div style={{ fontSize: 24 }}>
                  {'\u2b50'.repeat(pedido.avaliacao.nota)}
                </div>
                {pedido.avaliacao.comentario && (
                  <div
                    className="font-display"
                    style={{
                      fontSize: 14,
                      fontStyle: 'italic',
                      color: BRAND.marrom,
                      opacity: 0.7,
                      marginTop: 10,
                      lineHeight: 1.4,
                    }}
                  >
                    "{pedido.avaliacao.comentario}"
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            marginTop: 32,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {['AGUARDANDO_PAGAMENTO', 'PAGO'].includes(status) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const dataAg = pedido.dataAgendamento
                  ? new Date(pedido.dataAgendamento)
                  : null;
                const janela = pedido.janelaReembolsoHoras ?? 48;
                let aviso = 'Tem certeza que quer cancelar?';
                if (dataAg) {
                  const horas = (dataAg.getTime() - Date.now()) / (60 * 60 * 1000);
                  if (horas >= janela) {
                    aviso = 'Cancelamento com 100% de reembolso. Confirma?';
                  } else if (horas >= janela / 2) {
                    aviso = 'Faltando pouco — reembolso de 50% + 50% em crédito futuro. Confirma?';
                  } else {
                    aviso = 'Sem direito a reembolso nesse prazo. Confirma cancelamento?';
                  }
                }
                if (confirm(aviso)) {
                  cancelar({ id: pedido.id, motivo: 'Cancelado pelo cliente' });
                }
              }}
              disabled={cancelPending}
              style={{
                flex: 1,
                padding: '16px 32px',
                borderRadius: 999,
                background: 'rgba(255,232,232,0.8)',
                color: '#CC0000',
                fontWeight: 700,
                fontSize: 14,
                border: '1.5px solid #FFB4B4',
                cursor: cancelPending ? 'not-allowed' : 'pointer',
                opacity: cancelPending ? 0.5 : 1,
              }}
            >
              cancelar pedido
            </motion.button>
          )}

          {status === 'ENTREGUE' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                reorder(pedido.id, {
                  onSuccess: (novo: any) => navigate(`/pedidos/${novo.id}`),
                })
              }
              disabled={reorderPending}
              style={{
                flex: 1,
                padding: '16px 32px',
                borderRadius: 999,
                background: BRAND.rosa,
                color: BRAND.branco,
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: reorderPending ? 'not-allowed' : 'pointer',
                opacity: reorderPending ? 0.5 : 1,
                boxShadow: `0 8px 24px ${BRAND.rosa}44`,
              }}
            >
              {reorderPending ? 'criando...' : 'repetir este pedido'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
