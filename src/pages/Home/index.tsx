import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Star11,
  CakeSlice,
  Sticker,
  Pill,
  ChocolateBlob,
  SprinkleArc,
  ProductPlaceholder,
} from '../../components/BrandElements';
import { BRAND } from '../../styles/brand';
import { useCategories } from '../../hooks/useProducts';

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <div style={{ background: BRAND.bege, position: 'relative', overflow: 'hidden' }}>
      <HeroSection heroScale={heroScale} heroOpacity={heroOpacity} />
      <ValuesSection />
      <CategoryMarquee />
      <MomentosSection />
      <FeaturedProducts />
      <StickersPlayground />
      <CtaSection />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────────────────────── */
function HeroSection({
  heroScale,
  heroOpacity,
}: {
  heroScale: any;
  heroOpacity: any;
}) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', paddingTop: 100, overflow: 'hidden' }}>
      {/* Sprinkles scatter top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
        style={{
          position: 'absolute',
          top: 60,
          left: '10%',
          right: '10%',
          height: 240,
          pointerEvents: 'none',
        }}
      >
        <SprinkleArc />
      </motion.div>

      <motion.div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '40px 32px 0',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 40,
          alignItems: 'center',
          minHeight: '70vh',
          scale: heroScale,
          opacity: heroOpacity,
        }}
      >
        {/* LEFT: Big stacked logo + tagline */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              borderRadius: 999,
              border: `1.5px solid ${BRAND.marrom}`,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: BRAND.rosa,
              }}
            />
            confeitaria artesanal · desde 2014
          </motion.div>

          {/* Giant stacked typography */}
          <div style={{ lineHeight: 0.85 }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display"
              style={{
                fontSize: 'clamp(72px, 11vw, 168px)',
                fontWeight: 800,
                fontStyle: 'italic',
                color: BRAND.rosa,
                letterSpacing: '-0.03em',
                textShadow: `6px 6px 0 ${BRAND.marrom}`,
              }}
            >
              delícias
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="font-display"
              style={{
                fontSize: 'clamp(96px, 15vw, 220px)',
                fontWeight: 900,
                color: BRAND.marrom,
                letterSpacing: '-0.05em',
                textTransform: 'lowercase',
                marginTop: -10,
              }}
            >
              <span
                style={{
                  fontSize: '0.35em',
                  verticalAlign: '0.9em',
                  marginRight: 8,
                  fontWeight: 800,
                  fontStyle: 'italic',
                  color: BRAND.rosa,
                }}
              >
                da
              </span>
              van
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            style={{
              fontFamily: 'Fraunces, Playfair Display, serif',
              fontSize: 22,
              fontWeight: 400,
              color: BRAND.marrom,
              opacity: 0.8,
              maxWidth: 480,
              marginTop: 28,
              lineHeight: 1.3,
              fontStyle: 'italic',
            }}
          >
            momentos únicos são dignos de{' '}
            <span style={{ color: BRAND.roxo, fontWeight: 600 }}>
              celebrações inesquecíveis
            </span>
            .
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}
          >
            <Link to="/cardapio">
              <Pill
                bg={BRAND.marrom}
                fg={BRAND.bege}
                size="lg"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                }
              >
                ver o cardápio
              </Pill>
            </Link>
            <Link to="/montar">
              <Pill
                bg="transparent"
                fg={BRAND.marrom}
                size="lg"
                style={{ border: `2px solid ${BRAND.marrom}` }}
              >
                montar meu bolo
              </Pill>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            style={{ display: 'flex', gap: 48, marginTop: 56 }}
          >
            {[
              { n: '10+', l: 'anos de doçura' },
              { n: '2k+', l: 'bolos entregues' },
              { n: '100%', l: 'feito à mão' },
            ].map((s, i) => (
              <div key={i}>
                <div
                  className="font-display"
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: BRAND.marrom,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 4,
                  }}
                  className="font-body"
                >
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT: Circular cream drip + floating stickers */}
        <div style={{ position: 'relative', height: 560 }}>
          {/* Chocolate blob */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChocolateBlob />
          </motion.div>

          {/* Floating sticker: sweet sweet sweet */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', top: 20, right: 30, zIndex: 3 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sticker bg={BRAND.ciano} fg={BRAND.bege} rotate={-10} width={150}>
                <div
                  className="font-display"
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    textTransform: 'lowercase',
                  }}
                >
                  sweet
                  <br />
                  sweet
                  <br />
                  sweet
                </div>
              </Sticker>
            </motion.div>
          </motion.div>

          {/* Floating sticker: só mais uma fatia */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 8 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            style={{ position: 'absolute', bottom: 40, left: 0, zIndex: 3 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [8, 4, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sticker bg={BRAND.roxo} fg={BRAND.bege} rotate={0} width={180} shape="rect">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    className="font-display"
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      textTransform: 'lowercase',
                      lineHeight: 1,
                    }}
                  >
                    só mais
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      textTransform: 'lowercase',
                      lineHeight: 1,
                    }}
                  >
                    uma
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      textTransform: 'lowercase',
                      lineHeight: 1,
                    }}
                  >
                    fatia
                  </div>
                </div>
              </Sticker>
            </motion.div>
          </motion.div>

          {/* Rotating Star11 */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            style={{ position: 'absolute', bottom: 100, right: 80, zIndex: 3 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
              <Star11 size={60} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
            </motion.div>
          </motion.div>

          {/* Floating CakeSlice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            style={{ position: 'absolute', top: 180, left: 60 }}
          >
            <motion.div
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <CakeSlice size={64} color={BRAND.bege} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   VALUES SECTION
   ───────────────────────────────────────────────────────────── */
function ValuesSection() {
  return (
    <section style={{ padding: '120px 32px', background: BRAND.bege, position: 'relative' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        {/* Background VALORES text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="font-display"
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(120px, 18vw, 260px)',
            fontWeight: 900,
            color: BRAND.roxo,
            opacity: 0.18,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontStyle: 'italic',
          }}
        >
          VALORES
        </motion.div>

        <div
          style={{
            position: 'relative',
            maxWidth: 720,
            margin: '80px auto 0',
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display"
            style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.4, color: BRAND.marrom }}
          >
            comemorar um momento é sempre memorável. por isso oferecemos produtos
            personalizados, bolos de festa com decorações impecáveis, feitos em um{' '}
            <span style={{ fontStyle: 'italic', color: BRAND.rosa }}>
              ambiente familiar
            </span>
            , totalmente caseiros.
          </motion.p>
        </div>

        {/* Word list */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            marginTop: 80,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            fontFamily: 'Fraunces, Playfair Display, serif',
            fontSize: 'clamp(28px, 3.5vw, 52px)',
            fontWeight: 700,
            color: BRAND.roxo,
            fontStyle: 'italic',
          }}
        >
          {['caseiro', 'alegre', 'divertido', 'comemorativo', 'personalizado'].map(
            (w, i) => (
              <React.Fragment key={w}>
                {i > 0 && <span style={{ color: BRAND.rosa }}>·</span>}
                <motion.span
                  whileHover={{ scale: 1.1, color: BRAND.rosa }}
                  style={{ cursor: 'default' }}
                >
                  {w}
                </motion.span>
              </React.Fragment>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY MARQUEE
   ───────────────────────────────────────────────────────────── */
function CategoryMarquee() {
  const items = [
    'bolos personalizados',
    'docinhos de festa',
    'bolo de pote',
    'palha italiana',
    'panetones artesanais',
    'trufadas',
    'ovos de páscoa',
    'copo da felicidade',
  ];

  return (
    <div
      style={{
        background: BRAND.marrom,
        color: BRAND.bege,
        padding: '28px 0',
        overflow: 'hidden',
        borderTop: `4px solid ${BRAND.rosa}`,
        borderBottom: `4px solid ${BRAND.rosa}`,
      }}
    >
      <motion.div
        style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {[...Array(2)].flatMap((_, rep) =>
          items.map((item, i) => (
            <span
              key={`${rep}-${i}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 32 }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  letterSpacing: '-0.02em',
                }}
              >
                {item}
              </span>
              <Star11 size={28} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
            </span>
          )),
        )}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOMENTOS / ABOUT SECTION
   ───────────────────────────────────────────────────────────── */
function MomentosSection() {
  return (
    <section
      style={{
        background: BRAND.roxo,
        color: BRAND.bege,
        padding: '120px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Left column */}
        <div>
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Star11 size={64} color={BRAND.bege} fill="none" stroke={2} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display"
            style={{
              fontSize: 'clamp(48px, 5.5vw, 84px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              margin: '32px 0 0',
              fontStyle: 'italic',
            }}
          >
            momentos únicos
            <br />
            são dignos de
            <br />
            <span style={{ color: BRAND.rosa }}>celebrações</span>
            <br />
            inesquecíveis.
          </motion.h2>
        </div>

        {/* Right column */}
        <div style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              background: BRAND.bege,
              color: BRAND.marrom,
              padding: 40,
              borderRadius: 24,
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: BRAND.rosa,
                color: BRAND.bege,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              sobre a marca
            </div>
            <p
              className="font-display"
              style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 400 }}
            >
              Há mais de{' '}
              <strong style={{ color: BRAND.rosa }}>10 anos no mercado</strong>, a empresa
              começou em ambiente familiar como forma de produção para a família e foi se
              expandindo, sem perder o carinho caseiro que a fez começar.
            </p>
            <div
              style={{
                marginTop: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                paddingTop: 20,
                borderTop: `1px dashed ${BRAND.marrom}44`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  background: BRAND.rosa,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontFamily: 'Fraunces, Playfair Display, serif',
                  fontSize: 22,
                }}
              >
                V
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Vanessa</div>
                <div style={{ fontSize: 12, opacity: 0.6 }} className="font-body">
                  fundadora & chef confeiteira
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rotating "feito com carinho" sticker */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ position: 'absolute', top: -30, right: -30, zIndex: 2 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: BRAND.rosa,
                  border: `3px solid ${BRAND.bege}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: BRAND.bege,
                  fontFamily: 'Fraunces, Playfair Display, serif',
                  fontWeight: 800,
                  fontSize: 14,
                  padding: 12,
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
              >
                feito
                <br />
                com
                <br />
                carinho
                <br />
                &#9825;
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FEATURED PRODUCTS
   ───────────────────────────────────────────────────────────── */
function FeaturedProducts() {
  const prods = [
    {
      nome: 'Bolo de Chocolate Trufado',
      preco: 'R$ 89,00',
      cat: 'bolos',
      cor: BRAND.rosa,
      tempo: '48h',
      label: 'chocolate',
    },
    {
      nome: 'Palha Italiana',
      preco: 'R$ 6,50',
      cat: 'docinhos',
      cor: BRAND.roxo,
      tempo: '24h',
      label: 'palha',
    },
    {
      nome: 'Bolo de Pote Red Velvet',
      preco: 'R$ 18,00',
      cat: 'pote',
      cor: BRAND.ciano,
      tempo: '24h',
      label: 'pote',
    },
    {
      nome: 'Copo da Felicidade',
      preco: 'R$ 22,00',
      cat: 'sobremesa',
      cor: BRAND.rosa,
      tempo: '24h',
      label: 'copo',
    },
  ];

  return (
    <section style={{ padding: '120px 32px', background: BRAND.bege, position: 'relative' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 56,
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: 13,
                color: BRAND.rosa,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
              className="font-body"
            >
              &#10022; mais pedidos
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display"
              style={{
                fontSize: 'clamp(44px, 5vw, 72px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                margin: 0,
                color: BRAND.marrom,
                fontStyle: 'italic',
              }}
            >
              todo mundo <span style={{ color: BRAND.rosa }}>ama</span>
              <br />
              as delícias da van.
            </motion.h2>
          </div>
          <Link to="/cardapio">
            <Pill bg={BRAND.marrom} fg={BRAND.bege} size="md">
              ver tudo &rarr;
            </Pill>
          </Link>
        </div>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {prods.map((p, i) => (
            <ProductCard key={i} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Product Card ── */
interface ProdData {
  nome: string;
  preco: string;
  cat: string;
  cor: string;
  tempo: string;
  label: string;
}

function ProductCard({ p, i }: { p: ProdData; i: number }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <motion.div
        animate={{ rotate: hover ? -1.5 : 0, y: hover ? -6 : 0 }}
        transition={{ duration: 0.3 }}
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
            background: p.cor + '22',
          }}
        >
          <ProductPlaceholder label={p.label} accent={p.cor} />

          {/* Time badge */}
          <motion.div
            animate={{ scale: hover ? 1.1 : 1, rotate: hover ? 15 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: BRAND.marrom,
              color: BRAND.bege,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
            className="font-body"
          >
            {p.tempo}
          </motion.div>

          {/* Hover overlay */}
          <motion.div
            animate={{ scale: hover ? 1 : 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `${p.cor}ee`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pill bg={BRAND.bege} fg={BRAND.marrom} size="sm">
              + carrinho
            </Pill>
          </motion.div>
        </div>

        {/* Card body */}
        <div style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 10,
              color: p.cor,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
            className="font-body"
          >
            {p.cat}
          </div>
          <div
            className="font-display"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: BRAND.marrom,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {p.nome}
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
                style={{
                  fontSize: 10,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
                className="font-body"
              >
                a partir de
              </div>
              <div
                className="font-display"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: BRAND.marrom,
                  letterSpacing: '-0.02em',
                }}
              >
                {p.preco}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: BRAND.marrom,
                color: BRAND.bege,
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              +
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STICKERS PLAYGROUND
   ───────────────────────────────────────────────────────────── */
function StickersPlayground() {
  const stickers = [
    {
      bg: BRAND.roxo,
      text: (
        <>
          <span
            style={{
              color: BRAND.bege,
              fontFamily: 'Fraunces, Playfair Display, serif',
              fontWeight: 800,
              fontStyle: 'italic',
            }}
          >
            delícias
          </span>
          <br />
          <span
            style={{
              color: BRAND.bege,
              fontFamily: 'Fraunces, Playfair Display, serif',
              fontWeight: 900,
              fontSize: '1.3em',
            }}
          >
            da VAN
          </span>
        </>
      ),
      rotate: -8,
      shape: 'round' as const,
      size: 200,
    },
    {
      bg: BRAND.marrom,
      text: (
        <span style={{ color: BRAND.bege }}>
          <span
            style={{
              fontFamily: 'Fraunces, Playfair Display, serif',
              fontStyle: 'italic',
              fontWeight: 700,
            }}
          >
            everybody
          </span>
          <br />
          <em style={{ color: BRAND.rosa, fontSize: 12, fontStyle: 'italic' }}>loves</em>
          <br />
          <span
            style={{
              fontFamily: 'Fraunces, Playfair Display, serif',
              fontWeight: 800,
              fontSize: '1.4em',
            }}
          >
            cake
          </span>
        </span>
      ),
      rotate: 6,
      shape: 'rect' as const,
      size: 200,
    },
    {
      bg: BRAND.ciano,
      text: (
        <span
          style={{
            color: BRAND.bege,
            fontFamily: 'Fraunces, Playfair Display, serif',
            fontWeight: 900,
            fontSize: '1.3em',
            textTransform: 'lowercase' as const,
            lineHeight: 0.9,
          }}
        >
          sweet
          <br />
          sweet
          <br />
          sweet
          <br />
          sweet
        </span>
      ),
      rotate: -4,
      shape: 'rect' as const,
      size: 200,
    },
    {
      bg: BRAND.rosa,
      text: (
        <span
          style={{
            color: BRAND.bege,
            fontWeight: 800,
            fontSize: 14,
            lineHeight: 1.4,
            textTransform: 'uppercase' as const,
          }}
          className="font-body"
        >
          chocólatra
          <br />
          chocólatra
          <br />
          chocólatra
          <br />
          chocólatra
        </span>
      ),
      rotate: 10,
      shape: 'rect' as const,
      size: 200,
    },
  ];

  return (
    <section
      style={{
        padding: '120px 32px 60px',
        background: BRAND.rosa,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-display"
          style={{
            fontSize: 'clamp(52px, 7vw, 108px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            margin: 0,
            color: BRAND.bege,
            fontStyle: 'italic',
          }}
        >
          adesivos,
          <br />
          <span style={{ color: BRAND.marrom }}>embalagens,</span>
          <br />
          presentes.
        </motion.h2>

        <p
          style={{
            maxWidth: 440,
            margin: '28px 0 0',
            fontSize: 17,
            color: BRAND.bege,
            opacity: 0.95,
            lineHeight: 1.5,
          }}
        >
          cada caixa sai com um mimo diferente. não é só bolo — é um momento embrulhado
          com carinho e mandado pra sua porta.
        </p>

        {/* Draggable stickers */}
        <div style={{ marginTop: 80, position: 'relative', height: 420 }}>
          {stickers.map((s, i) => {
            const left = 8 + i * 22;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60, rotate: s.rotate * 3 }}
                whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                drag
                dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
                dragElastic={0.3}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 1.1, cursor: 'grabbing' }}
                style={{
                  position: 'absolute',
                  top: i % 2 === 0 ? 20 : 80,
                  left: `${left}%`,
                  cursor: 'grab',
                }}
              >
                <Sticker
                  bg={s.bg}
                  fg={BRAND.bege}
                  width={s.size}
                  rotate={0}
                  shape={s.shape}
                >
                  <div style={{ fontSize: 20, lineHeight: 1.1, textAlign: 'center' }}>
                    {s.text}
                  </div>
                </Sticker>
              </motion.div>
            );
          })}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 12,
            color: BRAND.bege,
            opacity: 0.8,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
          className="font-body"
        >
          &#10022; arraste os adesivos &#10022;
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CTA SECTION
   ───────────────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section
      style={{
        background: BRAND.bege,
        padding: '120px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-block', marginBottom: 24 }}
        >
          <Star11 size={48} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display"
          style={{
            fontSize: 'clamp(52px, 7vw, 104px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            margin: 0,
            color: BRAND.marrom,
            fontStyle: 'italic',
          }}
        >
          vamos deixar sua
          <br />
          festa <span style={{ color: BRAND.rosa }}>inesquecível</span>?
        </motion.h2>

        <p
          style={{
            fontSize: 18,
            maxWidth: 540,
            margin: '32px auto 0',
            lineHeight: 1.5,
            opacity: 0.75,
          }}
        >
          encomendas com no mínimo 48h de antecedência. entregamos em toda Guarulhos e
          região.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 40,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/cardapio">
            <Pill bg={BRAND.marrom} fg={BRAND.bege} size="lg">
              fazer encomenda
            </Pill>
          </Link>
          <Pill
            bg="transparent"
            fg={BRAND.marrom}
            size="lg"
            style={{ border: `2px solid ${BRAND.marrom}` }}
            href="https://wa.me/5511982813152"
          >
            falar no whatsapp
          </Pill>
        </motion.div>
      </div>
    </section>
  );
}
