import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useOrder,
  useReorder,
  useCancelarPedidoCliente,
} from '../../hooks/useOrders';
import { useAvaliar } from '../../hooks/useAvaliacoes';
import { BRAND } from '../../styles/brand';

const STEPS = [
  { key: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando pagamento' },
  { key: 'PAGO', label: 'Pagamento confirmado' },
  { key: 'EM_PRODUCAO', label: 'Em produção' },
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
    : '—';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pedido, isLoading, error } = useOrder(id);
  const { mutate: reorder, isPending: reorderPending } = useReorder();
  const { mutate: cancelar, isPending: cancelPending } = useCancelarPedidoCliente();
  const { mutate: avaliar, isPending: avaliarPending } = useAvaliar();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');

  if (isLoading) {
    return (
      <div
        className="min-h-screen font-body flex items-center justify-center"
        style={{ background: BRAND.bege }}
      >
        <div className="text-brand-marrom/60 font-medium">Carregando pedido...</div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div
        className="min-h-screen font-body flex items-center justify-center"
        style={{ background: BRAND.bege }}
      >
        <div className="text-center">
          <div className="font-display text-3xl font-black text-brand-marrom mb-2">
            Pedido não encontrado
          </div>
          <Link
            to="/"
            className="text-brand-rosa font-bold underline underline-offset-4"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const status: string = pedido.status;
  const cancelado = status === 'CANCELADO' || status === 'FALHA_ENTREGA';
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="text-sm text-brand-marrom/60 font-bold hover:text-brand-rosa"
        >
          ← Voltar
        </Link>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-black text-brand-marrom">
              Pedido #{pedido.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-brand-marrom/60 mt-1">
              Feito em {fmtDate(pedido.createdAt)}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-full text-xs font-bold"
            style={{
              background: cancelado ? '#FFE8E8' : BRAND.rosa,
              color: cancelado ? '#CC0000' : 'white',
            }}
          >
            {cancelado ? 'Cancelado' : STEPS[currentIdx]?.label ?? status}
          </div>
        </div>

        {!cancelado && (
          <div
            className="mt-10 bg-white rounded-3xl p-8"
            style={{
              border: `2px solid ${BRAND.begeEsc}`,
              boxShadow: '0 4px 24px rgba(66,39,22,.06)',
            }}
          >
            <div className="font-display text-lg font-bold text-brand-marrom mb-6">
              Acompanhe a produção
            </div>
            <div className="flex flex-col gap-4">
              {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{
                        background: done ? BRAND.rosa : BRAND.begeEsc,
                        color: done ? 'white' : BRAND.marrom,
                      }}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <div
                      className="font-medium"
                      style={{
                        color: active
                          ? BRAND.marrom
                          : done
                            ? BRAND.marrom
                            : '#9a8478',
                        fontWeight: active ? 800 : done ? 700 : 500,
                      }}
                    >
                      {step.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {pedido.pagamento?.status === 'PENDENTE' && pedido.pagamento?.pixCopiaCola && (
          <div
            className="mt-6 bg-white rounded-3xl p-6"
            style={{ border: `2px dashed ${BRAND.rosa}` }}
          >
            <div className="font-display font-bold text-brand-marrom mb-2">
              Pagamento via Pix
            </div>
            {pedido.pagamento.pixQrCodeUrl && (
              <img
                src={pedido.pagamento.pixQrCodeUrl}
                alt="QR Code Pix"
                className="w-48 h-48 mx-auto my-4"
              />
            )}
            <div className="bg-brand-bege rounded-xl p-3 text-xs break-all text-brand-marrom/80">
              {pedido.pagamento.pixCopiaCola}
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(pedido.pagamento.pixCopiaCola)
              }
              className="mt-3 w-full py-3 rounded-xl font-bold text-white"
              style={{ background: BRAND.rosa }}
            >
              Copiar código Pix
            </button>
          </div>
        )}

        <div
          className="mt-6 bg-white rounded-3xl p-6"
          style={{ border: `2px solid ${BRAND.begeEsc}` }}
        >
          <div className="font-display font-bold text-brand-marrom mb-4">Itens</div>
          <div className="flex flex-col gap-3">
            {pedido.itens?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-brand-bege pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <div className="font-bold text-brand-marrom">
                    {item.quantidade}× {item.produto?.nome}
                  </div>
                  {item.personalizacao && (
                    <div className="text-xs text-brand-marrom/60 mt-0.5">
                      {item.personalizacao}
                    </div>
                  )}
                </div>
                <div className="font-bold text-brand-marrom">
                  {currency(Number(item.precoUnitario) * item.quantidade)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-2 border-brand-bege flex justify-between">
            <div className="font-display font-bold text-brand-marrom">Total</div>
            <div className="font-display text-xl font-black text-brand-marrom">
              {currency(pedido.valorTotal)}
            </div>
          </div>
        </div>

        {pedido.reservaProducao?.slot && (
          <div
            className="mt-6 bg-white rounded-3xl p-6"
            style={{ border: `2px solid ${BRAND.begeEsc}` }}
          >
            <div className="font-display font-bold text-brand-marrom mb-2">
              Janela de produção
            </div>
            <div className="text-brand-marrom/80">
              {fmtDate(pedido.reservaProducao.slot.horaInicio)} —{' '}
              {fmtDate(pedido.reservaProducao.slot.horaFim)}
            </div>
          </div>
        )}

        {pedido.entrega?.trackingCode && (
          <div
            className="mt-6 bg-white rounded-3xl p-6"
            style={{ border: `2px solid ${BRAND.begeEsc}` }}
          >
            <div className="font-display font-bold text-brand-marrom mb-2">
              Entrega
            </div>
            <div className="text-sm text-brand-marrom/70">
              Código de rastreio:{' '}
              <span className="font-mono font-bold text-brand-marrom">
                {pedido.entrega.trackingCode}
              </span>
            </div>
            {pedido.entrega.previsaoEntrega && (
              <div className="text-sm text-brand-marrom/70 mt-1">
                Previsão: {fmtDate(pedido.entrega.previsaoEntrega)}
              </div>
            )}
          </div>
        )}

        {status === 'ENTREGUE' && !pedido.avaliacao && (
          <div
            className="mt-6 bg-white rounded-3xl p-6"
            style={{ border: `2px solid ${BRAND.rosa}` }}
          >
            <div className="font-display font-bold text-brand-marrom mb-3">
              Como foi sua experiência?
            </div>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNota(n)}
                  className="text-3xl transition-transform hover:scale-110"
                  style={{ filter: n <= nota ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conta pra gente como foi (opcional)"
              className="w-full p-3 rounded-xl text-sm font-medium resize-none"
              style={{
                background: BRAND.bege,
                border: `1.5px solid ${BRAND.begeEsc}`,
                minHeight: 72,
              }}
            />
            <button
              disabled={nota === 0 || avaliarPending}
              onClick={() =>
                avaliar({ pedidoId: pedido.id, nota, comentario: comentario || undefined })
              }
              className="mt-3 w-full py-3 rounded-xl font-bold text-white disabled:opacity-40"
              style={{ background: BRAND.rosa }}
            >
              Enviar avaliação
            </button>
          </div>
        )}

        {pedido.avaliacao && (
          <div
            className="mt-6 bg-white rounded-3xl p-6"
            style={{ border: `2px solid ${BRAND.begeEsc}` }}
          >
            <div className="font-display font-bold text-brand-marrom mb-2">
              Sua avaliação
            </div>
            <div className="text-2xl">
              {'⭐'.repeat(pedido.avaliacao.nota)}
            </div>
            {pedido.avaliacao.comentario && (
              <div className="text-sm text-brand-marrom/70 mt-2 italic">
                “{pedido.avaliacao.comentario}”
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {['AGUARDANDO_PAGAMENTO', 'PAGO'].includes(status) && (
            <button
              onClick={() => {
                if (confirm('Tem certeza que quer cancelar?')) {
                  cancelar({ id: pedido.id, motivo: 'Cancelado pelo cliente' });
                }
              }}
              disabled={cancelPending}
              className="w-full py-3 rounded-xl font-bold"
              style={{
                background: '#FFE8E8',
                color: '#CC0000',
                border: '1.5px solid #FFB4B4',
              }}
            >
              Cancelar pedido
            </button>
          )}

          {status === 'ENTREGUE' && (
            <button
              onClick={() =>
                reorder(pedido.id, {
                  onSuccess: (novo: any) => navigate(`/pedidos/${novo.id}`),
                })
              }
              disabled={reorderPending}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: BRAND.rosa }}
            >
              {reorderPending ? 'Criando...' : 'Repetir este pedido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
