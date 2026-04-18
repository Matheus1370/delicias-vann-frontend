import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cart.store';
import { BRAND } from '../../styles/brand';

const WHATSAPP = '5511982813152';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600';

export default function Catalog() {
  const [categoria, setCategoria] = useState<string | undefined>();
  const [qtds, setQtds] = useState<Record<string, number>>({});
  const { data: produtos = [], isLoading } = useProducts({ categoria });
  const { data: categorias = [] } = useCategories();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const categoriasVisiveis = useMemo(
    () => categorias.filter((c: any) => c.slug !== 'adicionais'),
    [categorias],
  );

  const produtosVisiveis = useMemo(
    () => produtos.filter((p: any) => p.tipo !== 'ADICIONAL'),
    [produtos],
  );

  const pedirWhatsApp = (produto: any) => {
    const msg = `Olá! Quero saber mais sobre: ${produto.nome}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getQtd = (id: string) => qtds[id] ?? 1;

  const setQtd = (id: string, value: number) => {
    if (value < 1) return;
    setQtds((prev) => ({ ...prev, [id]: value }));
  };

  const inCart = (id: string) => cartItems.find((i) => i.produtoId === id);

  const adicionarSimples = (p: any) => {
    const qty = getQtd(p.id);
    addItem({
      produtoId: p.id,
      nome: p.nome,
      precoUnitario: Number(p.precoVenda),
      pontosEsforco: p.pontosEsforco,
      quantidade: qty,
    });
    toast.success(`${p.nome} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-5xl font-black text-brand-marrom mb-3 text-center">
          Cardápio
        </h1>
        <p className="text-center text-brand-marrom/60 mb-8 font-medium">
          Feito com carinho pela Vann · entrega em toda SP
        </p>

        <div className="flex gap-2 justify-center mb-10 flex-wrap">
          <button
            onClick={() => setCategoria(undefined)}
            className="px-4 py-2 rounded-full text-xs font-bold"
            style={{
              background: !categoria ? BRAND.rosa : 'white',
              color: !categoria ? 'white' : BRAND.marrom,
              border: `2px solid ${!categoria ? BRAND.rosa : BRAND.begeEsc}`,
            }}
          >
            Todos
          </button>
          {categoriasVisiveis.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setCategoria(c.slug)}
              className="px-4 py-2 rounded-full text-xs font-bold"
              style={{
                background: categoria === c.slug ? BRAND.rosa : 'white',
                color: categoria === c.slug ? 'white' : BRAND.marrom,
                border: `2px solid ${categoria === c.slug ? BRAND.rosa : BRAND.begeEsc}`,
              }}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-brand-marrom/50 py-16">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosVisiveis.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-3xl overflow-hidden"
                style={{
                  border: `2px solid ${BRAND.begeEsc}`,
                  boxShadow: '0 4px 24px rgba(66,39,22,.05)',
                }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-brand-bege relative">
                  <img
                    src={p.imagemUrl ?? FALLBACK_IMG}
                    alt={p.nome}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {p.tipo === 'MONTAVEL' && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ background: BRAND.rosa }}
                    >
                      monte o seu
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="font-display text-xl font-bold text-brand-marrom">
                    {p.nome}
                  </div>
                  {p.descricao && (
                    <p className="text-brand-marrom/60 text-sm mt-1 line-clamp-2">
                      {p.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-[10px] text-brand-marrom/60 font-bold uppercase">
                    <span>pronto em {p.leadTimeHoras}h</span>
                    {p.alergenicos?.length > 0 && (
                      <>
                        <span>·</span>
                        <span>contém {p.alergenicos.join(', ')}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-brand-marrom/50 font-bold uppercase">
                          a partir de
                        </div>
                        <div
                          className="font-display text-2xl font-black"
                          style={{ color: BRAND.rosa }}
                        >
                          R$ {Number(p.precoVenda).toFixed(2).replace('.', ',')}
                        </div>
                      </div>

                      {p.tipo === 'MONTAVEL' ? (
                        <Link
                          to="/montar"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                          style={{ background: BRAND.rosa }}
                        >
                          Montar →
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setQtd(p.id, getQtd(p.id) - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-brand-begeEsc text-brand-marrom"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-brand-marrom">
                              {getQtd(p.id)}
                            </span>
                            <button
                              onClick={() => setQtd(p.id, getQtd(p.id) + 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-brand-begeEsc text-brand-marrom"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => adicionarSimples(p)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                            style={{ background: BRAND.rosa }}
                          >
                            + carrinho
                          </button>
                        </div>
                      )}
                    </div>
                    {inCart(p.id) && (
                      <div className="text-[10px] font-bold text-brand-marrom/60 mt-1 text-right">
                        No carrinho ({inCart(p.id)!.quantidade})
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => pedirWhatsApp(p)}
                    className="mt-3 w-full py-2 rounded-xl text-xs font-bold"
                    style={{
                      background: '#25D366' + '11',
                      color: '#128C7E',
                      border: '1.5px solid #25D36655',
                    }}
                  >
                    Pedir pelo WhatsApp
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
