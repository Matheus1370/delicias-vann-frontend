import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { BRAND } from '../../styles/brand';
import { Star11, ProductPlaceholder } from '../../components/BrandElements';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cart.store';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtPrice = (v: string | number) =>
  `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const categoryColor = (slug: string): string => {
  const map: Record<string, string> = {
    bolos: BRAND.rosa,
    docinhos: BRAND.roxo,
    'bolo-de-pote': BRAND.ciano,
    'palha-italiana': BRAND.roxo,
    panetones: BRAND.marrom,
    'ovos-de-pascoa': BRAND.rosa,
  };
  return map[slug] ?? BRAND.rosa;
};

interface FotoProduto {
  id: string;
  url: string;
  tipo: 'PRINCIPAL' | 'CORTADO' | 'DETALHE';
  ordem: number;
}

function carouselNavStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 12,
    transform: 'translateY(-50%)',
    width: 40,
    height: 40,
    borderRadius: 999,
    border: 'none',
    background: 'rgba(246, 237, 231, 0.9)',
    color: BRAND.marrom,
    fontSize: 24,
    cursor: 'pointer',
    fontFamily: 'Quicksand',
    fontWeight: 700,
  } as React.CSSProperties;
}

/** Devolve { principal, cortado, todas } a partir de fotos[] (com fallback pra imagemUrl). */
function escolherFotos(p: any): { principal: string | null; cortado: string | null; todas: FotoProduto[] } {
  const fotos: FotoProduto[] = (p.fotos ?? []) as FotoProduto[];
  const principal = fotos.find((f) => f.tipo === 'PRINCIPAL') ?? fotos[0];
  const cortado = fotos.find((f) => f.tipo === 'CORTADO') ?? null;
  return {
    principal: principal?.url ?? p.imagemUrl ?? null,
    cortado: cortado?.url ?? null,
    todas: fotos,
  };
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Catalog() {
  const [activeSlug, setActiveSlug] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [modal, setModal] = useState<any | null>(null);

  const { data: produtos = [], isLoading } = useProducts(
    activeSlug ? { categoria: activeSlug } : undefined,
  );
  const { data: categorias = [] } = useCategories();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  /* filter out "adicionais" category */
  const categoriasVisiveis = useMemo(
    () => (categorias as any[]).filter((c) => c.slug !== 'adicionais'),
    [categorias],
  );

  /* visible products (exclude ADICIONAL tipo) */
  const produtosVisiveis = useMemo(
    () => (produtos as any[]).filter((p) => p.tipo !== 'ADICIONAL'),
    [produtos],
  );

  /* search + sort */
  const filtered = useMemo(() => {
    let r = produtosVisiveis;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          (p.descricao ?? '').toLowerCase().includes(q),
      );
    }
    if (sort === 'preco-asc')
      r = [...r].sort((a, b) => Number(a.precoVenda) - Number(b.precoVenda));
    else if (sort === 'preco-desc')
      r = [...r].sort((a, b) => Number(b.precoVenda) - Number(a.precoVenda));
    // "popular" keeps default order from API
    return r;
  }, [produtosVisiveis, search, sort]);

  /* count per category (from all products, not just filtered) */
  const totalCount = produtosVisiveis.length;
  const countBySlug = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of produtosVisiveis) {
      const slug = p.categoria?.slug;
      if (slug) m[slug] = (m[slug] || 0) + 1;
    }
    return m;
  }, [produtosVisiveis]);

  /* cart helpers */
  const inCart = (id: string) => {
    const item = cartItems.find((i) => i.produtoId === id);
    return item ? item.quantidade : 0;
  };

  const handleAdd = (p: any) => {
    addItem({
      produtoId: p.id,
      nome: p.nome,
      precoUnitario: Number(p.precoVenda),
      pontosEsforco: p.pontosEsforco,
      quantidade: 1,
      imagemUrl: p.imagemUrl,
    });
    toast.success(p.nome + ' adicionado!');
  };

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120 }}>
      {/* ---- Top banner ---- */}
      <section style={{ padding: '0 32px 40px' }}>
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            {/* Heading */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                <Star11 size={10} color={BRAND.rosa} /> cardapio completo
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display"
                style={{
                  fontSize: 'clamp(56px, 8vw, 120px)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 0.9,
                  margin: 0,
                  color: BRAND.marrom,
                  fontStyle: 'italic',
                }}
              >
                tudo que e<br />
                <span style={{ color: BRAND.rosa }}>doce</span> por aqui.
              </motion.h1>
            </div>

            {/* Search + Sort */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <svg
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={BRAND.marrom}
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="procurar..."
                  style={{
                    padding: '12px 18px 12px 42px',
                    borderRadius: 999,
                    border: `1.5px solid ${BRAND.begeEsc}`,
                    background: BRAND.branco,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14,
                    color: BRAND.marrom,
                    outline: 'none',
                    width: 220,
                  }}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 999,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  background: BRAND.branco,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: BRAND.marrom,
                  cursor: 'pointer',
                }}
              >
                <option value="popular">mais pedidos</option>
                <option value="preco-asc">menor preco</option>
                <option value="preco-desc">maior preco</option>
              </select>
            </div>
          </div>

          {/* ---- Category pills ---- */}
          <div style={{ marginTop: 48, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* "todos" pill */}
            <motion.button
              onClick={() => setActiveSlug(undefined)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                position: 'relative',
                padding: '12px 22px',
                borderRadius: 999,
                border: `1.5px solid ${!activeSlug ? BRAND.marrom : BRAND.begeEsc}`,
                background: !activeSlug ? BRAND.marrom : BRAND.branco,
                color: !activeSlug ? BRAND.bege : BRAND.marrom,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                gap: 8,
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              todos
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: !activeSlug ? BRAND.rosa : BRAND.bege,
                  color: !activeSlug ? BRAND.bege : BRAND.marrom + '99',
                  fontWeight: 700,
                }}
              >
                {totalCount}
              </span>
            </motion.button>

            {categoriasVisiveis.map((c: any) => (
              <motion.button
                key={c.id}
                onClick={() => setActiveSlug(c.slug)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  position: 'relative',
                  padding: '12px 22px',
                  borderRadius: 999,
                  border: `1.5px solid ${activeSlug === c.slug ? BRAND.marrom : BRAND.begeEsc}`,
                  background: activeSlug === c.slug ? BRAND.marrom : BRAND.branco,
                  color: activeSlug === c.slug ? BRAND.bege : BRAND.marrom,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  gap: 8,
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {c.nome}
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: activeSlug === c.slug ? BRAND.rosa : BRAND.bege,
                    color: activeSlug === c.slug ? BRAND.bege : BRAND.marrom + '99',
                    fontWeight: 700,
                  }}
                >
                  {countBySlug[c.slug] ?? 0}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Products grid ---- */}
      <section style={{ padding: '20px 32px 80px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: 80,
                color: BRAND.marrom,
                opacity: 0.5,
              }}
            >
              <div className="font-display" style={{ fontSize: 28, fontStyle: 'italic' }}>
                carregando...
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 24,
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((p: any, i: number) => (
                    <CatalogCard
                      key={p.id}
                      p={p}
                      i={i}
                      onOpen={() => setModal(p)}
                      onAdd={() => handleAdd(p)}
                      inCart={inCart(p.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 80,
                    color: BRAND.marrom,
                    opacity: 0.5,
                  }}
                >
                  <div
                    className="font-display"
                    style={{ fontSize: 40, fontStyle: 'italic' }}
                  >
                    ops, nada por aqui...
                  </div>
                  <p>tente outra categoria ou palavra.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ---- Product detail modal ---- */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            p={modal}
            onClose={() => setModal(null)}
            onAdd={(qty: number) => {
              for (let n = 0; n < qty; n++) handleAdd(modal);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CatalogCard                                                        */
/* ------------------------------------------------------------------ */

interface CardProps {
  p: any;
  i: number;
  onOpen: () => void;
  onAdd: () => void;
  inCart: number;
}

function CatalogCard({ p, i, onOpen, onAdd, inCart }: CardProps) {
  const [hover, setHover] = useState(false);
  const accent = categoryColor(p.categoria?.slug ?? '');
  const fotosInfo = escolherFotos(p);
  const fotoExibida = hover && fotosInfo.cortado ? fotosInfo.cortado : fotosInfo.principal;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <motion.div
        animate={{ y: hover ? -4 : 0 }}
        onClick={onOpen}
        style={{
          background: BRAND.branco,
          borderRadius: 24,
          overflow: 'hidden',
          border: `1px solid ${BRAND.begeEsc}`,
          cursor: 'pointer',
        }}
      >
        {/* Image area */}
        <div
          style={{
            aspectRatio: '1/1',
            position: 'relative',
            overflow: 'hidden',
            background: accent + '15',
          }}
        >
          {fotoExibida ? (
            <img
              src={fotoExibida}
              alt={p.nome}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 600ms ease, opacity 300ms',
                transform: hover ? 'scale(1.06)' : 'scale(1)',
              }}
            />
          ) : (
            <ProductPlaceholder
              label={p.categoria?.nome ?? p.tipo}
              accent={accent}
            />
          )}

          {fotosInfo.cortado && (
            <span
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(66, 39, 22, 0.85)',
                color: BRAND.bege,
                fontFamily: 'Space Grotesk',
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                opacity: hover ? 1 : 0.85,
              }}
            >
              {hover ? 'cortado' : 'passe o mouse'}
            </span>
          )}

          {/* TOP badge (popular / montavel) */}
          {p.tipo === 'MONTAVEL' && (
            <div
              className="font-mono"
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: BRAND.rosa,
                color: BRAND.bege,
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Star11 size={8} color={BRAND.bege} /> top
            </div>
          )}

          {/* Lead time badge */}
          <div
            className="font-mono"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: BRAND.marrom,
              color: BRAND.bege,
              padding: '5px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {p.leadTimeHoras}h
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: 20 }}>
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              color: accent,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {p.categoria?.nome ?? ''}
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: BRAND.marrom,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {p.nome}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6, minHeight: 18 }}>
            {p.descricao ?? ''}
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                a partir de
              </div>
              <div
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: BRAND.marrom,
                  letterSpacing: '-0.02em',
                }}
              >
                {fmtPrice(p.precoVenda)}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.12, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: inCart > 0 ? BRAND.rosa : BRAND.marrom,
                color: BRAND.bege,
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
                fontWeight: 400,
                position: 'relative',
              }}
            >
              +
              {inCart > 0 && (
                <span
                  className="font-mono"
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: BRAND.marrom,
                    color: BRAND.bege,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    border: `2px solid ${BRAND.bege}`,
                  }}
                >
                  {inCart}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProductModal                                                       */
/* ------------------------------------------------------------------ */

interface ModalProps {
  p: any;
  onClose: () => void;
  onAdd: (qty: number) => void;
}

function ProductModal({ p, onClose, onAdd }: ModalProps) {
  const [qty, setQty] = useState(1);
  const accent = categoryColor(p.categoria?.slug ?? '');
  const unitPrice = Number(p.precoVenda);
  const fotosInfo = escolherFotos(p);
  const galeria = useMemo(() => {
    const urls: string[] = [];
    if (fotosInfo.principal) urls.push(fotosInfo.principal);
    for (const f of fotosInfo.todas) {
      if (f.url && !urls.includes(f.url)) urls.push(f.url);
    }
    return urls;
  }, [p.id]);
  const [fotoIdx, setFotoIdx] = useState(0);
  const fotoAtual = galeria[fotoIdx] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(66,39,22,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          background: BRAND.branco,
          borderRadius: 32,
          overflow: 'hidden',
          maxWidth: 900,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxHeight: '90vh',
        }}
      >
        {/* Left: image */}
        <div style={{ background: accent + '20', position: 'relative', minHeight: 400 }}>
          {fotoAtual ? (
            <img
              src={fotoAtual}
              alt={p.nome}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ProductPlaceholder label={p.categoria?.nome ?? ''} accent={accent} />
          )}
          {galeria.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setFotoIdx((i) => (i - 1 + galeria.length) % galeria.length)}
                aria-label="Foto anterior"
                style={carouselNavStyle('left')}
              >
                &#x2039;
              </button>
              <button
                type="button"
                onClick={() => setFotoIdx((i) => (i + 1) % galeria.length)}
                aria-label="Próxima foto"
                style={carouselNavStyle('right')}
              >
                &#x203A;
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {galeria.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Foto ${idx + 1}`}
                    onClick={() => setFotoIdx(idx)}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      border: 'none',
                      background: idx === fotoIdx ? BRAND.bege : 'rgba(246, 237, 231, 0.5)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 44,
              height: 44,
              borderRadius: 22,
              background: BRAND.bege,
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: BRAND.marrom,
            }}
          >
            &#x2715;
          </motion.button>
        </div>

        {/* Right: details */}
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column' }}>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: accent,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {p.categoria?.nome ?? ''}
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: '10px 0 0',
              color: BRAND.marrom,
              fontStyle: 'italic',
            }}
          >
            {p.nome}
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, opacity: 0.75, lineHeight: 1.5 }}>
            {p.descricao ?? ''}. feito fresquinho, do jeito caseiro que a Van sabe fazer.
          </p>

          {/* Info bar */}
          <div
            className="font-mono"
            style={{
              marginTop: 24,
              padding: '16px 20px',
              background: BRAND.bege,
              borderRadius: 16,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span>&#x23F1; pronto em {p.leadTimeHoras}h</span>
            <span>
              <Star11 size={8} color={BRAND.rosa} /> feito sob encomenda
            </span>
          </div>

          {/* Allergens */}
          {p.alergenicos?.length > 0 && (
            <div
              className="font-mono"
              style={{
                marginTop: 12,
                fontSize: 11,
                color: BRAND.marrom,
                opacity: 0.6,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              contem: {p.alergenicos.join(', ')}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Price + qty */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingTop: 24,
              borderTop: `1px dashed ${BRAND.begeEsc}`,
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                a partir de
              </div>
              <div
                className="font-display"
                style={{
                  fontSize: 38,
                  fontWeight: 800,
                  color: BRAND.marrom,
                  letterSpacing: '-0.03em',
                }}
              >
                {fmtPrice(unitPrice * qty)}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: BRAND.bege,
                padding: 4,
                borderRadius: 999,
              }}
            >
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: BRAND.marrom,
                }}
              >
                &#x2212;
              </button>
              <span
                className="font-mono"
                style={{
                  minWidth: 24,
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: BRAND.marrom,
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAdd(qty)}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '18px',
              background: BRAND.rosa,
              color: BRAND.bege,
              border: 'none',
              borderRadius: 999,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            adicionar ao carrinho &#x2192;
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
