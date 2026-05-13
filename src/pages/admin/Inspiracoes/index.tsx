import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X as XIcon, Eye, EyeOff, ImagePlus } from 'lucide-react';
import {
  useInspiracoesAdmin,
  useCreateInspiracao,
  useUpdateInspiracao,
  useDeleteInspiracao,
  type Inspiracao,
} from '../../../hooks/useInspiracoes';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

interface FormState {
  id?: string;
  titulo: string;
  fotoUrl: string;
  tagsMassa: string;
  tagsRecheio: string;
  tagsCobertura: string;
  tagsTopo: string;
  ocasiao: string;
  publicado: boolean;
}

const EMPTY_FORM: FormState = {
  titulo: '',
  fotoUrl: '',
  tagsMassa: '',
  tagsRecheio: '',
  tagsCobertura: '',
  tagsTopo: '',
  ocasiao: '',
  publicado: true,
};

function splitTags(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function AdminInspiracoes() {
  const { data: inspiracoes = [], isLoading } = useInspiracoesAdmin();
  const createMut = useCreateInspiracao();
  const updateMut = useUpdateInspiracao();
  const deleteMut = useDeleteInspiracao();

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const abrirNova = () => {
    setForm(EMPTY_FORM);
    setOpenForm(true);
  };

  const abrirEdicao = (insp: Inspiracao) => {
    setForm({
      id: insp.id,
      titulo: insp.titulo,
      fotoUrl: insp.fotoUrl,
      tagsMassa: insp.tagsMassa.join(', '),
      tagsRecheio: insp.tagsRecheio.join(', '),
      tagsCobertura: insp.tagsCobertura.join(', '),
      tagsTopo: insp.tagsTopo.join(', '),
      ocasiao: insp.ocasiao ?? '',
      publicado: insp.publicado,
    });
    setOpenForm(true);
  };

  const salvar = async () => {
    const payload = {
      titulo: form.titulo.trim(),
      fotoUrl: form.fotoUrl.trim(),
      tagsMassa: splitTags(form.tagsMassa),
      tagsRecheio: splitTags(form.tagsRecheio),
      tagsCobertura: splitTags(form.tagsCobertura),
      tagsTopo: splitTags(form.tagsTopo),
      ocasiao: form.ocasiao.trim() || null,
      publicado: form.publicado,
    };
    if (form.id) {
      await updateMut.mutateAsync({ id: form.id, data: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    setOpenForm(false);
  };

  const togglePub = (insp: Inspiracao) => {
    updateMut.mutate({ id: insp.id, data: { publicado: !insp.publicado } });
  };

  const remover = (id: string) => {
    if (confirm('Remover essa inspiração?')) {
      deleteMut.mutate(id);
    }
  };

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Star11 size={20} color={BRAND.rosa} />
              <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BRAND.marrom, opacity: 0.7 }}>
                admin · inspirações
              </span>
            </div>
            <h1 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, lineHeight: 1, color: BRAND.marrom, margin: 0 }}>
              galeria de inspiração
            </h1>
            <p style={{ fontFamily: 'Quicksand', fontSize: 14, color: BRAND.marrom, opacity: 0.65, marginTop: 8 }}>
              rascunhos curados automaticamente entram como publicado=false. revise antes de liberar.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirNova}
            style={{
              padding: '12px 18px',
              borderRadius: 999,
              background: BRAND.rosa,
              color: '#FFF',
              border: 'none',
              fontFamily: 'Quicksand',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Plus size={16} /> nova inspiração
          </button>
        </div>

        {isLoading ? (
          <p style={{ color: BRAND.marrom, opacity: 0.6 }}>carregando...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {inspiracoes.map((insp) => (
              <div
                key={insp.id}
                style={{
                  background: '#FFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(66, 39, 22, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: insp.publicado ? 1 : 0.55,
                }}
              >
                <div
                  style={{
                    aspectRatio: '4/3',
                    background: `url(${insp.fotoUrl}) center/cover, ${BRAND.begeEsc}`,
                    position: 'relative',
                  }}
                >
                  {!insp.publicado && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: BRAND.marrom,
                        color: BRAND.bege,
                        fontFamily: 'Space Grotesk',
                        fontSize: 10,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      rascunho
                    </span>
                  )}
                  {insp.pedidoOrigemId && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: BRAND.ciano,
                        color: '#FFF',
                        fontFamily: 'Space Grotesk',
                        fontSize: 10,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      de cliente
                    </span>
                  )}
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'Fraunces',
                      fontSize: 16,
                      fontWeight: 500,
                      color: BRAND.marrom,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {insp.titulo}
                  </h3>
                  {insp.ocasiao && (
                    <span style={{ fontFamily: 'Quicksand', fontSize: 12, color: BRAND.marrom, opacity: 0.6 }}>
                      {insp.ocasiao}
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => abrirEdicao(insp)}
                      style={btnSmall(BRAND.marrom)}
                    >
                      editar
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePub(insp)}
                      title={insp.publicado ? 'Despublicar' : 'Publicar'}
                      style={iconBtnStyle()}
                    >
                      {insp.publicado ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(insp.id)}
                      title="Remover"
                      style={iconBtnStyle('#c44')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {openForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenForm(false)}
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
                borderRadius: 20,
                padding: 32,
                maxWidth: 640,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                aria-label="Fechar"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: '#FFF',
                  cursor: 'pointer',
                }}
              >
                <XIcon size={18} />
              </button>
              <h2
                style={{
                  fontFamily: 'Fraunces',
                  fontSize: 28,
                  fontWeight: 500,
                  color: BRAND.marrom,
                  marginTop: 0,
                  marginBottom: 24,
                }}
              >
                {form.id ? 'editar inspiração' : 'nova inspiração'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="título">
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="URL da foto">
                  <input
                    value={form.fotoUrl}
                    onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </Field>
                <Field label="ocasião (livre — ex: aniversario, casamento, infantil)">
                  <input
                    value={form.ocasiao}
                    onChange={(e) => setForm({ ...form, ocasiao: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="tags de massa (separadas por vírgula)">
                  <input
                    value={form.tagsMassa}
                    onChange={(e) => setForm({ ...form, tagsMassa: e.target.value })}
                    placeholder="chocolate, red-velvet"
                    style={inputStyle}
                  />
                </Field>
                <Field label="tags de recheio">
                  <input
                    value={form.tagsRecheio}
                    onChange={(e) => setForm({ ...form, tagsRecheio: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="tags de cobertura">
                  <input
                    value={form.tagsCobertura}
                    onChange={(e) => setForm({ ...form, tagsCobertura: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="tags de topo">
                  <input
                    value={form.tagsTopo}
                    onChange={(e) => setForm({ ...form, tagsTopo: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Quicksand', color: BRAND.marrom }}>
                  <input
                    type="checkbox"
                    checked={form.publicado}
                    onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
                  />
                  publicado (visível no /inspiracoes)
                </label>
                <button
                  type="button"
                  onClick={salvar}
                  disabled={createMut.isPending || updateMut.isPending || !form.titulo || !form.fotoUrl}
                  style={{
                    marginTop: 12,
                    padding: '14px',
                    borderRadius: 999,
                    background: BRAND.rosa,
                    color: '#FFF',
                    border: 'none',
                    fontFamily: 'Quicksand',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    opacity: createMut.isPending || updateMut.isPending || !form.titulo || !form.fotoUrl ? 0.5 : 1,
                  }}
                >
                  salvar
                </button>
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
    <div>
      <label style={{ fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: BRAND.marrom, opacity: 0.7, display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  border: `2px solid ${BRAND.begeEsc}`,
  background: '#FFF',
  fontFamily: 'Quicksand',
  fontSize: 14,
  color: BRAND.marrom,
};

function btnSmall(bg: string): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 999,
    background: bg,
    color: '#FFF',
    border: 'none',
    fontFamily: 'Quicksand',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  };
}

function iconBtnStyle(color: string = BRAND.marrom): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: `1px solid ${BRAND.begeEsc}`,
    background: 'transparent',
    color,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
