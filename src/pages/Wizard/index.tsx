import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, ImagePlus, X as XIcon } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cart.store';
import { BRAND } from '../../styles/brand';
import { RoundCake, Star11 } from '../../components/BrandElements';

/* ─── Types ─── */
interface OpcaoMontagem {
  id: string;
  etapa: string;
  label: string;
  descricao?: string;
  precoExtra: string | number;
  pontosExtra: number;
  ordem: number;
}

/* ─── Preferred step order ─── */
const STEP_ORDER = ['tamanho', 'massa', 'recheio', 'cobertura'];

/* ─── Step emoji/icon map ─── */
const STEP_ICON: Record<string, string> = {
  tamanho: '📐',
  massa: '🍰',
  recheio: '🍫',
  cobertura: '✨',
  mensagem: '💌',
  resumo: '✅',
};

export default function WizardPage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { data: produto, isLoading } = useProduct('bolo-personalizado');

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [personalizacao, setPersonalizacao] = useState('');
  const [showAdded, setShowAdded] = useState(false);
  const [refImages, setRefImages] = useState<{ file: File; preview: string }[]>([]);

  /* ─── Parse opcoesMontagem into ordered steps ─── */
  const steps = useMemo(() => {
    if (!produto?.opcoesMontagem) return [];
    const byEtapa = new Map<string, OpcaoMontagem[]>();
    for (const op of produto.opcoesMontagem as OpcaoMontagem[]) {
      const arr = byEtapa.get(op.etapa) ?? [];
      arr.push(op);
      byEtapa.set(op.etapa, arr);
    }
    // Sort by preferred order, then alphabetical for unknown steps
    const sorted = Array.from(byEtapa.entries()).sort(([a], [b]) => {
      const ia = STEP_ORDER.indexOf(a);
      const ib = STEP_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    return sorted.map(([etapa, opcoes]) => ({
      key: etapa,
      opcoes: opcoes.sort((a, b) => a.ordem - b.ordem),
    }));
  }, [produto]);

  const allStepKeys = useMemo(() => {
    const keys = steps.map((s) => s.key);
    keys.push('mensagem');
    keys.push('resumo');
    return keys;
  }, [steps]);

  const totalSteps = allStepKeys.length;
  const currentKey = allStepKeys[step] ?? 'resumo';
  const cur = steps.find((s) => s.key === currentKey);
  const isMessageStep = currentKey === 'mensagem';
  const isResumoStep = currentKey === 'resumo';
  const isLastStep = step === totalSteps - 1;
  const canAdvance = isMessageStep || isResumoStep || (cur && sel[cur.key]);

  /* ─── Pricing ─── */
  const precoTotal = useMemo(() => {
    if (!produto) return 0;
    return (
      Number(produto.precoVenda) +
      steps.reduce((acc, st) => {
        const chosen = st.opcoes.find((o) => o.label === sel[st.key]);
        return acc + Number(chosen?.precoExtra ?? 0);
      }, 0)
    );
  }, [produto, steps, sel]);

  const pontosTotal = useMemo(() => {
    if (!produto) return 0;
    return (
      produto.pontosEsforco +
      steps.reduce((acc, st) => {
        const chosen = st.opcoes.find((o) => o.label === sel[st.key]);
        return acc + (chosen?.pontosExtra ?? 0);
      }, 0)
    );
  }, [produto, steps, sel]);

  /* ─── Handlers ─── */
  const handleNext = () => {
    if (isResumoStep) {
      handleAddToCart();
    } else if (isMessageStep) {
      // mensagem é sempre opcional, pode avançar
      setStep((s) => s + 1);
    } else if (canAdvance) {
      setStep((s) => s + 1);
    } else {
      toast.error('Selecione uma opção para continuar');
    }
  };

  const handleAddToCart = () => {
    if (!produto) return;
    // Build a descriptive name
    const parts = steps
      .map((st) => sel[st.key])
      .filter(Boolean);
    const nome = parts.length > 0
      ? `${produto.nome} (${parts.join(' · ')})`
      : produto.nome;

    addItem({
      produtoId: produto.id,
      nome,
      precoUnitario: precoTotal,
      pontosEsforco: pontosTotal,
      quantidade: 1,
      imagemUrl: produto.imagemUrl,
      opcoesEscolhidas: sel,
      personalizacao: personalizacao || undefined,
    });
    toast.success('Bolo adicionado ao carrinho!');
    setShowAdded(true);
  };

  /* ─── Loading ─── */
  if (isLoading || !produto) {
    return (
      <div style={{ background: BRAND.bege, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Star11 size={48} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
        </motion.div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120, textAlign: 'center', padding: '120px 32px' }}>
        <h1 className="font-display" style={{ fontSize: 40, fontWeight: 700, fontStyle: 'italic', color: BRAND.marrom }}>
          ops, nenhuma opção <span style={{ color: BRAND.rosa }}>disponível</span>...
        </h1>
        <p style={{ marginTop: 16, opacity: 0.6 }}>As opções de montagem ainda não foram cadastradas.</p>
        <Link to="/cardapio" style={{ display: 'inline-block', marginTop: 32, padding: '14px 28px', background: BRAND.marrom, color: BRAND.bege, borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}>
          ver cardápio →
        </Link>
      </div>
    );
  }

  const completedSteps = steps.filter((st) => sel[st.key]).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <Link to="/cardapio" className="font-mono" style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> voltar ao cardápio
          </Link>
          <h1 className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, margin: '16px 0 0', fontStyle: 'italic', color: BRAND.marrom }}>
            vamos criar <span style={{ color: BRAND.rosa }}>juntinhos</span>?
          </h1>
        </motion.div>

        {/* ─── Progress Steps ─── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {allStepKeys.map((s, i) => {
            const completed = i < step || (i === step && sel[s]);
            const active = i === step;
            return (
              <button
                key={s}
                onClick={() => i <= completedSteps && setStep(i)}
                style={{ flex: 1, cursor: i <= completedSteps ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
              >
                <div className="font-mono" style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: active ? BRAND.rosa : completed ? BRAND.marrom : BRAND.marrom + '44',
                  marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span>{STEP_ICON[s] || '•'}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: BRAND.begeEsc, overflow: 'hidden' }}>
                  <motion.div
                    initial={false}
                    animate={{ width: completed ? '100%' : active ? '50%' : '0%' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: completed ? BRAND.rosa : BRAND.roxo, borderRadius: 3 }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Main Content: 2 columns ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          {/* Mobile: show preview toggle */}
          <div className="lg:hidden" style={{ display: 'none' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 32 }}>
            {/* ── Left: Options ── */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentKey}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="font-display" style={{ fontSize: 28, fontWeight: 600, fontStyle: 'italic', color: BRAND.marrom, margin: '0 0 24px' }}>
                    {isResumoStep ? (
                      <>tudo <span style={{ color: BRAND.rosa }}>certo</span>?</>
                    ) : isMessageStep ? (
                      <><span style={{ color: BRAND.rosa }}>mensagem</span> & referências</>
                    ) : (
                      <>escolha o <span style={{ color: BRAND.rosa }}>{currentKey}</span></>
                    )}
                  </h2>

                  {isResumoStep ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <p style={{ fontSize: 15, color: BRAND.marrom + 'aa', lineHeight: 1.5, margin: 0 }}>
                        Confira as escolhas do seu bolo antes de adicionar ao carrinho.
                      </p>

                      {/* Resumo das escolhas */}
                      <div style={{
                        background: BRAND.branco, borderRadius: 20, padding: 24,
                        border: `1px solid ${BRAND.begeEsc}`,
                      }}>
                        {steps.map((st) => {
                          const chosen = sel[st.key];
                          const opt = st.opcoes.find((o) => o.label === chosen);
                          return (
                            <div key={st.key} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '14px 0',
                              borderBottom: `1px dashed ${BRAND.begeEsc}`,
                            }}>
                              <div>
                                <span className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                  {STEP_ICON[st.key]} {st.key}
                                </span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: BRAND.marrom }}>
                                  {chosen || '—'}
                                </span>
                                {Number(opt?.precoExtra) > 0 && (
                                  <span className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, marginLeft: 8 }}>
                                    +R${Number(opt?.precoExtra)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Mensagem */}
                        <div style={{ padding: '14px 0', borderBottom: refImages.length > 0 ? `1px dashed ${BRAND.begeEsc}` : 'none' }}>
                          <span className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            💌 mensagem
                          </span>
                          <p className="font-display" style={{ fontStyle: 'italic', fontSize: 15, color: BRAND.marrom, margin: '6px 0 0', opacity: personalizacao ? 1 : 0.4 }}>
                            {personalizacao ? `"${personalizacao}"` : 'sem mensagem'}
                          </p>
                        </div>

                        {/* Fotos de referência */}
                        {refImages.length > 0 && (
                          <div style={{ padding: '14px 0 0' }}>
                            <span className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              📸 referências ({refImages.length})
                            </span>
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                              {refImages.map((img, i) => (
                                <div key={i} style={{
                                  width: 72, height: 72, borderRadius: 12, overflow: 'hidden',
                                  border: `2px solid ${BRAND.begeEsc}`,
                                }}>
                                  <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Total destacado */}
                      <div style={{
                        background: BRAND.marrom, borderRadius: 20, padding: '20px 24px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span className="font-mono" style={{ fontSize: 12, color: BRAND.bege, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          total do bolo
                        </span>
                        <span className="font-display" style={{ fontSize: 36, fontWeight: 800, color: BRAND.rosa }}>
                          R$ {precoTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <p className="font-mono" style={{ fontSize: 11, color: BRAND.marrom + '66', textAlign: 'center', letterSpacing: '0.05em' }}>
                        ⏱ prazo de produção: {produto.leadTimeHoras}h · você pode alterar voltando nos passos
                      </p>
                    </div>
                  ) : isMessageStep ? (
                    <div>
                      <textarea
                        value={personalizacao}
                        onChange={(e) => setPersonalizacao(e.target.value)}
                        placeholder="ex: Parabéns, mamãe! Te amo! 🎉"
                        maxLength={200}
                        style={{
                          width: '100%', minHeight: 180, padding: 24, borderRadius: 20,
                          border: `2px solid ${personalizacao ? BRAND.rosa : BRAND.begeEsc}`,
                          background: BRAND.branco, fontFamily: 'Fraunces, serif',
                          fontSize: 20, fontStyle: 'italic', color: BRAND.marrom,
                          resize: 'vertical', outline: 'none', transition: 'border-color 0.3s',
                        }}
                      />
                      <div className="font-mono" style={{ marginTop: 8, fontSize: 11, color: BRAND.marrom + '77', textAlign: 'right' }}>
                        {personalizacao.length}/200 caracteres
                      </div>
                      <p style={{ marginTop: 12, fontSize: 13, color: BRAND.marrom + '88', lineHeight: 1.5 }}>
                        💡 A mensagem será escrita na plaquinha do bolo. Deixe em branco se preferir sem mensagem.
                      </p>

                      {/* ── Imagens de referência ── */}
                      <div style={{ marginTop: 32 }}>
                        <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, fontStyle: 'italic', color: BRAND.marrom, margin: '0 0 8px' }}>
                          imagens de <span style={{ color: BRAND.rosa }}>referência</span>
                        </h3>
                        <p style={{ fontSize: 13, color: BRAND.marrom + '88', lineHeight: 1.5, marginBottom: 16 }}>
                          📸 Envie fotos de bolos que te inspiram para que a confeiteira entenda o que você imagina.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                          {/* Preview das imagens */}
                          <AnimatePresence>
                            {refImages.map((img, i) => (
                              <motion.div
                                key={img.preview}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                  position: 'relative', width: 110, height: 110,
                                  borderRadius: 16, overflow: 'hidden',
                                  border: `2px solid ${BRAND.begeEsc}`,
                                  boxShadow: '0 4px 12px rgba(66,39,22,0.08)',
                                }}
                              >
                                <img
                                  src={img.preview}
                                  alt={`Referência ${i + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button
                                  onClick={() => {
                                    URL.revokeObjectURL(img.preview);
                                    setRefImages((prev) => prev.filter((_, j) => j !== i));
                                  }}
                                  style={{
                                    position: 'absolute', top: 4, right: 4,
                                    width: 24, height: 24, borderRadius: 12,
                                    background: BRAND.marrom + 'cc', color: BRAND.bege,
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(4px)',
                                  }}
                                  aria-label="Remover imagem"
                                >
                                  <XIcon size={12} strokeWidth={3} />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {/* Botão de upload */}
                          {refImages.length < 5 && (
                            <motion.label
                              whileHover={{ y: -3, boxShadow: '0 6px 20px rgba(66,39,22,0.1)' }}
                              whileTap={{ scale: 0.97 }}
                              style={{
                                width: 110, height: 110, borderRadius: 16,
                                border: `2px dashed ${BRAND.rosa}66`,
                                background: BRAND.rosa + '08',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 6,
                                cursor: 'pointer', transition: 'border-color 0.3s',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.rosa; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.rosa + '66'; }}
                            >
                              <ImagePlus size={24} style={{ color: BRAND.rosa }} />
                              <span className="font-mono" style={{ fontSize: 9, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                adicionar
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  const remaining = 5 - refImages.length;
                                  const toAdd = files.slice(0, remaining);
                                  const newImages = toAdd.map((file) => ({
                                    file,
                                    preview: URL.createObjectURL(file),
                                  }));
                                  setRefImages((prev) => [...prev, ...newImages]);
                                  if (files.length > remaining) {
                                    toast('Máximo de 5 imagens', { icon: '📸' });
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </motion.label>
                          )}
                        </div>

                        <div className="font-mono" style={{ marginTop: 8, fontSize: 10, color: BRAND.marrom + '55', letterSpacing: '0.05em' }}>
                          {refImages.length}/5 imagens · jpg, png, webp
                        </div>
                      </div>
                    </div>
                  ) : cur ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                      {cur.opcoes.map((opt, i) => {
                        const selected = sel[cur.key] === opt.label;
                        const extra = Number(opt.precoExtra);
                        return (
                          <motion.button
                            key={opt.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onClick={() => setSel((s) => ({ ...s, [cur.key]: opt.label }))}
                            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(66,39,22,0.1)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              padding: 24, borderRadius: 20, textAlign: 'left',
                              border: `2.5px solid ${selected ? BRAND.rosa : BRAND.begeEsc}`,
                              background: selected ? BRAND.rosa : BRAND.branco,
                              color: selected ? BRAND.bege : BRAND.marrom,
                              cursor: 'pointer', position: 'relative',
                              transition: 'border-color 0.2s, background 0.2s, color 0.2s',
                            }}
                          >
                            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                              {opt.label}
                            </div>
                            {opt.descricao && (
                              <div style={{ fontSize: 13, opacity: selected ? 0.85 : 0.6, marginTop: 6, lineHeight: 1.3 }}>
                                {opt.descricao}
                              </div>
                            )}
                            {extra > 0 && (
                              <div className="font-mono" style={{
                                position: 'absolute', top: 16, right: 16,
                                fontSize: 12, fontWeight: 700,
                                padding: '3px 10px', borderRadius: 999,
                                background: selected ? BRAND.bege + '33' : BRAND.rosa + '15',
                                color: selected ? BRAND.bege : BRAND.rosa,
                              }}>
                                +R${extra}
                              </div>
                            )}
                            {selected && (
                              <motion.div
                                layoutId="wizardCheck"
                                style={{
                                  position: 'absolute', bottom: 14, right: 14,
                                  width: 28, height: 28, borderRadius: 14,
                                  background: BRAND.bege, color: BRAND.rosa,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Check size={16} strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* ── Navigation ── */}
              <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
                {step > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '14px 28px', borderRadius: 999,
                      background: 'transparent', border: `2px solid ${BRAND.marrom}`,
                      color: BRAND.marrom, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={16} /> voltar
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 32px', borderRadius: 999,
                    background: canAdvance ? (isResumoStep ? BRAND.rosa : BRAND.marrom) : BRAND.begeEsc,
                    color: canAdvance ? BRAND.bege : BRAND.marrom + '66',
                    fontWeight: 700, fontSize: 14, cursor: canAdvance ? 'pointer' : 'not-allowed',
                    border: 'none', transition: 'background 0.3s',
                    boxShadow: canAdvance ? `0 4px 16px ${isResumoStep ? BRAND.rosa : BRAND.marrom}33` : 'none',
                  }}
                >
                  {isResumoStep ? (
                    <><Sparkles size={16} /> adicionar ao carrinho</>
                  ) : isMessageStep ? (
                    <>ver resumo <ArrowRight size={16} /></>
                  ) : (
                    <>próximo <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </div>
            </div>

            {/* ── Right: Preview Panel ── */}
            <div style={{ position: 'sticky', top: 88, alignSelf: 'start' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: BRAND.marrom, color: BRAND.bege,
                  padding: 28, borderRadius: 24,
                  boxShadow: '0 12px 40px rgba(66,39,22,0.2)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="font-mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    seu bolo
                  </span>
                  <span className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700 }}>
                    {progressPercent}% completo
                  </span>
                </div>

                {/* Cake animation */}
                <div style={{
                  aspectRatio: '1/1', background: BRAND.bege + '0a', borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, position: 'relative', overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -4, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <RoundCake size={100} color={BRAND.rosa} />
                  </motion.div>
                  {/* Progress ring */}
                  <svg style={{ position: 'absolute', inset: 8 }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke={BRAND.bege + '11'} strokeWidth="2" />
                    <motion.circle
                      cx="50" cy="50" r="46" fill="none" stroke={BRAND.rosa} strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={289}
                      initial={false}
                      animate={{ strokeDashoffset: 289 - (289 * progressPercent) / 100 }}
                      transition={{ duration: 0.5 }}
                      style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                    />
                  </svg>
                </div>

                {/* Selections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {steps.map((st) => {
                    const chosen = sel[st.key];
                    const opt = st.opcoes.find((o) => o.label === chosen);
                    return (
                      <div
                        key={st.key}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: `1px dashed ${BRAND.bege}18`,
                        }}
                      >
                        <span className="font-mono" style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {STEP_ICON[st.key]} {st.key}
                        </span>
                        {chosen ? (
                          <span className="font-display" style={{ fontWeight: 600, fontSize: 14 }}>
                            {chosen}
                            {Number(opt?.precoExtra) > 0 && (
                              <span style={{ color: BRAND.rosa, fontSize: 11, marginLeft: 6 }}>+R${Number(opt?.precoExtra)}</span>
                            )}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, opacity: 0.3, fontStyle: 'italic' }}>—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Message preview */}
                {personalizacao && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      marginTop: 12, padding: 14,
                      background: BRAND.bege + '0f', borderRadius: 12,
                      fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13,
                      borderLeft: `3px solid ${BRAND.rosa}`,
                    }}
                  >
                    "{personalizacao}"
                  </motion.div>
                )}

                {/* Reference images preview */}
                {refImages.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <span className="font-mono" style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      📸 referências ({refImages.length})
                    </span>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {refImages.map((img, i) => (
                        <div key={i} style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BRAND.bege}22` }}>
                          <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div style={{
                  marginTop: 20, paddingTop: 20,
                  borderTop: `2px solid ${BRAND.rosa}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <span className="font-mono" style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    total estimado
                  </span>
                  <motion.span
                    key={precoTotal}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-display"
                    style={{ fontSize: 30, fontWeight: 800, color: BRAND.rosa }}
                  >
                    R$ {precoTotal.toFixed(2).replace('.', ',')}
                  </motion.span>
                </div>

                {/* Lead time note */}
                <div className="font-mono" style={{
                  marginTop: 12, fontSize: 10, opacity: 0.5,
                  textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center',
                }}>
                  ⏱ prazo de produção: {produto.leadTimeHoras}h
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Success Modal ─── */}
      <AnimatePresence>
        {showAdded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: `${BRAND.marrom}88`,
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowAdded(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: BRAND.branco, borderRadius: 28,
                padding: '48px 40', maxWidth: 400, width: '100%',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Decorative star */}
              <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                <Star11 size={80} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <RoundCake size={72} color={BRAND.rosa} />
              </motion.div>

              <h2 className="font-display" style={{
                fontSize: 32, fontWeight: 800, fontStyle: 'italic',
                color: BRAND.marrom, margin: '16px 0 4px',
              }}>
                adicionado!
              </h2>
              <p style={{ fontSize: 14, color: BRAND.marrom + 'aa', marginBottom: 32 }}>
                Seu bolo personalizado está no carrinho.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/cardapio')}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 999,
                    background: 'transparent', border: `2px solid ${BRAND.marrom}`,
                    color: BRAND.marrom, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  continuar comprando
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 999,
                    background: BRAND.rosa, border: 'none',
                    color: BRAND.bege, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: `0 4px 20px ${BRAND.rosa}44`,
                  }}
                >
                  ir para checkout →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
