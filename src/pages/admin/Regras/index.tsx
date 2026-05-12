import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Plus, Trash2, X as XIcon, Code } from 'lucide-react';
import {
  useRegras,
  useCreateRegra,
  useUpdateRegra,
  useDeleteRegra,
  type Regra,
  type NivelRegra,
} from '../../../hooks/useRegras';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';
import toast from 'react-hot-toast';

interface FormState {
  id?: string;
  nome: string;
  nivel: NivelRegra;
  mensagem: string;
  ativa: boolean;
  condicaoJson: string;
}

const EMPTY_FORM: FormState = {
  nome: '',
  nivel: 'AVISAR',
  mensagem: '',
  ativa: true,
  condicaoJson: JSON.stringify(
    {
      todos: [{ tipo: 'OPCAO_CONTEM', etapa: 'cobertura', valor: 'chantilly' }],
    },
    null,
    2,
  ),
};

const TIPOS_DOC = `Tipos de predicado suportados:

OPCAO_CONTEM   { tipo: "OPCAO_CONTEM", etapa: "cobertura", valor: "chantilly" }
MODALIDADE_IN  { tipo: "MODALIDADE_IN", valores: ["UBER_DIRECT", "NOVENTA_NOVE_ENTREGAS"] }
TEMPERATURA_GTE { tipo: "TEMPERATURA_GTE", valor: 28 }
PRAZO_HORAS_LTE { tipo: "PRAZO_HORAS_LTE", valor: 48 }
PRODUTO_TIPO   { tipo: "PRODUTO_TIPO", valor: "MONTAVEL" }

Todos os predicados em "todos" precisam bater (AND) pra regra disparar.`;

export default function AdminRegras() {
  const { data: regras = [], isLoading } = useRegras();
  const { mutateAsync: criar, isPending: criando } = useCreateRegra();
  const { mutateAsync: editar, isPending: editando } = useUpdateRegra();
  const { mutateAsync: remover } = useDeleteRegra();

  const [modal, setModal] = useState<FormState | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  const openCreate = () => setModal({ ...EMPTY_FORM });
  const openEdit = (r: Regra) =>
    setModal({
      id: r.id,
      nome: r.nome,
      nivel: r.nivel,
      mensagem: r.mensagem,
      ativa: r.ativa,
      condicaoJson: JSON.stringify(r.condicao, null, 2),
    });

  const closeModal = () => setModal(null);

  const submit = async () => {
    if (!modal) return;
    let condicao: any;
    try {
      condicao = JSON.parse(modal.condicaoJson);
    } catch (err: any) {
      toast.error('JSON inválido na condição');
      return;
    }
    const payload = {
      nome: modal.nome,
      nivel: modal.nivel,
      mensagem: modal.mensagem,
      ativa: modal.ativa,
      condicao,
    };
    if (modal.id) {
      await editar({ id: modal.id, data: payload });
    } else {
      await criar(payload);
    }
    setModal(null);
  };

  const toggleAtiva = (r: Regra) => {
    editar({ id: r.id, data: { ativa: !r.ativa } });
  };

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 12,
              color: BRAND.rosa,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'Space Grotesk',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star11 size={12} color={BRAND.rosa} /> proteção da cozinha
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: 8,
            }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 700,
                fontStyle: 'italic',
                color: BRAND.marrom,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              regras<span style={{ color: BRAND.rosa }}>.</span>
            </h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setDocOpen((v) => !v)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  background: BRAND.branco,
                  color: BRAND.marrom,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Code size={14} /> esquema de predicados
              </button>
              <button
                onClick={openCreate}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  background: BRAND.rosa,
                  color: BRAND.branco,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} /> nova regra
              </button>
            </div>
          </div>
          {docOpen && (
            <pre
              style={{
                marginTop: 16,
                padding: 16,
                background: BRAND.marrom,
                color: BRAND.bege,
                borderRadius: 16,
                fontSize: 12,
                fontFamily: 'Space Grotesk, monospace',
                whiteSpace: 'pre-wrap',
              }}
            >
              {TIPOS_DOC}
            </pre>
          )}
        </motion.div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77`, fontWeight: 500 }}>
            Carregando regras...
          </div>
        ) : (
          <div
            style={{
              background: BRAND.branco,
              borderRadius: 24,
              border: `1px solid ${BRAND.begeEsc}`,
              padding: 24,
            }}
          >
            {regras.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: `${BRAND.marrom}66`, fontSize: 14 }}>
                Nenhuma regra cadastrada ainda.
              </div>
            ) : (
              <AnimatePresence>
                {regras.map((r, i) => {
                  const Icon = r.nivel === 'BLOQUEAR' ? AlertOctagon : AlertTriangle;
                  const tom = r.nivel === 'BLOQUEAR' ? '#CC0000' : '#B08000';
                  const tomFundo = r.nivel === 'BLOQUEAR' ? '#FFE8E8' : '#FFF4D6';
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        padding: '16px 0',
                        borderBottom: i < regras.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: tomFundo,
                          color: tom,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 15 }}>{r.nome}</span>
                          <span
                            className="font-mono"
                            style={{
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: tom,
                              color: BRAND.branco,
                              fontSize: 9,
                              fontWeight: 800,
                              letterSpacing: '0.1em',
                            }}
                          >
                            {r.nivel}
                          </span>
                          {!r.ativa && (
                            <span
                              className="font-mono"
                              style={{
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: BRAND.begeEsc,
                                color: `${BRAND.marrom}99`,
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                              }}
                            >
                              INATIVA
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: `${BRAND.marrom}aa`, marginTop: 4, lineHeight: 1.4 }}>
                          {r.mensagem}
                        </div>
                        <div
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            color: `${BRAND.marrom}55`,
                            marginTop: 6,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {(r.condicao?.todos ?? [])
                            .map((p: any) => p.tipo)
                            .join(' AND ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            fontSize: 11,
                            color: `${BRAND.marrom}88`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={r.ativa}
                            onChange={() => toggleAtiva(r)}
                            style={{ accentColor: BRAND.rosa }}
                          />
                          ativa
                        </label>
                        <button
                          onClick={() => openEdit(r)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            background: BRAND.bege,
                            color: BRAND.marrom,
                            border: `1.5px solid ${BRAND.begeEsc}`,
                            cursor: 'pointer',
                          }}
                        >
                          editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remover regra "${r.nome}"?`)) remover(r.id);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            background: 'transparent',
                            color: '#CC0000',
                            border: `1.5px solid #FFD0D0`,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed',
              inset: 0,
              background: `${BRAND.marrom}aa`,
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: BRAND.branco,
                borderRadius: 24,
                padding: 28,
                width: '100%',
                maxWidth: 560,
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: BRAND.bege,
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Fechar"
              >
                <XIcon size={16} />
              </button>
              <h2
                className="font-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: BRAND.marrom,
                  margin: '0 0 18px',
                }}
              >
                {modal.id ? 'editar' : 'nova'} <span style={{ color: BRAND.rosa }}>regra</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="nome">
                  <input
                    type="text"
                    value={modal.nome}
                    onChange={(e) => setModal({ ...modal, nome: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>

                <Field label="nível">
                  <select
                    value={modal.nivel}
                    onChange={(e) => setModal({ ...modal, nivel: e.target.value as NivelRegra })}
                    style={inputStyle()}
                  >
                    <option value="AVISAR">AVISAR</option>
                    <option value="BLOQUEAR">BLOQUEAR</option>
                  </select>
                </Field>

                <Field label="mensagem pro cliente">
                  <textarea
                    value={modal.mensagem}
                    onChange={(e) => setModal({ ...modal, mensagem: e.target.value })}
                    rows={3}
                    style={{ ...inputStyle(), resize: 'vertical' }}
                  />
                </Field>

                <Field label="condição (JSON)">
                  <textarea
                    value={modal.condicaoJson}
                    onChange={(e) => setModal({ ...modal, condicaoJson: e.target.value })}
                    rows={8}
                    style={{
                      ...inputStyle(),
                      fontFamily: 'Space Grotesk, monospace',
                      fontSize: 12,
                      resize: 'vertical',
                    }}
                  />
                </Field>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: BRAND.marrom }}>
                  <input
                    type="checkbox"
                    checked={modal.ativa}
                    onChange={(e) => setModal({ ...modal, ativa: e.target.checked })}
                    style={{ accentColor: BRAND.rosa, width: 18, height: 18 }}
                  />
                  ativa
                </label>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: `2px solid ${BRAND.begeEsc}`,
                      color: BRAND.marrom,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    cancelar
                  </button>
                  <button
                    onClick={submit}
                    disabled={criando || editando}
                    style={{
                      flex: 2,
                      padding: '12px 20px',
                      borderRadius: 999,
                      background: BRAND.rosa,
                      color: BRAND.branco,
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: criando || editando ? 'wait' : 'pointer',
                      opacity: criando || editando ? 0.7 : 1,
                    }}
                  >
                    {modal.id ? 'salvar' : 'criar regra'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          color: BRAND.rosa,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: `1.5px solid ${BRAND.begeEsc}`,
    background: BRAND.bege,
    fontFamily: 'inherit',
    fontSize: 14,
    color: BRAND.marrom,
    outline: 'none',
  };
}
