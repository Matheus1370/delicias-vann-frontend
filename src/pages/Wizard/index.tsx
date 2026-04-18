import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProduct } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cart.store';
import { BRAND } from '../../styles/brand';

const EMOJIS: Record<string, string> = {
  tamanho: '📏',
  massa: '🧁',
  recheio: '🍬',
  cobertura: '🍫',
};

const ETAPA_LABEL: Record<string, string> = {
  tamanho: 'Qual tamanho?',
  massa: 'Qual massa?',
  recheio: 'Qual recheio?',
  cobertura: 'Qual cobertura?',
};

interface OpcaoMontagem {
  id: string;
  etapa: string;
  label: string;
  descricao?: string;
  precoExtra: string | number;
  pontosExtra: number;
  ordem: number;
}

export default function WizardPage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { data: produto, isLoading } = useProduct('bolo-personalizado');

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [personalizacao, setPersonalizacao] = useState('');
  const [showAdded, setShowAdded] = useState(false);

  const steps = useMemo(() => {
    if (!produto?.opcoesMontagem) return [];
    const byEtapa = new Map<string, OpcaoMontagem[]>();
    for (const op of produto.opcoesMontagem) {
      const arr = byEtapa.get(op.etapa) ?? [];
      arr.push(op);
      byEtapa.set(op.etapa, arr);
    }
    return Array.from(byEtapa.entries()).map(([etapa, opcoes]) => ({
      key: etapa,
      titulo: ETAPA_LABEL[etapa] ?? etapa,
      emoji: EMOJIS[etapa] ?? '✨',
      opcoes: opcoes.sort((a, b) => a.ordem - b.ordem),
    }));
  }, [produto]);

  const done = step >= steps.length && steps.length > 0;
  const cur = steps[step];

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

  const handleAddToCart = () => {
    if (!produto) return;
    addItem({
      produtoId: produto.id,
      nome: `${produto.nome} (${sel.massa ?? ''}, ${sel.recheio ?? ''})`,
      precoUnitario: precoTotal,
      pontosEsforco: pontosTotal,
      quantidade: 1,
      opcoesEscolhidas: sel,
      personalizacao,
    });
    toast.success('Bolo adicionado ao carrinho!');
    setShowAdded(true);
  };

  if (isLoading || !produto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bege font-body">
        <div className="text-brand-marrom/60 font-medium">Carregando...</div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bege font-body py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl font-black text-brand-marrom">
            Nenhuma opção de montagem cadastrada.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bege font-body py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/cardapio"
          className="inline-flex items-center gap-1 text-sm font-bold text-brand-marrom/60 hover:text-brand-rosa transition-colors mb-6"
        >
          ← Voltar ao cardápio
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-black text-brand-marrom tracking-tight">
            monte seu <span className="text-brand-rosa italic">bolo</span>
          </h1>
          <p className="text-brand-marrom/60 mt-3 font-medium">
            Preço em tempo real · {pontosTotal} ponto{pontosTotal !== 1 ? 's' : ''} de esforço ·
            pronto em {produto.leadTimeHoras}h
          </p>
          {produto.alergenicos?.length > 0 && (
            <div className="mt-3 flex gap-2 justify-center flex-wrap">
              {produto.alergenicos.map((a: string) => (
                <span
                  key={a}
                  className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: '#FFF0E8', color: '#B5651D' }}
                >
                  contém {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-8">
          {steps.map((_s, i) => (
            <div
              key={i}
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: '#E8D8CE' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: i < step ? BRAND.rosa : i === step ? BRAND.ciano : 'transparent',
                }}
                initial={{ width: 0 }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <div
          className="bg-white rounded-3xl overflow-hidden border-2 shadow-xl"
          style={{ borderColor: BRAND.rosa + '44' }}
        >
          <div className="px-6 py-4" style={{ background: done ? BRAND.ciano : BRAND.rosa }}>
            <span className="text-white font-bold text-sm tracking-wide">
              {done ? 'Resumo do Pedido' : `Passo ${step + 1} de ${steps.length} · ${cur?.titulo}`}
            </span>
          </div>

          <div className="p-6 min-h-72">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {!done && cur ? (
                  <div className="flex flex-col gap-3">
                    {cur.opcoes.map((opt) => {
                      const selected = sel[cur.key] === opt.label;
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSel((s) => ({ ...s, [cur.key]: opt.label }))}
                          className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                          style={{
                            border: selected
                              ? `2.5px solid ${BRAND.rosa}`
                              : `1.5px solid ${BRAND.begeEsc}`,
                            background: selected ? BRAND.rosa + '11' : BRAND.branco,
                          }}
                        >
                          <span className="text-3xl">{cur.emoji}</span>
                          <div className="flex-1">
                            <div className="font-bold text-brand-marrom">{opt.label}</div>
                            {opt.descricao && (
                              <div className="text-sm text-brand-marrom/60 font-medium">
                                {opt.descricao}
                              </div>
                            )}
                          </div>
                          {Number(opt.precoExtra) > 0 && (
                            <span
                              className="text-xs font-bold px-2 py-1 rounded-full"
                              style={{ background: BRAND.ciano + '22', color: BRAND.ciano }}
                            >
                              +R$ {Number(opt.precoExtra).toFixed(0)}
                            </span>
                          )}
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: BRAND.rosa }}
                            >
                              <span className="text-white text-xs font-bold">✓</span>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <div className="font-display text-2xl font-bold text-brand-marrom mb-4">
                      Que bolo!
                    </div>
                    <div className="space-y-2 mb-4">
                      {Object.entries(sel).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between py-2 border-b border-brand-bege"
                        >
                          <span className="text-brand-marrom/60 capitalize font-medium text-sm">
                            {k}
                          </span>
                          <span className="font-bold text-brand-marrom text-sm">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="text-xs font-bold text-brand-marrom/60 uppercase tracking-wider block mb-2">
                        Texto para plaquinha / observações
                      </label>
                      <textarea
                        value={personalizacao}
                        onChange={(e) => setPersonalizacao(e.target.value)}
                        placeholder="Ex: Feliz Aniversário João!"
                        className="w-full p-3 rounded-xl text-sm font-medium resize-none outline-none"
                        style={{
                          border: `1.5px solid ${BRAND.begeEsc}`,
                          fontFamily: 'Quicksand',
                          minHeight: 72,
                        }}
                      />
                    </div>
                    <div
                      className="mt-4 p-4 rounded-2xl flex justify-between items-center"
                      style={{
                        background: BRAND.rosa + '11',
                        border: `1.5px solid ${BRAND.rosa}44`,
                      }}
                    >
                      <div>
                        <div className="text-xs text-brand-marrom/60 font-medium">Total</div>
                        <div
                          className="font-display text-2xl font-black"
                          style={{ color: BRAND.rosa }}
                        >
                          R$ {precoTotal.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-brand-marrom/60 font-medium">Esforço</div>
                        <div className="font-bold text-brand-marrom">{pontosTotal} pts</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-4 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                style={{
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  color: BRAND.marrom + '88',
                  background: 'transparent',
                }}
              >
                ← voltar
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (done) handleAddToCart();
                else if (cur && sel[cur.key]) setStep((s) => s + 1);
              }}
              disabled={!done && (!cur || !sel[cur.key])}
              className="flex-[2] py-3 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-40"
              style={{
                background: done ? BRAND.ciano : BRAND.rosa,
                boxShadow: `0 4px 20px ${BRAND.rosa}44`,
              }}
            >
              {done
                ? 'Adicionar ao Carrinho'
                : step >= steps.length - 1
                  ? 'ver resumo →'
                  : 'próximo →'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showAdded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center"
            >
              <span className="text-5xl block mb-4">🎂</span>
              <h2 className="font-display text-2xl font-black text-brand-marrom mb-2">
                Adicionado ao carrinho!
              </h2>
              <p className="font-body text-sm text-brand-marrom/60 mb-6">
                Seu bolo personalizado já está no carrinho.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/cardapio')}
                  className="border border-brand-rosa text-brand-rosa px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-rosa/5 transition-colors"
                >
                  Continuar comprando
                </button>
                <button
                  onClick={() => navigate('/checkout')}
                  className="bg-brand-rosa text-white px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Ir para checkout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
