import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminOrders, useUpdateOrderStatus } from '../../../hooks/useOrders';
import { BRAND } from '../../../styles/brand';

const STATUS_CONFIG = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando', bg: '#FFF3D4', text: '#B5651D' },
  PAGO: { label: 'Pago', bg: '#E8F0FF', text: '#3355BB' },
  EM_PRODUCAO: { label: 'Em Produção', bg: '#FFF0E8', text: '#B5651D' },
  PRONTO: { label: 'Pronto', bg: '#E8F4E8', text: '#2D7A2D' },
  EM_ENTREGA: { label: 'Em Entrega', bg: '#E8F7FC', text: '#1A7B9A' },
  ENTREGUE: { label: 'Entregue', bg: '#F0F0F0', text: '#666' },
  CANCELADO: { label: 'Cancelado', bg: '#FFE8E8', text: '#CC0000' },
} as const;

const NEXT_STATUS: Record<string, string> = {
  PAGO: 'EM_PRODUCAO',
  EM_PRODUCAO: 'PRONTO',
  PRONTO: 'EM_ENTREGA',
  EM_ENTREGA: 'ENTREGUE',
};

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('');
  const { data, isLoading } = useAdminOrders({ status: filter || undefined });
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const pedidos = data?.pedidos ?? [];

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-black text-brand-marrom">Pedidos</h1>
          <div className="flex gap-2">
            {['', 'PAGO', 'EM_PRODUCAO', 'PRONTO', 'EM_ENTREGA'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                style={{
                  background: filter === s ? BRAND.rosa : 'white',
                  color: filter === s ? 'white' : BRAND.marrom,
                  border: `2px solid ${filter === s ? BRAND.rosa : BRAND.begeEsc}`,
                }}
              >
                {s || 'Todos'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-brand-marrom/50 font-medium">
            Carregando pedidos...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
                    className="bg-white rounded-2xl p-5 flex items-center gap-4"
                    style={{
                      border: `1.5px solid ${BRAND.begeEsc}`,
                      boxShadow: '0 2px 12px rgba(66,39,22,.05)',
                    }}
                  >
                    <div className="text-brand-marrom/40 font-bold text-sm w-20">
                      {pedido.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-brand-marrom">{pedido.cliente?.nome}</div>
                      <div className="text-xs text-brand-marrom/60 mt-0.5">
                        {pedido.itens
                          ?.map((it: any) => `${it.quantidade}x ${it.produto?.nome}`)
                          .join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-marrom">
                        R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-xs text-brand-marrom/50">
                        {pedido.reservaProducao?.slot
                          ? new Date(pedido.reservaProducao.slot.horaInicio).toLocaleTimeString(
                              'pt-BR',
                              { hour: '2-digit', minute: '2-digit' },
                            )
                          : '—'}
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{ background: sc?.bg, color: sc?.text }}
                    >
                      {sc?.label}
                    </div>
                    <a
                      href={`/admin/pedidos/${pedido.id}/ficha`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: BRAND.bege,
                        color: BRAND.marrom,
                        border: `1.5px solid ${BRAND.begeEsc}`,
                      }}
                    >
                      Ficha
                    </a>
                    {nextStatus && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateStatus({ id: pedido.id, status: nextStatus })}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: BRAND.rosa }}
                      >
                        Avançar →
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
