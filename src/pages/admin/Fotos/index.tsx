import { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Star } from 'lucide-react';
import { useProducts } from '../../../hooks/useProducts';
import {
  useFotosProduto,
  useAdicionarFoto,
  useAtualizarFoto,
  useRemoverFoto,
  type FotoProduto,
  type TipoFotoProduto,
} from '../../../hooks/useFotosProduto';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

const TIPOS: TipoFotoProduto[] = ['PRINCIPAL', 'CORTADO', 'DETALHE'];

export default function AdminFotos() {
  const { data: produtos = [] } = useProducts();
  const [produtoId, setProdutoId] = useState<string>('');
  const { data: fotos = [], isLoading } = useFotosProduto(produtoId || undefined);
  const adicionarMut = useAdicionarFoto();
  const atualizarMut = useAtualizarFoto();
  const removerMut = useRemoverFoto();

  const [novaUrl, setNovaUrl] = useState('');
  const [novoTipo, setNovoTipo] = useState<TipoFotoProduto>('DETALHE');
  const [novaOrdem, setNovaOrdem] = useState<number>(0);

  const produtoSelecionado = (produtos as any[]).find((p) => p.id === produtoId);

  const adicionar = async () => {
    if (!produtoId || !novaUrl.trim()) return;
    await adicionarMut.mutateAsync({
      produtoId,
      data: { url: novaUrl.trim(), tipo: novoTipo, ordem: novaOrdem },
    });
    setNovaUrl('');
    setNovaOrdem(0);
  };

  const remover = (foto: FotoProduto) => {
    if (!confirm('Remover essa foto?')) return;
    removerMut.mutate({ fotoId: foto.id, produtoId: foto.produtoId });
  };

  const trocarTipo = (foto: FotoProduto, tipo: TipoFotoProduto) => {
    atualizarMut.mutate({
      fotoId: foto.id,
      produtoId: foto.produtoId,
      data: { tipo },
    });
  };

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Star11 size={20} color={BRAND.rosa} />
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BRAND.marrom, opacity: 0.7 }}>
              admin · fotos de produto
            </span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, lineHeight: 1, color: BRAND.marrom, margin: 0 }}>
            galeria do produto
          </h1>
          <p style={{ fontFamily: 'Quicksand', fontSize: 14, color: BRAND.marrom, opacity: 0.65, marginTop: 8 }}>
            cada bolo deve ter pelo menos uma foto <strong>cortada</strong> mostrando o recheio.
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: BRAND.marrom,
              opacity: 0.7,
              display: 'block',
              marginBottom: 6,
            }}
          >
            produto
          </label>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 480,
              padding: '12px 14px',
              borderRadius: 12,
              border: `2px solid ${BRAND.begeEsc}`,
              background: '#FFF',
              fontFamily: 'Quicksand',
              fontSize: 14,
              color: BRAND.marrom,
            }}
          >
            <option value="">— selecione um produto —</option>
            {(produtos as any[]).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {produtoSelecionado && (
          <>
            <div
              style={{
                background: '#FFF',
                borderRadius: 16,
                padding: 20,
                marginBottom: 32,
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 80px auto',
                gap: 10,
                alignItems: 'end',
              }}
            >
              <Campo label="URL da foto">
                <input
                  value={novaUrl}
                  onChange={(e) => setNovaUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </Campo>
              <Campo label="tipo">
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value as TipoFotoProduto)}
                  style={inputStyle}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t.toLowerCase()}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="ordem">
                <input
                  type="number"
                  value={novaOrdem}
                  onChange={(e) => setNovaOrdem(parseInt(e.target.value, 10) || 0)}
                  style={inputStyle}
                />
              </Campo>
              <button
                type="button"
                onClick={adicionar}
                disabled={!novaUrl.trim() || adicionarMut.isPending}
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
                  opacity: !novaUrl.trim() || adicionarMut.isPending ? 0.5 : 1,
                }}
              >
                <Plus size={16} /> adicionar
              </button>
            </div>

            {isLoading ? (
              <p style={{ color: BRAND.marrom, opacity: 0.6 }}>carregando...</p>
            ) : fotos.length === 0 ? (
              <div
                style={{
                  padding: 60,
                  background: '#FFF',
                  borderRadius: 16,
                  textAlign: 'center',
                  color: BRAND.marrom,
                  opacity: 0.6,
                }}
              >
                <ImageIcon size={40} style={{ marginBottom: 12 }} />
                <p style={{ fontFamily: 'Quicksand', margin: 0 }}>nenhuma foto cadastrada ainda.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 16,
                }}
              >
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    style={{
                      background: '#FFF',
                      borderRadius: 16,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: '1/1',
                        background: `url(${foto.url}) center/cover, ${BRAND.begeEsc}`,
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background:
                            foto.tipo === 'PRINCIPAL'
                              ? BRAND.rosa
                              : foto.tipo === 'CORTADO'
                                ? BRAND.roxo
                                : BRAND.ciano,
                          color: '#FFF',
                          fontFamily: 'Space Grotesk',
                          fontSize: 10,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        {foto.tipo.toLowerCase()}
                      </span>
                    </div>
                    <div style={{ padding: 12, display: 'flex', gap: 8 }}>
                      <select
                        value={foto.tipo}
                        onChange={(e) => trocarTipo(foto, e.target.value as TipoFotoProduto)}
                        style={{ ...inputStyle, padding: '6px 10px', fontSize: 12 }}
                      >
                        {TIPOS.map((t) => (
                          <option key={t} value={t}>
                            {t.toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => remover(foto)}
                        title="Remover"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          border: `1px solid ${BRAND.begeEsc}`,
                          background: 'transparent',
                          color: '#c44',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: BRAND.marrom,
          opacity: 0.7,
          display: 'block',
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: `2px solid ${BRAND.begeEsc}`,
  background: '#FFF',
  fontFamily: 'Quicksand',
  fontSize: 13,
  color: BRAND.marrom,
};
