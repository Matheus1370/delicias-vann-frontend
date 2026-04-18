import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyOrders, useReorder } from '../../hooks/useOrders';
import { BRAND } from '../../styles/brand';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando', color: '#B5651D', bg: '#FFF3D4' },
  PAGO: { label: 'Pago', color: '#3355BB', bg: '#E8F0FF' },
  EM_PRODUCAO: { label: 'Em produção', color: '#B5651D', bg: '#FFF0E8' },
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
    <div className="min-h-screen bg-brand-bege font-body px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-8">
          Meus pedidos
        </h1>

        {isLoading ? (
          <div className="text-center text-brand-marrom/50 py-16">Carregando...</div>
        ) : pedidos.length === 0 ? (
          <div className="text-center text-brand-marrom/60 py-16">
            <div className="font-display text-2xl font-bold text-brand-marrom mb-2">
              Ainda não há pedidos por aqui
            </div>
            <Link
              to="/cardapio"
              className="text-brand-rosa font-bold underline underline-offset-4"
            >
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pedidos.map((p: any, i: number) => {
              const sc = STATUS_LABEL[p.status] ?? { label: p.status, color: '#666', bg: '#EEE' };
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-5"
                  style={{
                    border: `1.5px solid ${BRAND.begeEsc}`,
                    boxShadow: '0 2px 12px rgba(66,39,22,.04)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      to={`/pedidos/${p.id}`}
                      className="font-display font-bold text-brand-marrom"
                    >
                      #{p.id.slice(-6).toUpperCase()}
                    </Link>
                    <div
                      className="px-3 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </div>
                  </div>
                  <div className="text-sm text-brand-marrom/70 mb-2">
                    {p.itens?.map((it: any) => `${it.quantidade}x ${it.produto?.nome}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-brand-marrom/50">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex gap-2">
                      <div className="font-bold text-brand-marrom">
                        R$ {Number(p.valorTotal).toFixed(2).replace('.', ',')}
                      </div>
                      {p.status === 'ENTREGUE' && (
                        <button
                          onClick={() => reorder(p.id)}
                          className="px-3 py-1 rounded-lg text-[10px] font-bold text-white"
                          style={{ background: BRAND.rosa }}
                        >
                          repetir
                        </button>
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
