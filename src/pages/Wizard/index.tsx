import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, ImagePlus, X as XIcon, Users, Minus, Plus, MessageCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useProduct, useAdicionais, type AdicionalItem } from '../../hooks/useProducts';
import { useCreateRascunhoWhatsApp } from '../../hooks/useOrders';
import { useAvaliarRegras, type Violacao } from '../../hooks/useRegras';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore, type Ocasiao } from '../../store/cart.store';
import { BRAND } from '../../styles/brand';
import { RoundCake, Star11 } from '../../components/BrandElements';
import { gerarLinkWhatsApp } from '../../utils/whatsapp';

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
  pessoas: '👥',
  tamanho: '📐',
  massa: '🍰',
  recheio: '🍫',
  cobertura: '✨',
  mensagem: '💌',
  adicionais: '🍬',
  resumo: '✅',
};

/* ─── Ocasiões disponíveis com regras de porção ─── */
const OCASIOES: { value: Ocasiao; label: string; gramasPorPessoa: number; emoji: string }[] = [
  { value: 'infantil', label: 'aniversário infantil', gramasPorPessoa: 80, emoji: '🎈' },
  { value: 'adulto', label: 'aniversário adulto', gramasPorPessoa: 100, emoji: '🎂' },
  { value: 'casamento', label: 'casamento', gramasPorPessoa: 100, emoji: '💍' },
  { value: 'corporativo', label: 'corporativo', gramasPorPessoa: 120, emoji: '🏢' },
];

/** Calcula faixa de kg recomendada com folga de 10% pra cima. */
function calcularKgSugerido(numeroPessoas: number, ocasiao: Ocasiao): {
  ideal: number;
  min: number;
  max: number;
} {
  const reg = OCASIOES.find((o) => o.value === ocasiao);
  const gramas = reg ? reg.gramasPorPessoa : 100;
  const kgBase = (numeroPessoas * gramas) / 1000;
  const min = kgBase;
  const max = kgBase * 1.1; // folga 10%
  const ideal = (min + max) / 2;
  return { ideal, min, max };
}

/** Extrai o peso em kg do label de uma opção (ex: "1kg", "1,5 kg", "2.5kg"). */
function extrairKgDoLabel(label: string): number | null {
  const m = label.match(/(\d+(?:[\.,]\d+)?)\s*kg/i);
  if (!m) return null;
  return parseFloat(m[1].replace(',', '.'));
}

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string) ?? '5511982813152';

export default function WizardPage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const setOcasiaoGlobal = useCartStore((s) => s.setOcasiao);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: produto, isLoading } = useProduct('bolo-personalizado');
  const { mutateAsync: criarRascunho, isPending: rascunhoSalvando } = useCreateRascunhoWhatsApp();
  const { mutateAsync: avaliarRegras, isPending: avaliandoRegras } = useAvaliarRegras();
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [violacoes, setViolacoes] = useState<Violacao[]>([]);
  const [avisoConfirmado, setAvisoConfirmado] = useState(false);

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [personalizacao, setPersonalizacao] = useState('');
  const [showAdded, setShowAdded] = useState(false);
  const [refImages, setRefImages] = useState<{ file: File; preview: string }[]>([]);
  const [numeroPessoas, setNumeroPessoas] = useState<number | ''>('');
  const [ocasiao, setOcasiao] = useState<Ocasiao | null>(null);
  const [adicionais, setAdicionais] = useState<Record<string, number>>({});
  const [adicionaisInicializados, setAdicionaisInicializados] = useState(false);

  const kgSugerido = useMemo(() => {
    if (!numeroPessoas || !ocasiao || numeroPessoas <= 0) return null;
    return calcularKgSugerido(numeroPessoas, ocasiao);
  }, [numeroPessoas, ocasiao]);

  const pessoasParaQuery = typeof numeroPessoas === 'number' ? numeroPessoas : undefined;
  const { data: adicionaisResp } = useAdicionais(pessoasParaQuery);
  const adicionaisDisponiveis = adicionaisResp?.itens ?? [];

  /* Pré-popula quantidades sugeridas na primeira vez que carrega */
  useEffect(() => {
    if (adicionaisDisponiveis.length === 0 || adicionaisInicializados) return;
    const inicial: Record<string, number> = {};
    for (const item of adicionaisDisponiveis) {
      inicial[item.id] = item.quantidadeSugerida ?? 0;
    }
    setAdicionais(inicial);
    setAdicionaisInicializados(true);
  }, [adicionaisDisponiveis, adicionaisInicializados]);

  const violacoesBloqueio = useMemo(
    () => violacoes.filter((v) => v.nivel === 'BLOQUEAR'),
    [violacoes],
  );
  const violacoesAviso = useMemo(
    () => violacoes.filter((v) => v.nivel === 'AVISAR'),
    [violacoes],
  );

  /* Reset confirmacao de aviso quando seleções mudam */
  useEffect(() => {
    setAvisoConfirmado(false);
  }, [sel, numeroPessoas, ocasiao]);

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
    const keys: string[] = ['pessoas'];
    keys.push(...steps.map((s) => s.key));
    keys.push('mensagem');
    keys.push('adicionais');
    keys.push('resumo');
    return keys;
  }, [steps]);

  const totalSteps = allStepKeys.length;
  const currentKey = allStepKeys[step] ?? 'resumo';
  const cur = steps.find((s) => s.key === currentKey);
  const isPessoasStep = currentKey === 'pessoas';
  const isMessageStep = currentKey === 'mensagem';
  const isAdicionaisStep = currentKey === 'adicionais';
  const isResumoStep = currentKey === 'resumo';
  const isLastStep = step === totalSteps - 1;
  const isTamanhoStep = currentKey === 'tamanho';
  const pessoasPreenchido = !!numeroPessoas && !!ocasiao && Number(numeroPessoas) > 0;
  const resumoBloqueado =
    isResumoStep &&
    (violacoesBloqueio.length > 0 ||
      (violacoesAviso.length > 0 && !avisoConfirmado));

  /* Avalia regras ao entrar no resumo */
  useEffect(() => {
    if (!produto || currentKey !== 'resumo') return;
    let cancelado = false;
    avaliarRegras({
      produtoId: produto.id,
      opcoesEscolhidas: sel,
      numeroPessoas: typeof numeroPessoas === 'number' ? numeroPessoas : undefined,
    })
      .then((res) => {
        if (!cancelado) setViolacoes(res.violacoes);
      })
      .catch(() => {
        if (!cancelado) setViolacoes([]);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, produto?.id, JSON.stringify(sel), numeroPessoas]);
  const canAdvance =
    isMessageStep ||
    isAdicionaisStep ||
    (isResumoStep && !resumoBloqueado) ||
    (isPessoasStep && pessoasPreenchido) ||
    (cur && sel[cur.key]);

  /* Subtotal dos adicionais selecionados */
  const adicionaisSelecionados = useMemo(() => {
    return adicionaisDisponiveis
      .filter((it) => (adicionais[it.id] ?? 0) > 0)
      .map((it) => ({
        ...it,
        quantidade: adicionais[it.id],
      }));
  }, [adicionaisDisponiveis, adicionais]);

  const adicionaisSubtotal = useMemo(() => {
    return adicionaisSelecionados.reduce(
      (acc, it) => acc + Number(it.precoVenda) * it.quantidade,
      0,
    );
  }, [adicionaisSelecionados]);

  /** No passo de tamanho, encontra a opção sugerida com base no kg ideal. */
  const sugestaoTamanhoLabel = useMemo(() => {
    if (!isTamanhoStep || !kgSugerido || !cur) return null;
    let melhor: { label: string; diff: number } | null = null;
    for (const opt of cur.opcoes) {
      const kg = extrairKgDoLabel(opt.label);
      if (kg == null) continue;
      // Preferimos opção cujo kg cubra a sugestão ideal (>= ideal)
      const diff = kg >= kgSugerido.ideal ? kg - kgSugerido.ideal : (kgSugerido.ideal - kg) + 1000;
      if (!melhor || diff < melhor.diff) {
        melhor = { label: opt.label, diff };
      }
    }
    return melhor?.label ?? null;
  }, [isTamanhoStep, kgSugerido, cur]);

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
      if (violacoesBloqueio.length > 0) {
        toast.error(violacoesBloqueio[0].mensagem);
        return;
      }
      if (violacoesAviso.length > 0 && !avisoConfirmado) {
        toast(
          'Marca o "ciente" no aviso pra prosseguir',
          { icon: '⚠️', duration: 3500 },
        );
        return;
      }
      handleAddToCart();
    } else if (isMessageStep || isAdicionaisStep) {
      // mensagem e adicionais são sempre opcionais, pode avançar
      setStep((s) => s + 1);
    } else if (isPessoasStep) {
      if (!pessoasPreenchido) {
        toast.error('Conta pra gente pra quantas pessoas é');
        return;
      }
      setStep((s) => s + 1);
    } else if (canAdvance) {
      setStep((s) => s + 1);
    } else {
      toast.error('Selecione uma opção para continuar');
    }
  };

  const ajustarAdicional = (id: string, delta: number) => {
    setAdicionais((prev) => {
      const atual = prev[id] ?? 0;
      const novo = Math.max(0, atual + delta);
      return { ...prev, [id]: novo };
    });
  };

  const setAdicional = (id: string, quantidade: number) => {
    setAdicionais((prev) => ({ ...prev, [id]: Math.max(0, quantidade) }));
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

    const pessoasNum = typeof numeroPessoas === 'number' ? numeroPessoas : undefined;
    addItem({
      produtoId: produto.id,
      nome,
      precoUnitario: precoTotal,
      pontosEsforco: pontosTotal,
      quantidade: 1,
      imagemUrl: produto.imagemUrl,
      opcoesEscolhidas: sel,
      personalizacao: personalizacao || undefined,
      numeroPessoas: pessoasNum,
      ocasiao: ocasiao ?? undefined,
      modalidadesPermitidas: produto.modalidadesPermitidas,
    });

    // Adiciona cada ADICIONAL escolhido como item separado do carrinho
    for (const it of adicionaisSelecionados) {
      addItem({
        produtoId: it.id,
        nome: it.nome,
        precoUnitario: Number(it.precoVenda),
        pontosEsforco: it.pontosEsforco,
        quantidade: it.quantidade,
        imagemUrl: it.imagemUrl,
        modalidadesPermitidas: it.modalidadesPermitidas,
      });
    }

    // Persiste no carrinho global pra propagar ao backend no checkout
    setOcasiaoGlobal(pessoasNum ?? null, ocasiao);
    toast.success('Bolo adicionado ao carrinho!');
    setShowAdded(true);
  };

  const handleWhatsApp = async () => {
    if (!produto) return;
    setEnviandoWhatsApp(true);
    try {
      const parts = steps.map((st) => sel[st.key]).filter(Boolean);
      const nome = parts.length > 0 ? `${produto.nome} (${parts.join(' · ')})` : produto.nome;
      const pessoasNum = typeof numeroPessoas === 'number' ? numeroPessoas : undefined;

      let pedidoId: string | undefined;
      if (isAuthenticated) {
        const itensPayload = [
          {
            produtoId: produto.id,
            quantidade: 1,
            opcoesEscolhidas: sel,
            personalizacao: personalizacao || undefined,
          },
          ...adicionaisSelecionados.map((it) => ({
            produtoId: it.id,
            quantidade: it.quantidade,
          })),
        ];
        try {
          const rascunho = await criarRascunho({
            itens: itensPayload,
            numeroPessoas: pessoasNum,
            ocasiao: ocasiao ?? undefined,
            observacoes: personalizacao || undefined,
          });
          pedidoId = rascunho.id;
        } catch {
          // ja exibiu toast — segue abrindo wa.me sem pedidoId
        }
      }

      const url = gerarLinkWhatsApp(WHATSAPP_NUMBER, {
        produtoNome: nome,
        numeroPessoas: pessoasNum,
        ocasiao: ocasiao ?? undefined,
        opcoesEscolhidas: sel,
        personalizacao: personalizacao || undefined,
        adicionais: adicionaisSelecionados.map((it) => ({
          nome: it.nome,
          quantidade: it.quantidade,
        })),
        valorTotal: precoTotal + adicionaisSubtotal,
        pedidoId,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setEnviandoWhatsApp(false);
    }
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
                    ) : isAdicionaisStep ? (
                      <>quer levar <span style={{ color: BRAND.rosa }}>docinhos</span>?</>
                    ) : isPessoasStep ? (
                      <>pra <span style={{ color: BRAND.rosa }}>quantas pessoas</span>?</>
                    ) : (
                      <>escolha o <span style={{ color: BRAND.rosa }}>{currentKey}</span></>
                    )}
                  </h2>

                  {isPessoasStep ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                      <p style={{ fontSize: 15, color: BRAND.marrom + 'aa', lineHeight: 1.55, margin: 0 }}>
                        A gente calcula o tamanho ideal pra você não comprar a menos.
                        Aceita ajuste no próximo passo.
                      </p>

                      {/* Input de número de pessoas */}
                      <div>
                        <div className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                          número de pessoas
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            type="button"
                            onClick={() => setNumeroPessoas((p) => Math.max(1, (Number(p) || 1) - 5))}
                            disabled={!numeroPessoas || Number(numeroPessoas) <= 1}
                            style={{
                              width: 44, height: 44, borderRadius: 999,
                              border: `2px solid ${BRAND.begeEsc}`, background: BRAND.branco,
                              color: BRAND.marrom, fontSize: 20, fontWeight: 700, cursor: 'pointer',
                              opacity: !numeroPessoas || Number(numeroPessoas) <= 1 ? 0.3 : 1,
                            }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={500}
                            value={numeroPessoas}
                            onChange={(e) => {
                              const v = e.target.value;
                              setNumeroPessoas(v === '' ? '' : Math.max(1, Math.min(500, parseInt(v, 10) || 0)));
                            }}
                            placeholder="ex: 30"
                            style={{
                              flex: 1, maxWidth: 220, padding: '12px 18px', borderRadius: 16,
                              border: `2px solid ${numeroPessoas ? BRAND.rosa : BRAND.begeEsc}`,
                              background: BRAND.branco, fontFamily: 'Fraunces, serif',
                              fontSize: 36, fontWeight: 800, color: BRAND.marrom, textAlign: 'center',
                              outline: 'none', transition: 'border-color 0.3s',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setNumeroPessoas((p) => Math.min(500, (Number(p) || 0) + 5))}
                            style={{
                              width: 44, height: 44, borderRadius: 999,
                              border: `2px solid ${BRAND.begeEsc}`, background: BRAND.branco,
                              color: BRAND.marrom, fontSize: 20, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            +
                          </button>
                          <span className="font-mono" style={{ fontSize: 11, color: BRAND.marrom + '88', letterSpacing: '0.06em' }}>
                            pessoas
                          </span>
                        </div>
                      </div>

                      {/* Seleção de ocasião */}
                      <div>
                        <div className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                          ocasião
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                          {OCASIOES.map((oc, i) => {
                            const selected = ocasiao === oc.value;
                            return (
                              <motion.button
                                key={oc.value}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setOcasiao(oc.value)}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                  padding: 16, borderRadius: 18, textAlign: 'left',
                                  border: `2px solid ${selected ? BRAND.rosa : BRAND.begeEsc}`,
                                  background: selected ? BRAND.rosa : BRAND.branco,
                                  color: selected ? BRAND.bege : BRAND.marrom,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                                  transition: 'all 0.2s',
                                }}
                              >
                                <span style={{ fontSize: 22 }}>{oc.emoji}</span>
                                <div>
                                  <div className="font-display" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>
                                    {oc.label}
                                  </div>
                                  <div className="font-mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 2, letterSpacing: '0.04em' }}>
                                    {oc.gramasPorPessoa}g/pessoa
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Preview do kg sugerido */}
                      <AnimatePresence>
                        {kgSugerido && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            style={{
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                padding: 24, borderRadius: 20,
                                background: `linear-gradient(135deg, ${BRAND.rosa}14, ${BRAND.roxo}10)`,
                                border: `1.5px dashed ${BRAND.rosa}55`,
                                display: 'flex', alignItems: 'center', gap: 20,
                              }}
                            >
                              <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: BRAND.rosa, color: BRAND.bege,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <Users size={24} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="font-mono" style={{ fontSize: 10, color: BRAND.marrom + 'aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                                  sugestão da Vann
                                </div>
                                <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: BRAND.marrom, lineHeight: 1.1 }}>
                                  bolo de{' '}
                                  <span style={{ color: BRAND.rosa }}>
                                    {kgSugerido.min.toFixed(1).replace('.', ',')} a {kgSugerido.max.toFixed(1).replace('.', ',')} kg
                                  </span>
                                </div>
                                <div className="font-body" style={{ fontSize: 12, color: BRAND.marrom + '88', marginTop: 4 }}>
                                  inclui 10% de folga · você pode ajustar no próximo passo
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : isResumoStep ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <p style={{ fontSize: 15, color: BRAND.marrom + 'aa', lineHeight: 1.5, margin: 0 }}>
                        Confira as escolhas do seu bolo antes de adicionar ao carrinho.
                      </p>

                      {/* Violações BLOQUEAR */}
                      {violacoesBloqueio.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {violacoesBloqueio.map((v) => (
                            <div
                              key={v.regraId}
                              style={{
                                padding: 16,
                                borderRadius: 16,
                                background: '#FFE8E8',
                                border: '1.5px solid #CC0000',
                                display: 'flex',
                                gap: 12,
                                alignItems: 'flex-start',
                              }}
                            >
                              <AlertOctagon
                                size={20}
                                color="#CC0000"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <div>
                                <div
                                  className="font-mono"
                                  style={{
                                    fontSize: 10,
                                    color: '#CC0000',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    marginBottom: 4,
                                  }}
                                >
                                  não dá pra prosseguir
                                </div>
                                <div style={{ fontSize: 14, color: BRAND.marrom, fontWeight: 600, marginBottom: 2 }}>
                                  {v.nome}
                                </div>
                                <div style={{ fontSize: 13, color: `${BRAND.marrom}aa`, lineHeight: 1.45 }}>
                                  {v.mensagem}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Violações AVISAR */}
                      {violacoesAviso.length > 0 && (
                        <div
                          style={{
                            padding: 16,
                            borderRadius: 16,
                            background: '#FFF4D6',
                            border: '1.5px solid #E0A800',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                          }}
                        >
                          {violacoesAviso.map((v) => (
                            <div key={v.regraId} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                              <AlertTriangle
                                size={20}
                                color="#B08000"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <div>
                                <div
                                  className="font-mono"
                                  style={{
                                    fontSize: 10,
                                    color: '#B08000',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    marginBottom: 4,
                                  }}
                                >
                                  atenção
                                </div>
                                <div style={{ fontSize: 14, color: BRAND.marrom, fontWeight: 600, marginBottom: 2 }}>
                                  {v.nome}
                                </div>
                                <div style={{ fontSize: 13, color: `${BRAND.marrom}cc`, lineHeight: 1.45 }}>
                                  {v.mensagem}
                                </div>
                              </div>
                            </div>
                          ))}
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              borderRadius: 12,
                              background: BRAND.branco,
                              cursor: 'pointer',
                              border: `1.5px solid ${avisoConfirmado ? BRAND.rosa : BRAND.begeEsc}`,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={avisoConfirmado}
                              onChange={(e) => setAvisoConfirmado(e.target.checked)}
                              style={{ accentColor: BRAND.rosa, width: 18, height: 18 }}
                            />
                            <span style={{ fontSize: 13, color: BRAND.marrom, fontWeight: 600 }}>
                              estou ciente dos avisos acima
                            </span>
                          </label>
                        </div>
                      )}

                      {avaliandoRegras && (
                        <div
                          className="font-mono"
                          style={{
                            fontSize: 11,
                            color: `${BRAND.marrom}66`,
                            letterSpacing: '0.05em',
                          }}
                        >
                          validando combinação…
                        </div>
                      )}


                      {/* Resumo das escolhas */}
                      <div style={{
                        background: BRAND.branco, borderRadius: 20, padding: 24,
                        border: `1px solid ${BRAND.begeEsc}`,
                      }}>
                        {numeroPessoas && ocasiao && (
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 0',
                            borderBottom: `1px dashed ${BRAND.begeEsc}`,
                          }}>
                            <div>
                              <span className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                👥 pessoas & ocasião
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: BRAND.marrom }}>
                                {numeroPessoas} pessoas
                              </span>
                              <span className="font-mono" style={{ fontSize: 11, color: BRAND.marrom + '88', marginLeft: 8 }}>
                                {OCASIOES.find((o) => o.value === ocasiao)?.label}
                              </span>
                            </div>
                          </div>
                        )}
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

                        {/* Adicionais escolhidos */}
                        {adicionaisSelecionados.length > 0 && (
                          <div style={{ padding: '14px 0', borderBottom: `1px dashed ${BRAND.begeEsc}` }}>
                            <span className="font-mono" style={{ fontSize: 10, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              🍬 adicionais
                            </span>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {adicionaisSelecionados.map((it) => (
                                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                  <span style={{ color: BRAND.marrom }}>
                                    <strong>{it.quantidade}×</strong> {it.nome}
                                  </span>
                                  <span className="font-mono" style={{ color: BRAND.rosa, fontWeight: 700 }}>
                                    + R$ {(Number(it.precoVenda) * it.quantidade).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
                        display: 'flex', flexDirection: 'column', gap: 6,
                      }}>
                        {adicionaisSubtotal > 0 && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: BRAND.bege, opacity: 0.7 }}>
                              <span>bolo</span>
                              <span>R$ {precoTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: BRAND.bege, opacity: 0.7 }}>
                              <span>adicionais</span>
                              <span>R$ {adicionaisSubtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div style={{ borderTop: `1px dashed ${BRAND.bege}33`, marginTop: 4 }} />
                          </>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="font-mono" style={{ fontSize: 12, color: BRAND.bege, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            total
                          </span>
                          <span className="font-display" style={{ fontSize: 36, fontWeight: 800, color: BRAND.rosa }}>
                            R$ {(precoTotal + adicionaisSubtotal).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
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
                  ) : isAdicionaisStep ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <p style={{ fontSize: 15, color: BRAND.marrom + 'aa', lineHeight: 1.55, margin: 0 }}>
                        {adicionaisResp?.meta.totalSugerido && adicionaisResp.meta.totalSugerido > 0 ? (
                          <>
                            Pra {numeroPessoas} pessoas a gente sugere{' '}
                            <strong style={{ color: BRAND.rosa }}>
                              {adicionaisResp.meta.totalSugerido} docinhos
                            </strong>{' '}
                            ({adicionaisResp.meta.docinhosPorPessoa}/pessoa). Pode ajustar
                            ou pular essa etapa.
                          </>
                        ) : (
                          <>
                            Acompanhamentos opcionais pro seu bolo. Pode pular se não
                            quiser nada além do bolo.
                          </>
                        )}
                      </p>

                      {adicionaisDisponiveis.length === 0 ? (
                        <div
                          style={{
                            padding: 32,
                            borderRadius: 20,
                            background: BRAND.branco,
                            border: `1px dashed ${BRAND.begeEsc}`,
                            textAlign: 'center',
                            color: `${BRAND.marrom}99`,
                            fontSize: 14,
                          }}
                        >
                          Sem adicionais cadastrados no momento — siga pro resumo.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                          {adicionaisDisponiveis.map((it: AdicionalItem, i: number) => {
                            const qtd = adicionais[it.id] ?? 0;
                            const ativo = qtd > 0;
                            const ehPorcao = it.unidade === 'PORCAO';
                            const subtotal = Number(it.precoVenda) * qtd;
                            return (
                              <motion.div
                                key={it.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                  padding: 18,
                                  borderRadius: 18,
                                  background: ativo ? `${BRAND.rosa}08` : BRAND.branco,
                                  border: `2px solid ${ativo ? BRAND.rosa : BRAND.begeEsc}`,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 12,
                                  transition: 'border-color 0.2s, background 0.2s',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                  <div style={{ flex: 1 }}>
                                    <div className="font-display" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.15, color: BRAND.marrom }}>
                                      {it.nome}
                                    </div>
                                    {it.descricao && (
                                      <div style={{ fontSize: 12, color: `${BRAND.marrom}88`, marginTop: 4, lineHeight: 1.4 }}>
                                        {it.descricao}
                                      </div>
                                    )}
                                  </div>
                                  {ehPorcao && it.quantidadeSugerida > 0 && (
                                    <div
                                      className="font-mono"
                                      style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: '3px 8px',
                                        borderRadius: 999,
                                        background: `${BRAND.rosa}15`,
                                        color: BRAND.rosa,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                      }}
                                    >
                                      sugestão {it.quantidadeSugerida}
                                    </div>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                  <div className="font-mono" style={{ fontSize: 12, color: `${BRAND.marrom}77` }}>
                                    R$ {Number(it.precoVenda).toFixed(2).replace('.', ',')}
                                    {ehPorcao ? ' / un' : ''}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <button
                                      type="button"
                                      onClick={() => ajustarAdicional(it.id, -1)}
                                      disabled={qtd === 0}
                                      style={{
                                        width: 32, height: 32, borderRadius: 999,
                                        border: `1.5px solid ${BRAND.begeEsc}`,
                                        background: BRAND.branco,
                                        color: BRAND.marrom,
                                        cursor: qtd === 0 ? 'not-allowed' : 'pointer',
                                        opacity: qtd === 0 ? 0.3 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}
                                      aria-label="Diminuir"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      max={999}
                                      value={qtd}
                                      onChange={(e) => setAdicional(it.id, parseInt(e.target.value || '0', 10))}
                                      style={{
                                        width: 56, padding: '6px 8px', borderRadius: 10,
                                        border: `1.5px solid ${ativo ? BRAND.rosa : BRAND.begeEsc}`,
                                        background: BRAND.branco,
                                        fontFamily: 'Space Grotesk, monospace',
                                        fontSize: 14, fontWeight: 700,
                                        color: BRAND.marrom,
                                        textAlign: 'center', outline: 'none',
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => ajustarAdicional(it.id, 1)}
                                      style={{
                                        width: 32, height: 32, borderRadius: 999,
                                        border: `1.5px solid ${ativo ? BRAND.rosa : BRAND.begeEsc}`,
                                        background: ativo ? BRAND.rosa : BRAND.branco,
                                        color: ativo ? BRAND.bege : BRAND.marrom,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}
                                      aria-label="Aumentar"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>

                                {ativo && (
                                  <div className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, fontWeight: 700, textAlign: 'right' }}>
                                    + R$ {subtotal.toFixed(2).replace('.', ',')}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Subtotal de adicionais */}
                      {adicionaisSubtotal > 0 && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '14px 18px',
                            borderRadius: 14,
                            background: BRAND.marrom,
                            color: BRAND.bege,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span className="font-mono" style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            adicionais
                          </span>
                          <span className="font-display" style={{ fontSize: 20, fontWeight: 800, color: BRAND.rosa }}>
                            + R$ {adicionaisSubtotal.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : cur ? (
                    <>
                      {/* Banner de sugestão no passo de tamanho */}
                      {isTamanhoStep && kgSugerido && sugestaoTamanhoLabel && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            marginBottom: 16, padding: '14px 18px', borderRadius: 14,
                            background: `${BRAND.rosa}10`,
                            border: `1.5px dashed ${BRAND.rosa}55`,
                            display: 'flex', alignItems: 'center', gap: 12,
                            fontSize: 13, color: BRAND.marrom,
                          }}
                        >
                          <Sparkles size={16} style={{ color: BRAND.rosa, flexShrink: 0 }} />
                          <span>
                            Pra <strong>{numeroPessoas} pessoas</strong>, recomendamos{' '}
                            <strong style={{ color: BRAND.rosa }}>{sugestaoTamanhoLabel}</strong>
                            {' '}— já marcado como sugestão.
                          </span>
                        </motion.div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {cur.opcoes.map((opt, i) => {
                          const selected = sel[cur.key] === opt.label;
                          const extra = Number(opt.precoExtra);
                          const sugerido = isTamanhoStep && opt.label === sugestaoTamanhoLabel;
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
                                border: `2.5px solid ${selected ? BRAND.rosa : sugerido ? BRAND.rosa + '88' : BRAND.begeEsc}`,
                                background: selected ? BRAND.rosa : BRAND.branco,
                                color: selected ? BRAND.bege : BRAND.marrom,
                                cursor: 'pointer', position: 'relative',
                                transition: 'border-color 0.2s, background 0.2s, color 0.2s',
                              }}
                            >
                              {sugerido && !selected && (
                                <div
                                  className="font-mono"
                                  style={{
                                    position: 'absolute', top: -10, left: 16,
                                    padding: '2px 8px', borderRadius: 999,
                                    background: BRAND.rosa, color: BRAND.bege,
                                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  ✦ sugerido
                                </div>
                              )}
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
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* ── Navigation ── */}
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
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
                  ) : isAdicionaisStep ? (
                    <>ver resumo <ArrowRight size={16} /></>
                  ) : (
                    <>próximo <ArrowRight size={16} /></>
                  )}
                </motion.button>
                {isResumoStep && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWhatsApp}
                    disabled={enviandoWhatsApp || rascunhoSalvando}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '14px 24px', borderRadius: 999,
                      background: '#25D366', border: 'none',
                      color: BRAND.branco, fontWeight: 700, fontSize: 14,
                      cursor: enviandoWhatsApp ? 'wait' : 'pointer',
                      opacity: enviandoWhatsApp ? 0.7 : 1,
                      boxShadow: '0 4px 16px rgba(37,211,102,0.32)',
                      transition: 'opacity 0.2s',
                    }}
                    title="Continuar pelo WhatsApp com o resumo deste pedido"
                  >
                    <MessageCircle size={16} />
                    {enviandoWhatsApp ? 'abrindo…' : 'continuar pelo whatsapp'}
                  </motion.button>
                )}
              </div>
              {isResumoStep && (
                <p
                  className="font-mono"
                  style={{
                    marginTop: 12,
                    fontSize: 11,
                    color: `${BRAND.marrom}88`,
                    letterSpacing: '0.04em',
                  }}
                >
                  prefere fechar pelo whatsapp? a gente leva o resumo deste pedido pra conversa{isAuthenticated ? ' e registra como lead' : ''}.
                </p>
              )}
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
                  {numeroPessoas && ocasiao && (
                    <div
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: `1px dashed ${BRAND.bege}18`,
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        👥 pessoas
                      </span>
                      <span className="font-display" style={{ fontWeight: 600, fontSize: 14 }}>
                        {numeroPessoas}
                        <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 4 }}>
                          · {OCASIOES.find((o) => o.value === ocasiao)?.label}
                        </span>
                      </span>
                    </div>
                  )}
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
