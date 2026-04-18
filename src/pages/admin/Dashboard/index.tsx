import { Link } from 'react-router-dom';
import { BRAND } from '../../../styles/brand';

const CARDS = [
  { to: '/admin/pedidos', titulo: 'Pedidos', descricao: 'Fila de produção e entrega' },
  { to: '/admin/producao', titulo: 'Produção', descricao: 'Slots e capacidade' },
  { to: '/admin/balcao', titulo: 'Balcão', descricao: 'Vendas rápidas no local' },
  { to: '/admin/estoque', titulo: 'Estoque', descricao: 'Insumos e reposição' },
  { to: '/admin/cupons', titulo: 'Cupons', descricao: 'Campanhas e promoções' },
  { to: '/admin/relatorios', titulo: 'Relatórios', descricao: 'Vendas e indicadores' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display text-5xl font-black text-brand-marrom mb-2">Painel</h1>
        <p className="text-brand-marrom/60 mb-10">Delicias da Vann · Administração</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="bg-white rounded-3xl p-8 border-2 border-brand-rosa/20 shadow hover:shadow-xl transition-shadow"
            >
              <div className="font-display text-2xl font-bold text-brand-marrom">{c.titulo}</div>
              <div className="text-sm text-brand-marrom/60 mt-2">{c.descricao}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
