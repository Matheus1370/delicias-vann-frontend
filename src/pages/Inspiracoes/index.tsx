import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Filter, X as XIcon } from 'lucide-react';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';
import { useInspiracoes, type Inspiracao } from '../../hooks/useInspiracoes';

interface PresetWizard {
  massa?: string;
  recheio?: string;
  cobertura?: string;
  topo?: string;
  ocasiao?: string;
  origem?: 'inspiracao';
  inspiracaoId?: string;
  tituloInspiracao?: string;
}

const OCASIOES_LABEL: Record<string, string> = {
  aniversario: 'aniversário',
  infantil: 'infantil',
  casamento: 'casamento',
  noivado: 'noivado',
  'cha-de-bebe': 'chá de bebê',
  'cha-revelacao': 'chá revelação',
  'festa-junina': 'festa junina',
  pascoa: 'páscoa',
  natal: 'natal',
  bodas: 'bodas',
  formatura: 'formatura',
};

export default function Inspiracoes() {
  const navigate = useNavigate();
  const [filtroOcasiao, setFiltroOcasiao] = useState<string | null>(null);
  const [modal, setModal] = useState<Inspiracao | null>(null);

  const { data: inspiracoes = [], isLoading } = useInspiracoes(
    filtroOcasiao ? { ocasiao: filtroOcasiao } : undefined,
  );

  const ocasioesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    for (const i of inspiracoes) {
      if (i.ocasiao) set.add(i.ocasiao);
    }
    return Array.from(set).sort();
  }, [inspiracoes]);

  const quero = (insp: Inspiracao) => {
    const preset: PresetWizard = {
      massa: insp.tagsMassa[0],
      recheio: insp.tagsRecheio[0],
      cobertura: insp.tagsCobertura[0],
      topo: insp.tagsTopo[0],
      ocasiao: insp.ocasiao ?? undefined,
      origem: 'inspiracao',
      inspiracaoId: insp.id,
      tituloInspiracao: insp.titulo,
    };
    navigate('/montar', { state: { preset } });
  };

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120 }}>
      <section style={{ padding: '0 32px 40px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 8 }}>
            <Sparkles size={32} color={BRAND.rosa} />
            <span
              style={{
                fontFamily: 'Space Grotesk',
                fontSize: 12,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: BRAND.marrom,
                opacity: 0.7,
              }}
            >
              inspirações
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'Fraunces',
              fontSize: 'clamp(48px, 7vw, 96px)',
              fontWeight: 500,
              lineHeight: 1,
              color: BRAND.marrom,
              margin: 0,
              marginBottom: 16,
            }}
          >
            bolos pra começar a imaginar
          </h1>
          <p
            style={{
              fontFamily: 'Quicksand',
              fontSize: 18,
              color: BRAND.marrom,
              opacity: 0.7,
              maxWidth: 640,
            }}
          >
            cada combinação aqui já fez festa de cliente real. clique em &ldquo;quero esse&rdquo; e
            o configurador abre com as escolhas pré-marcadas — você ajusta o que quiser.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 32px 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
              <Filter size={16} color={BRAND.marrom} />
              <span
                style={{
                  fontFamily: 'Space Grotesk',
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: BRAND.marrom,
                }}
              >
                ocasião
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFiltroOcasiao(null)}
              style={pillStyle(filtroOcasiao === null)}
            >
              todas
            </button>
            {ocasioesDisponiveis.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setFiltroOcasiao(o)}
                style={pillStyle(filtroOcasiao === o)}
              >
                {OCASIOES_LABEL[o] ?? o}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 32px 80px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {isLoading ? (
            <p style={{ color: BRAND.marrom, opacity: 0.6 }}>carregando inspirações...</p>
          ) : inspiracoes.length === 0 ? (
            <p style={{ color: BRAND.marrom, opacity: 0.6 }}>
              nenhuma inspiração nessa ocasião ainda.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {inspiracoes.map((insp) => (
                <InspiracaoCard
                  key={insp.id}
                  insp={insp}
                  onOpen={() => setModal(insp)}
                  onQuero={() => quero(insp)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {modal && (
          <InspiracaoModal
            insp={modal}
            onClose={() => setModal(null)}
            onQuero={() => {
              quero(modal);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: 999,
    border: `2px solid ${active ? BRAND.rosa : BRAND.begeEsc}`,
    background: active ? BRAND.rosa : 'transparent',
    color: active ? '#FFF' : BRAND.marrom,
    fontFamily: 'Quicksand',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 200ms',
  };
}

function tagPillStyle(color: string): React.CSSProperties {
  return {
    padding: '4px 10px',
    borderRadius: 999,
    background: color,
    color: '#FFF',
    fontFamily: 'Space Grotesk',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  };
}

function InspiracaoCard({
  insp,
  onOpen,
  onQuero,
}: {
  insp: Inspiracao;
  onOpen: () => void;
  onQuero: () => void;
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        background: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(66, 39, 22, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={onOpen}
    >
      <div
        style={{
          aspectRatio: '4/3',
          background: `url(${insp.fotoUrl}) center/cover, ${BRAND.begeEsc}`,
          position: 'relative',
        }}
      >
        {insp.ocasiao && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(66, 39, 22, 0.85)',
              color: BRAND.bege,
              fontFamily: 'Space Grotesk',
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: 'lowercase',
            }}
          >
            {OCASIOES_LABEL[insp.ocasiao] ?? insp.ocasiao}
          </span>
        )}
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <h3
          style={{
            fontFamily: 'Fraunces',
            fontSize: 22,
            fontWeight: 500,
            color: BRAND.marrom,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {insp.titulo}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {insp.tagsMassa.slice(0, 2).map((t) => (
            <span key={`m-${t}`} style={tagPillStyle(BRAND.rosa)}>
              {t}
            </span>
          ))}
          {insp.tagsRecheio.slice(0, 2).map((t) => (
            <span key={`r-${t}`} style={tagPillStyle(BRAND.roxo)}>
              {t}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuero();
          }}
          style={{
            marginTop: 'auto',
            padding: '10px 16px',
            borderRadius: 999,
            background: BRAND.marrom,
            color: BRAND.bege,
            border: 'none',
            fontFamily: 'Quicksand',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={14} /> quero esse
        </button>
      </div>
    </motion.article>
  );
}

function InspiracaoModal({
  insp,
  onClose,
  onQuero,
}: {
  insp: Inspiracao;
  onClose: () => void;
  onQuero: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(66, 39, 22, 0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
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
          maxWidth: 920,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255,255,255,0.9)',
            cursor: 'pointer',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <XIcon size={18} color={BRAND.marrom} />
        </button>
        <div
          style={{
            background: `url(${insp.fotoUrl}) center/cover, ${BRAND.begeEsc}`,
            minHeight: 320,
          }}
        />
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {insp.ocasiao && (
            <span
              style={{
                fontFamily: 'Space Grotesk',
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: BRAND.rosa,
              }}
            >
              {OCASIOES_LABEL[insp.ocasiao] ?? insp.ocasiao}
            </span>
          )}
          <h2
            style={{
              fontFamily: 'Fraunces',
              fontSize: 36,
              fontWeight: 500,
              color: BRAND.marrom,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {insp.titulo}
          </h2>
          <ListaTags titulo="massa" tags={insp.tagsMassa} cor={BRAND.rosa} />
          <ListaTags titulo="recheio" tags={insp.tagsRecheio} cor={BRAND.roxo} />
          <ListaTags titulo="cobertura" tags={insp.tagsCobertura} cor={BRAND.ciano} />
          <ListaTags titulo="topo" tags={insp.tagsTopo} cor={BRAND.marrom} />
          <button
            type="button"
            onClick={onQuero}
            style={{
              marginTop: 16,
              padding: '14px 20px',
              borderRadius: 999,
              background: BRAND.rosa,
              color: '#FFF',
              border: 'none',
              fontFamily: 'Quicksand',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={18} /> quero esse — abrir o configurador
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.55 }}>
            <Star11 size={14} color={BRAND.marrom} />
            <span
              style={{
                fontFamily: 'Quicksand',
                fontSize: 12,
                color: BRAND.marrom,
              }}
            >
              você pode ajustar todas as escolhas no próximo passo
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ListaTags({ titulo, tags, cor }: { titulo: string; tags: string[]; cor: string }) {
  if (tags.length === 0) return null;
  return (
    <div>
      <span
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: BRAND.marrom,
          opacity: 0.6,
        }}
      >
        {titulo}
      </span>
      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((t) => (
          <span key={t} style={tagPillStyle(cor)}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
