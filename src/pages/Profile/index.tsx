import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMe, useUpdateMe, useAnonimizar } from '../../hooks/useUser';
import { useAuthStore } from '../../store/auth.store';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 18px',
  borderRadius: 999,
  border: `1.5px solid ${BRAND.begeEsc}`,
  background: BRAND.branco,
  fontSize: 14,
  fontWeight: 500,
  color: BRAND.marrom,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function Profile() {
  const { data: me, isLoading } = useMe();
  const { mutate: update, isPending } = useUpdateMe();
  const { mutate: anonimizar } = useAnonimizar();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    marketingOptIn: false,
  });

  useEffect(() => {
    if (me) {
      setForm({
        nome: me.nome ?? '',
        telefone: me.telefone ?? '',
        cpf: me.cpf ?? '',
        dataNascimento: me.dataNascimento
          ? new Date(me.dataNascimento).toISOString().split('T')[0]
          : '',
        marketingOptIn: me.marketingOptIn ?? false,
      });
    }
  }, [me]);

  if (isLoading || !me) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BRAND.bege,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="font-display"
          style={{ color: BRAND.marrom, opacity: 0.4, fontStyle: 'italic', fontSize: 20 }}
        >
          carregando...
        </div>
      </div>
    );
  }

  const handleSave = () => update(form);

  const handleAnonimizar = () => {
    if (
      confirm(
        'Isso ira apagar todos os seus dados pessoais. Seus pedidos serao mantidos de forma anonimizada. Confirma?',
      )
    ) {
      anonimizar(undefined, {
        onSuccess: () => {
          logout();
          navigate('/');
        },
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BRAND.bege, padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-mono"
          style={{
            fontSize: 12,
            color: BRAND.rosa,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          &#10022; meu perfil
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: BRAND.marrom,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: '0 0 40px',
          }}
        >
          ola, <span style={{ color: BRAND.rosa }}>{me.nome?.split(' ')[0] || 'voce'}</span>.
        </motion.h1>

        {/* Personal data card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            background: BRAND.branco,
            borderRadius: 24,
            padding: 28,
            border: `1px solid ${BRAND.begeEsc}`,
            marginBottom: 16,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: BRAND.rosa,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            dados pessoais
          </div>

          {[
            { key: 'nome', label: 'nome', type: 'text' },
            { key: 'telefone', label: 'telefone', type: 'text' },
            { key: 'cpf', label: 'cpf (para nota fiscal)', type: 'text' },
            { key: 'dataNascimento', label: 'data de nascimento (vem cupom!)', type: 'date' },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label
                className="font-mono"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: BRAND.marrom,
                  opacity: 0.6,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                {f.label}
              </label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = BRAND.rosa)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BRAND.begeEsc)}
              />
            </div>
          ))}
        </motion.div>

        {/* Communication card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: BRAND.branco,
            borderRadius: 24,
            padding: 28,
            border: `1px solid ${BRAND.begeEsc}`,
            marginBottom: 16,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: BRAND.rosa,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            comunicacao
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingOptIn: e.target.checked }))
              }
              style={{ marginTop: 4, accentColor: BRAND.rosa }}
            />
            <div>
              <div style={{ fontWeight: 700, color: BRAND.marrom, fontSize: 14 }}>
                Aceito receber novidades e cupons
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: BRAND.marrom,
                  opacity: 0.5,
                  marginTop: 4,
                  letterSpacing: '0.04em',
                }}
              >
                Por WhatsApp. Pode desabilitar a qualquer momento.
              </div>
            </div>
          </label>
        </motion.div>

        {/* Save button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isPending}
          style={{
            width: '100%',
            padding: '16px 32px',
            borderRadius: 999,
            background: BRAND.rosa,
            color: BRAND.branco,
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.4 : 1,
            marginBottom: 24,
            boxShadow: `0 8px 24px ${BRAND.rosa}44`,
            transition: 'opacity 0.2s',
          }}
        >
          {isPending ? 'salvando...' : 'salvar alteracoes'}
        </motion.button>

        {/* LGPD card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            background: BRAND.marrom,
            borderRadius: 24,
            padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Star11 size={20} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                color: BRAND.rosa,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              privacidade (lgpd)
            </div>
          </div>

          <p
            style={{
              fontSize: 13,
              color: BRAND.bege,
              opacity: 0.7,
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            Voce tem direito a acessar, corrigir e excluir seus dados a qualquer momento.
            Ao anonimizar, seus dados pessoais sao apagados; seus pedidos sao mantidos
            sem identificacao.
          </p>

          <button
            onClick={handleAnonimizar}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              color: '#FF8A8A',
              fontWeight: 700,
              fontSize: 14,
              border: '1.5px solid rgba(255,138,138,0.3)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            excluir meus dados
          </button>
        </motion.div>
      </div>
    </div>
  );
}
