import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MessageCircle, Phone, Camera, X as XIcon, ImagePlus } from 'lucide-react';
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useRascunhosWhatsApp,
  useAdicionarFotoPronto,
  useAvaliarComplexidade,
} from '../../../hooks/useOrders';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';
import { gerarLinkWhatsApp } from '../../../utils/whatsapp';
import { arquivoParaDataURL } from '../../../utils/imageResize';

const STATUS_CONFIG = {
  AGUARDANDO_AVALIACAO_COMPLEXIDADE: { label: 'Avaliar custo', bg: BRAND.ciano, text: BRAND.branco },
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando', bg: BRAND.begeEsc, text: BRAND.marrom },
  PAGO: { label: 'Pago', bg: BRAND.ciano, text: BRAND.branco },
  EM_PRODUCAO: { label: 'Em Producao', bg: BRAND.roxo, text: BRAND.branco },
  PRONTO: { label: 'Pronto', bg: BRAND.rosa, text: BRAND.branco },
  EM_ENTREGA: { label: 'Em Entrega', bg: BRAND.ciano, text: BRAND.branco },
  ENTREGUE: { label: 'Entregue', bg: BRAND.marrom, text: BRAND.bege },
  CANCELADO: { label: 'Cancelado', bg: '#DC2626', text: BRAND.branco },
} as const;

const NEXT_STATUS: Record<string, string> = {
  PAGO: 'EM_PRODUCAO',
  EM_PRODUCAO: 'PRONTO',
  PRONTO: 'EM_ENTREGA',
  EM_ENTREGA: 'ENTREGUE',
};

const FILTER_TABS = [
  { value: '', label: 'Todos' },
  { value: 'AGUARDANDO_AVALIACAO_COMPLEXIDADE', label: 'Avaliar custo' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'EM_PRODUCAO', label: 'Producao' },
  { value: 'PRONTO', label: 'Pronto' },
  { value: 'EM_ENTREGA', label: 'Entrega' },
];

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('');
  const [view, setView] = useState<'pedidos' | 'rascunhos'>('pedidos');
  const [fotoModalPedido, setFotoModalPedido] = useState<any | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoLegenda, setFotoLegenda] = useState('');
  const [processandoArquivo, setProcessandoArquivo] = useState(false);
  const [complexidadeModalPedido, setComplexidadeModalPedido] = useState<any | null>(null);
  const [complexidadeForm, setComplexidadeForm] = useState<Record<string, { custo: string; notas: string }>>({});

  const { data, isLoading } = useAdminOrders({ status: filter || undefined });
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { data: rascunhos = [], isLoading: rascunhosLoading } = useRascunhosWhatsApp();
  const { mutateAsync: enviarFoto, isPending: enviandoFoto } = useAdicionarFotoPronto();
  const { mutateAsync: enviarAvaliacao, isPending: enviandoAvaliacao } = useAvaliarComplexidade();

  const pedidos = data?.pedidos ?? [];

  const handleArquivoSelecionado = async (file: File) => {
    setProcessandoArquivo(true);
    try {
      const dataUrl = await arquivoParaDataURL(file);
      setFotoPreview(dataUrl);
    } catch (err: any) {
      toast.error(err?.message ?? 'Não foi possível ler a imagem');
    } finally {
      setProcessandoArquivo(false);
    }
  };

  const enviarFotoPronto = async () => {
    if (!fotoModalPedido || !fotoPreview) return;
    await enviarFoto({
      id: fotoModalPedido.id,
      url: fotoPreview,
      legenda: fotoLegenda || undefined,
    });
    setFotoModalPedido(null);
    setFotoPreview(null);
    setFotoLegenda('');
  };

  const fecharFotoModal = () => {
    setFotoModalPedido(null);
    setFotoPreview(null);
    setFotoLegenda('');
  };

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> gestao de pedidos
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
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
              {view === 'pedidos' ? 'pedidos' : 'leads whatsapp'}
              <span style={{ color: BRAND.rosa }}>.</span>
            </h1>

            {/* View tabs (pedidos | rascunhos) */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setView('pedidos')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${view === 'pedidos' ? BRAND.marrom : BRAND.begeEsc}`,
                  background: view === 'pedidos' ? BRAND.marrom : BRAND.branco,
                  color: view === 'pedidos' ? BRAND.bege : BRAND.marrom,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                pedidos
              </button>
              <button
                onClick={() => setView('rascunhos')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${view === 'rascunhos' ? '#25D366' : BRAND.begeEsc}`,
                  background: view === 'rascunhos' ? '#25D366' : BRAND.branco,
                  color: view === 'rascunhos' ? BRAND.branco : BRAND.marrom,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <MessageCircle size={14} />
                leads whatsapp
                {rascunhos.length > 0 && (
                  <span
                    style={{
                      marginLeft: 4,
                      padding: '1px 8px',
                      borderRadius: 999,
                      background: view === 'rascunhos' ? BRAND.branco : '#25D366',
                      color: view === 'rascunhos' ? '#25D366' : BRAND.branco,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {rascunhos.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Status filter tabs (somente pedidos) */}
          {view === 'pedidos' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {FILTER_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `1.5px solid ${filter === t.value ? BRAND.rosa : BRAND.begeEsc}`,
                    background: filter === t.value ? BRAND.rosa : BRAND.branco,
                    color: filter === t.value ? BRAND.branco : BRAND.marrom,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rascunhos WhatsApp view */}
        {view === 'rascunhos' && (
          rascunhosLoading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77`, fontWeight: 500 }}>
              Carregando rascunhos...
            </div>
          ) : (
            <div
              style={{
                background: BRAND.branco,
                borderRadius: 24,
                border: `1px solid ${BRAND.begeEsc}`,
                padding: 24,
              }}
            >
              {rascunhos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: `${BRAND.marrom}66`, fontSize: 14 }}>
                  Nenhum lead pendente. Quando um cliente clicar em "continuar pelo WhatsApp" no fim do configurador, ele aparece aqui.
                </div>
              ) : (
                <AnimatePresence>
                  {rascunhos.map((r: any, i: number) => {
                    const tel = r.cliente?.telefone ?? '';
                    const adicionais = r.itens
                      .slice(1)
                      .map((it: any) => ({ nome: it.produto?.nome, quantidade: it.quantidade }));
                    const link = tel
                      ? gerarLinkWhatsApp(tel, {
                          produtoNome: r.itens[0]?.produto?.nome ?? 'Pedido',
                          numeroPessoas: r.numeroPessoas ?? undefined,
                          ocasiao: r.ocasiao ?? undefined,
                          opcoesEscolhidas: (r.itens[0]?.opcoesEscolhidas as any) ?? {},
                          personalizacao: r.itens[0]?.personalizacao ?? undefined,
                          adicionais,
                          valorTotal: Number(r.valorTotal),
                          pedidoId: r.id,
                        })
                      : null;
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          padding: '16px 0',
                          borderBottom: i < rascunhos.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <div className="font-mono" style={{ color: `${BRAND.marrom}66`, fontWeight: 700, fontSize: 12, width: 72, flexShrink: 0 }}>
                            {r.id.slice(-6).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                              {r.cliente?.nome}
                            </div>
                            <div style={{ fontSize: 12, color: `${BRAND.marrom}88`, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Phone size={11} />
                              {tel || 'sem telefone cadastrado'}
                            </div>
                            <div style={{ fontSize: 12, color: `${BRAND.marrom}aa`, marginTop: 6 }}>
                              {r.itens.map((it: any) => `${it.quantidade}x ${it.produto?.nome}`).join(', ')}
                            </div>
                            {(r.numeroPessoas || r.ocasiao) && (
                              <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}77`, marginTop: 4, letterSpacing: '0.05em' }}>
                                {r.numeroPessoas ? `${r.numeroPessoas} pessoas` : ''}
                                {r.numeroPessoas && r.ocasiao ? ' · ' : ''}
                                {r.ocasiao ?? ''}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                              R$ {Number(r.valorTotal).toFixed(2).replace('.', ',')}
                            </div>
                            <div style={{ fontSize: 11, color: `${BRAND.marrom}77`, marginTop: 2 }}>
                              {new Date(r.createdAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          {link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 14px',
                                borderRadius: 999,
                                background: '#25D366',
                                color: BRAND.branco,
                                textDecoration: 'none',
                                fontSize: 12,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              <MessageCircle size={14} />
                              retomar conversa
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: `${BRAND.marrom}66`, fontStyle: 'italic', flexShrink: 0 }}>
                              sem telefone
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          )
        )}

        {/* Orders list */}
        {view === 'pedidos' && (isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77`, fontWeight: 500 }}
          >
            Carregando pedidos...
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
            <AnimatePresence>
              {pedidos.map((pedido: any, i: number) => {
                const sc = STATUS_CONFIG[pedido.status as keyof typeof STATUS_CONFIG];
                const nextStatus = NEXT_STATUS[pedido.status];
                return (
                  <motion.div
                    key={pedido.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 0',
                      borderBottom: i < pedidos.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                    }}
                  >
                    {/* Order ID */}
                    <div className="font-mono" style={{ color: `${BRAND.marrom}66`, fontWeight: 700, fontSize: 12, width: 72, flexShrink: 0 }}>
                      {pedido.id.slice(-6).toUpperCase()}
                    </div>

                    {/* Client + items */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                        {pedido.cliente?.nome}
                      </div>
                      <div style={{ fontSize: 12, color: `${BRAND.marrom}88`, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pedido.itens
                          ?.map((it: any) => `${it.quantidade}x ${it.produto?.nome}`)
                          .join(', ')}
                      </div>
                    </div>

                    {/* Value + time */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                        R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}
                      </div>
                      <div style={{ fontSize: 11, color: `${BRAND.marrom}77`, marginTop: 2 }}>
                        {pedido.reservaProducao?.slot
                          ? new Date(pedido.reservaProducao.slot.horaInicio).toLocaleTimeString(
                              'pt-BR',
                              { hour: '2-digit', minute: '2-digit' },
                            )
                          : '\u2014'}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div
                      style={{
                        padding: '5px 12px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        background: sc?.bg,
                        color: sc?.text,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {sc?.label}
                    </div>

                    {/* Ficha link */}
                    <a
                      href={`/admin/pedidos/${pedido.id}/ficha`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '7px 14px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        background: BRAND.bege,
                        color: BRAND.marrom,
                        border: `1.5px solid ${BRAND.begeEsc}`,
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      Ficha
                    </a>

                    {/* Avaliar complexidade button */}
                    {pedido.status === 'AGUARDANDO_AVALIACAO_COMPLEXIDADE' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setComplexidadeModalPedido(pedido)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          color: BRAND.branco,
                          background: BRAND.ciano,
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                        title="Avaliar custo extra do pedido com foto de referência"
                      >
                        avaliar custo
                      </motion.button>
                    )}

                    {/* Foto pronto button (quando status=PRONTO) */}
                    {pedido.status === 'PRONTO' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFotoModalPedido(pedido)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          color: BRAND.branco,
                          background: BRAND.marrom,
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                        title="Enviar foto do bolo pronto pro cliente"
                      >
                        <Camera size={13} />
                        foto
                      </motion.button>
                    )}

                    {/* Advance button */}
                    {nextStatus && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateStatus({ id: pedido.id, status: nextStatus })}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          color: BRAND.branco,
                          background: BRAND.rosa,
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        Avancar →
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {pedidos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: `${BRAND.marrom}66`, fontSize: 14 }}>
                Nenhum pedido encontrado.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Foto pronto modal */}
      <AnimatePresence>
        {fotoModalPedido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fecharFotoModal}
            style={{
              position: 'fixed',
              inset: 0,
              background: `${BRAND.marrom}aa`,
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: BRAND.branco,
                borderRadius: 24,
                padding: 28,
                width: '100%',
                maxWidth: 460,
                position: 'relative',
              }}
            >
              <button
                onClick={fecharFotoModal}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: BRAND.bege,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.marrom,
                }}
                aria-label="Fechar"
              >
                <XIcon size={16} />
              </button>

              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: BRAND.rosa,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                pedido #{fotoModalPedido.id.slice(-6).toUpperCase()}
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: BRAND.marrom,
                  margin: '0 0 18px',
                }}
              >
                foto do <span style={{ color: BRAND.rosa }}>bolo pronto</span>
              </h2>

              {fotoPreview ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={fotoPreview}
                    alt="preview"
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      border: `1px solid ${BRAND.begeEsc}`,
                      display: 'block',
                    }}
                  />
                  <button
                    onClick={() => setFotoPreview(null)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: `${BRAND.marrom}cc`,
                      color: BRAND.bege,
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    trocar
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '36px 16px',
                    borderRadius: 16,
                    border: `2px dashed ${BRAND.rosa}66`,
                    background: `${BRAND.rosa}06`,
                    cursor: processandoArquivo ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <ImagePlus size={32} style={{ color: BRAND.rosa }} />
                  <div
                    className="font-display"
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: BRAND.marrom,
                    }}
                  >
                    {processandoArquivo ? 'processando...' : 'escolher foto do celular'}
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: `${BRAND.marrom}77`,
                      letterSpacing: '0.05em',
                    }}
                  >
                    redimensionada automaticamente
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    disabled={processandoArquivo}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleArquivoSelecionado(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}

              <textarea
                value={fotoLegenda}
                onChange={(e) => setFotoLegenda(e.target.value)}
                placeholder="legenda (opcional) — ex: sai daqui em 30min!"
                maxLength={140}
                style={{
                  width: '100%',
                  minHeight: 64,
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 14,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  background: BRAND.bege,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: BRAND.marrom,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}66`, marginTop: 4, textAlign: 'right' }}>
                {fotoLegenda.length}/140
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  onClick={fecharFotoModal}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 999,
                    background: 'transparent',
                    border: `2px solid ${BRAND.begeEsc}`,
                    color: BRAND.marrom,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  cancelar
                </button>
                <motion.button
                  whileHover={{ scale: fotoPreview && !enviandoFoto ? 1.02 : 1 }}
                  whileTap={{ scale: fotoPreview && !enviandoFoto ? 0.98 : 1 }}
                  onClick={enviarFotoPronto}
                  disabled={!fotoPreview || enviandoFoto}
                  style={{
                    flex: 2,
                    padding: '12px 20px',
                    borderRadius: 999,
                    background: fotoPreview ? BRAND.rosa : BRAND.begeEsc,
                    color: fotoPreview ? BRAND.branco : `${BRAND.marrom}66`,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: fotoPreview && !enviandoFoto ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s',
                  }}
                >
                  {enviandoFoto ? 'enviando...' : 'enviar pro cliente'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avaliar complexidade modal */}
      <AnimatePresence>
        {complexidadeModalPedido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setComplexidadeModalPedido(null);
              setComplexidadeForm({});
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: `${BRAND.marrom}aa`,
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: BRAND.bege,
                borderRadius: 24,
                padding: 32,
                maxWidth: 760,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setComplexidadeModalPedido(null);
                  setComplexidadeForm({});
                }}
                aria-label="Fechar"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: '#FFF',
                  cursor: 'pointer',
                }}
              >
                <XIcon size={18} />
              </button>
              <h2
                style={{
                  fontFamily: 'Fraunces',
                  fontSize: 28,
                  fontWeight: 500,
                  color: BRAND.marrom,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                avaliar custo extra
              </h2>
              <p style={{ fontFamily: 'Quicksand', fontSize: 13, color: BRAND.marrom, opacity: 0.65, marginTop: 0, marginBottom: 24 }}>
                pedido <strong>{complexidadeModalPedido.id.slice(-6).toUpperCase()}</strong> ·{' '}
                {complexidadeModalPedido.cliente?.nome} · só itens com foto de referência precisam de avaliação
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {complexidadeModalPedido.itens
                  ?.filter((it: any) => (it.imagensReferencia?.length ?? 0) > 0)
                  .map((item: any) => {
                    const form = complexidadeForm[item.id] ?? { custo: '', notas: '' };
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#FFF',
                          borderRadius: 16,
                          padding: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <div style={{ fontFamily: 'Quicksand', fontWeight: 700, color: BRAND.marrom }}>
                          {item.quantidade}x {item.produto?.nome ?? 'item'}
                        </div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                          {(item.imagensReferencia ?? []).map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`referência ${idx + 1}`}
                              style={{
                                width: 96,
                                height: 96,
                                objectFit: 'cover',
                                borderRadius: 12,
                                flexShrink: 0,
                                border: `2px solid ${BRAND.begeEsc}`,
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10 }}>
                          <div>
                            <label
                              style={{
                                fontFamily: 'Space Grotesk',
                                fontSize: 10,
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                                color: BRAND.marrom,
                                opacity: 0.7,
                                display: 'block',
                                marginBottom: 4,
                              }}
                            >
                              custo extra (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={form.custo}
                              onChange={(e) =>
                                setComplexidadeForm({
                                  ...complexidadeForm,
                                  [item.id]: { ...form, custo: e.target.value },
                                })
                              }
                              placeholder="0,00"
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: `1.5px solid ${BRAND.begeEsc}`,
                                fontFamily: 'Quicksand',
                                fontSize: 14,
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontFamily: 'Space Grotesk',
                                fontSize: 10,
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                                color: BRAND.marrom,
                                opacity: 0.7,
                                display: 'block',
                                marginBottom: 4,
                              }}
                            >
                              notas (opcional)
                            </label>
                            <input
                              value={form.notas}
                              onChange={(e) =>
                                setComplexidadeForm({
                                  ...complexidadeForm,
                                  [item.id]: { ...form, notas: e.target.value },
                                })
                              }
                              placeholder="decoração elaborada, biscuit..."
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: `1.5px solid ${BRAND.begeEsc}`,
                                fontFamily: 'Quicksand',
                                fontSize: 14,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  const avaliacoes = Object.entries(complexidadeForm)
                    .filter(([, v]) => v.custo.trim() !== '')
                    .map(([itemId, v]) => ({
                      itemId,
                      custoComplexidade: parseFloat(v.custo) || 0,
                      complexidadeNotas: v.notas || undefined,
                    }));
                  if (avaliacoes.length === 0) {
                    toast.error('Informe pelo menos um custo');
                    return;
                  }
                  await enviarAvaliacao({ id: complexidadeModalPedido.id, avaliacoes });
                  setComplexidadeModalPedido(null);
                  setComplexidadeForm({});
                }}
                disabled={enviandoAvaliacao}
                style={{
                  marginTop: 24,
                  width: '100%',
                  padding: '14px',
                  borderRadius: 999,
                  background: BRAND.rosa,
                  color: '#FFF',
                  border: 'none',
                  fontFamily: 'Quicksand',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  opacity: enviandoAvaliacao ? 0.5 : 1,
                }}
              >
                {enviandoAvaliacao ? 'enviando...' : 'liberar pagamento'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
