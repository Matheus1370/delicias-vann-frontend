import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X as XIcon, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';
import { usePedidoPublico, useEnviarAvaliacaoPublica } from '../../hooks/useAvaliacaoPublica';
import { arquivoParaDataURL } from '../../utils/imageResize';

const NPS_OPCOES = Array.from({ length: 11 }, (_, i) => i);

export default function AvaliarPage() {
  const { token } = useParams<{ token: string }>();
  const { data: pedido, isLoading, error } = usePedidoPublico(token);
  const { mutateAsync: enviar, isPending } = useEnviarAvaliacaoPublica();

  const [nps, setNps] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [fotoFesta, setFotoFesta] = useState<string | null>(null);
  const [permiteUsoFoto, setPermiteUsoFoto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleArquivo = async (file: File) => {
    setProcessando(true);
    try {
      const dataUrl = await arquivoParaDataURL(file);
      setFotoFesta(dataUrl);
    } catch (err: any) {
      toast.error(err?.message ?? 'Não foi possível ler a imagem');
    } finally {
      setProcessando(false);
    }
  };

  const submeter = async () => {
    if (nps === null || !token) return;
    try {
      await enviar({
        token,
        data: {
          notaNPS: nps,
          comentario: comentario.trim() || undefined,
          fotoFesta: fotoFesta ?? undefined,
          permiteUsoFoto,
        },
      });
      setEnviado(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao enviar avaliação';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: BRAND.bege, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="font-display" style={{ fontStyle: 'italic', fontSize: 20, color: `${BRAND.marrom}77` }}>
          carregando…
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div style={{ background: BRAND.bege, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <Star11 size={48} color={BRAND.begeEsc} fill={BRAND.begeEsc} stroke={0} />
          <h1 className="font-display" style={{ fontSize: 36, fontStyle: 'italic', color: BRAND.marrom, marginTop: 16, marginBottom: 12 }}>
            ops…
          </h1>
          <p style={{ fontSize: 15, color: `${BRAND.marrom}aa`, lineHeight: 1.5, marginBottom: 24 }}>
            esse link não vale mais ou já foi usado. dá uma olhada nos nossos doces? 🎂
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              borderRadius: 999,
              background: BRAND.rosa,
              color: BRAND.branco,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  if (pedido.jaAvaliado || enviado) {
    return (
      <div style={{ background: BRAND.bege, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: 460 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <Heart size={56} style={{ color: BRAND.rosa, fill: BRAND.rosa }} />
          </motion.div>
          <h1 className="font-display" style={{ fontSize: 36, fontStyle: 'italic', color: BRAND.marrom, marginTop: 16, marginBottom: 8 }}>
            obrigada de coração!
          </h1>
          <p style={{ fontSize: 15, color: `${BRAND.marrom}aa`, lineHeight: 1.55, marginBottom: 28 }}>
            sua avaliação chegou — a gente lê todas e leva o feedback pra cozinha. 💖
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              borderRadius: 999,
              background: BRAND.rosa,
              color: BRAND.branco,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            ver o cardápio
          </Link>
        </motion.div>
      </div>
    );
  }

  const corBotao = (n: number) => {
    if (nps === n) return BRAND.rosa;
    if (n >= 9) return `${BRAND.rosa}22`;
    if (n >= 7) return `${BRAND.ciano}22`;
    return BRAND.bege;
  };

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono" style={{ fontSize: 11, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            como foi?
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontStyle: 'italic',
              fontWeight: 700,
              color: BRAND.marrom,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              margin: '6px 0 8px',
            }}
          >
            {pedido.clienteNome ? `oi, ${pedido.clienteNome.split(' ')[0]}!` : 'oi!'} 💖
          </h1>
          <p style={{ fontSize: 16, color: `${BRAND.marrom}aa`, lineHeight: 1.5 }}>
            espero que a festa tenha sido linda. conta pra mim — de 0 a 10, quanto você indicaria a Delícias da Vann pra quem você ama?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            marginTop: 24,
            padding: 24,
            background: BRAND.branco,
            borderRadius: 24,
            border: `1px solid ${BRAND.begeEsc}`,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}88`, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            nota de 0 a 10
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 6 }}>
            {NPS_OPCOES.map((n) => (
              <button
                key={n}
                onClick={() => setNps(n)}
                style={{
                  padding: '10px 0',
                  borderRadius: 12,
                  border: `2px solid ${nps === n ? BRAND.rosa : 'transparent'}`,
                  background: corBotao(n),
                  color: nps === n ? BRAND.branco : BRAND.marrom,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: `${BRAND.marrom}66` }}>
            <span>não indicaria</span>
            <span>indicaria com certeza</span>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}88`, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              conta um pouco mais (opcional)
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="o que funcionou? o que poderia melhorar?"
              maxLength={400}
              rows={4}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 16,
                border: `1.5px solid ${BRAND.begeEsc}`,
                background: BRAND.bege,
                fontFamily: 'inherit',
                fontSize: 14,
                color: BRAND.marrom,
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}55`, marginTop: 4, textAlign: 'right' }}>
              {comentario.length}/400
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}88`, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              uma foto da festa? 📸 (opcional)
            </div>
            <AnimatePresence mode="wait">
              {fotoFesta ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'relative' }}
                >
                  <img
                    src={fotoFesta}
                    alt="festa"
                    style={{ width: '100%', borderRadius: 16, display: 'block', border: `1px solid ${BRAND.begeEsc}` }}
                  />
                  <button
                    onClick={() => setFotoFesta(null)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: `${BRAND.marrom}cc`,
                      color: BRAND.bege,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <XIcon size={14} />
                  </button>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: `${BRAND.rosa}10`,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={permiteUsoFoto}
                      onChange={(e) => setPermiteUsoFoto(e.target.checked)}
                      style={{ marginTop: 2, accentColor: BRAND.rosa }}
                    />
                    <span style={{ fontSize: 12, color: BRAND.marrom, lineHeight: 1.5 }}>
                      autorizo a Delícias da Vann a usar essa foto no Instagram/site como prova de quem comeu e gostou. (sem autorização a foto fica só com a confeitaria, prometido).
                    </span>
                  </label>
                </motion.div>
              ) : (
                <motion.label
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '28px 16px',
                    borderRadius: 16,
                    border: `2px dashed ${BRAND.rosa}55`,
                    background: `${BRAND.rosa}06`,
                    cursor: processando ? 'wait' : 'pointer',
                  }}
                >
                  <ImagePlus size={28} style={{ color: BRAND.rosa }} />
                  <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: BRAND.marrom }}>
                    {processando ? 'processando…' : 'escolher foto'}
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: `${BRAND.marrom}66`, letterSpacing: '0.05em' }}>
                    bolo cortado, festa, cliente feliz…
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={processando}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleArquivo(f);
                      e.target.value = '';
                    }}
                  />
                </motion.label>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: nps === null || isPending ? 1 : 1.02 }}
          whileTap={{ scale: nps === null || isPending ? 1 : 0.98 }}
          onClick={submeter}
          disabled={nps === null || isPending}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '18px 32px',
            borderRadius: 999,
            background: nps === null ? BRAND.begeEsc : BRAND.rosa,
            color: nps === null ? `${BRAND.marrom}66` : BRAND.branco,
            border: 'none',
            fontWeight: 700,
            fontSize: 16,
            cursor: nps === null || isPending ? 'not-allowed' : 'pointer',
            boxShadow: nps !== null ? `0 8px 24px ${BRAND.rosa}44` : 'none',
            transition: 'all 0.2s',
          }}
        >
          {isPending ? 'enviando…' : 'enviar avaliação'}
        </motion.button>

        <p
          className="font-mono"
          style={{
            marginTop: 16,
            fontSize: 10,
            color: `${BRAND.marrom}55`,
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          a confeiteira lê todas, ✿ não tem robô do outro lado.
        </p>
      </div>
    </div>
  );
}
