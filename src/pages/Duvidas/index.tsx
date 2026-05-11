import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Cake } from 'lucide-react';
import { BRAND } from '../../styles/brand';
import { Star11, SprinkleArc, Pill } from '../../components/BrandElements';
import faqContent from '../../content/faq.json';

type Categoria = {
  id: string;
  titulo: string;
  perguntas: { q: string; a: string }[];
};

type Prazo = {
  tipo: string;
  descricao: string;
  prazoHoras: number;
  prazoLegivel: string;
};

type Tier = {
  nome: string;
  raioMaxKm: number;
  taxa: string;
  bairros: string[];
};

const categorias = faqContent.categorias as Categoria[];
const prazos = faqContent.prazos as Prazo[];
const entrega = faqContent.entrega as {
  raioKm: number;
  tiers: Tier[];
  fora: string;
};

const TIER_COLORS = [BRAND.rosa, BRAND.roxo, BRAND.ciano];

function AccordionItem({
  q,
  a,
  isOpen,
  onToggle,
  index,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      style={{
        borderRadius: 20,
        background: isOpen ? BRAND.branco : `${BRAND.branco}cc`,
        border: `1px solid ${isOpen ? BRAND.rosa + '40' : BRAND.begeEsc + '88'}`,
        boxShadow: isOpen ? '0 8px 24px rgba(66,39,22,0.06)' : 'none',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 text-left"
        style={{
          padding: '20px 24px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Fraunces, serif',
          fontWeight: 600,
          fontSize: 17,
          color: BRAND.marrom,
          letterSpacing: '-0.01em',
        }}
      >
        <span>{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isOpen ? BRAND.rosa : `${BRAND.bege}`,
            color: isOpen ? BRAND.bege : BRAND.marrom,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 24px 22px',
                fontFamily: 'Quicksand, sans-serif',
                fontSize: 15,
                lineHeight: 1.65,
                color: `${BRAND.marrom}cc`,
              }}
            >
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Duvidas() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>(categorias[0].id);
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const perguntasAtuais = useMemo(
    () => categorias.find((c) => c.id === categoriaAtiva)?.perguntas ?? [],
    [categoriaAtiva],
  );

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh' }}>
      {/* ─── Hero ─── */}
      <section
        style={{
          position: 'relative',
          padding: '80px 20px 60px',
          overflow: 'hidden',
        }}
      >
        {/* sprinkle decoration */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        >
          <SprinkleArc color={BRAND.marrom} opacity={0.35} />
        </div>

        <div
          style={{
            position: 'relative',
            maxWidth: 880,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: `${BRAND.marrom}10`,
              fontFamily: 'Space Grotesk, monospace',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: BRAND.marrom,
              marginBottom: 24,
            }}
          >
            <Star11 size={10} color={BRAND.rosa} fill={BRAND.rosa} />
            dúvidas frequentes
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(40px, 8vw, 88px)',
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              fontWeight: 900,
              color: BRAND.marrom,
              marginBottom: 18,
            }}
          >
            tudo que rola{' '}
            <span style={{ color: BRAND.rosa, fontStyle: 'italic' }}>
              na sua cabeça
            </span>
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 17,
              lineHeight: 1.55,
              color: `${BRAND.marrom}aa`,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            antes de pedir, deixa a gente esclarecer. se ficar dúvida, é só
            chamar no zap — a Vann mesma responde.
          </p>
        </div>
      </section>

      {/* ─── Tabs de categoria ─── */}
      <section
        style={{
          padding: '0 20px 32px',
          position: 'sticky',
          top: 68,
          zIndex: 10,
          background: BRAND.bege,
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '16px 0',
            justifyContent: 'center',
          }}
        >
          {categorias.map((cat) => {
            const ativa = cat.id === categoriaAtiva;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoriaAtiva(cat.id);
                  setAbertaId(null);
                }}
                className="font-body"
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  border: `1px solid ${ativa ? BRAND.marrom : BRAND.begeEsc}`,
                  background: ativa ? BRAND.marrom : BRAND.branco,
                  color: ativa ? BRAND.bege : BRAND.marrom,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: ativa
                    ? '0 4px 16px rgba(66,39,22,0.18)'
                    : '0 2px 8px rgba(66,39,22,0.04)',
                }}
              >
                {cat.titulo}
                <span
                  style={{
                    marginLeft: 8,
                    opacity: 0.5,
                    fontFamily: 'Space Grotesk, monospace',
                    fontSize: 11,
                  }}
                >
                  {cat.perguntas.length}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Lista de perguntas ─── */}
      <section style={{ padding: '0 20px 80px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={categoriaAtiva}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {perguntasAtuais.map((p, i) => {
                const id = `${categoriaAtiva}-${i}`;
                return (
                  <AccordionItem
                    key={id}
                    q={p.q}
                    a={p.a}
                    isOpen={abertaId === id}
                    onToggle={() => setAbertaId(abertaId === id ? null : id)}
                    index={i}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Tabela de prazos ─── */}
      <section
        style={{
          padding: '80px 20px',
          background: BRAND.marrom,
          color: BRAND.bege,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: BRAND.rosa,
              marginBottom: 16,
            }}
          >
            // quanto tempo demora
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              fontWeight: 900,
              marginBottom: 40,
            }}
          >
            prazos por tipo de bolo
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {prazos.map((p, i) => (
              <motion.div
                key={p.tipo}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  padding: 28,
                  borderRadius: 24,
                  background: `${BRAND.bege}08`,
                  border: `1px solid ${BRAND.bege}22`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: BRAND.rosa,
                    color: BRAND.bege,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Space Grotesk, monospace',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: BRAND.bege,
                    marginBottom: 6,
                  }}
                >
                  {p.prazoLegivel}
                </div>
                <div
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: BRAND.rosa,
                    marginBottom: 14,
                  }}
                >
                  {p.tipo}
                </div>
                <div
                  style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: `${BRAND.bege}aa`,
                  }}
                >
                  {p.descricao}
                </div>
              </motion.div>
            ))}
          </div>

          <p
            style={{
              marginTop: 28,
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 13,
              color: `${BRAND.bege}88`,
              maxWidth: 600,
            }}
          >
            * prazo é o tempo entre o pedido confirmado e o despacho. recomendamos
            sempre pedir com mais folga em datas concorridas.
          </p>
        </div>
      </section>

      {/* ─── Raio de entrega ─── */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: BRAND.rosa,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            // até onde a gente vai
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              fontWeight: 900,
              color: BRAND.marrom,
              marginBottom: 40,
              textAlign: 'center',
            }}
          >
            raio de entrega
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}
          >
            {entrega.tiers.map((tier, i) => {
              const cor = TIER_COLORS[i] ?? BRAND.rosa;
              return (
                <motion.div
                  key={tier.nome}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{
                    padding: 28,
                    borderRadius: 24,
                    background: BRAND.branco,
                    border: `1px solid ${BRAND.begeEsc}88`,
                    boxShadow: '0 8px 24px rgba(66,39,22,0.05)',
                    position: 'relative',
                  }}
                >
                  {/* Concentric circle visual */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: `${cor}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: (i + 1) * 14,
                        height: (i + 1) * 14,
                        borderRadius: '50%',
                        background: cor,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, monospace',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: `${BRAND.marrom}77`,
                      marginBottom: 6,
                    }}
                  >
                    até {tier.raioMaxKm}km · {tier.nome}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 30,
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: BRAND.marrom,
                      marginBottom: 16,
                    }}
                  >
                    {tier.taxa}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {tier.bairros.map((b) => (
                      <span
                        key={b}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: `${cor}14`,
                          color: BRAND.marrom,
                          fontFamily: 'Quicksand, sans-serif',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p
            style={{
              fontFamily: 'Quicksand, sans-serif',
              fontSize: 14,
              lineHeight: 1.6,
              color: `${BRAND.marrom}99`,
              textAlign: 'center',
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            {entrega.fora}
          </p>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section
        style={{
          padding: '60px 20px 100px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            padding: 40,
            borderRadius: 32,
            background: `linear-gradient(135deg, ${BRAND.rosa}14, ${BRAND.roxo}10)`,
            border: `1px solid ${BRAND.rosa}30`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              opacity: 0.4,
            }}
          >
            <Star11 size={120} color={BRAND.rosa} fill={`${BRAND.rosa}20`} />
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              fontWeight: 900,
              color: BRAND.marrom,
              marginBottom: 14,
              position: 'relative',
            }}
          >
            ainda ficou com{' '}
            <span style={{ color: BRAND.rosa, fontStyle: 'italic' }}>
              dúvida?
            </span>
          </h3>
          <p
            className="font-body"
            style={{
              fontSize: 15,
              color: `${BRAND.marrom}aa`,
              marginBottom: 28,
              position: 'relative',
            }}
          >
            a Vann mesma responde no zap. ou comece a configurar seu bolo — você
            tira dúvida no caminho.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              position: 'relative',
            }}
          >
            <Pill
              href="https://wa.me/5511982813152"
              bg={BRAND.marrom}
              fg={BRAND.bege}
              size="lg"
              icon={<MessageCircle size={16} />}
            >
              falar no whatsapp
            </Pill>
            <Link to="/montar" style={{ textDecoration: 'none' }}>
              <Pill bg={BRAND.rosa} fg={BRAND.branco} size="lg" icon={<Cake size={16} />}>
                montar meu bolo
              </Pill>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
