import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useRascunhosWhatsApp,
} from '../../../hooks/useOrders';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';
import { gerarLinkWhatsApp } from '../../../utils/whatsapp';

const STATUS_CONFIG = {
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
  { value: 'PAGO', label: 'Pago' },
  { value: 'EM_PRODUCAO', label: 'Producao' },
  { value: 'PRONTO', label: 'Pronto' },
  { value: 'EM_ENTREGA', label: 'Entrega' },
];

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('');
  const [view, setView] = useState<'pedidos' | 'rascunhos'>('pedidos');
  const { data, isLoading } = useAdminOrders({ status: filter || undefined });
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { data: rascunhos = [], isLoading: rascunhosLoading } = useRascunhosWhatsApp();

  const pedidos = data?.pedidos ?? [];

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
    </div>
  );
}
