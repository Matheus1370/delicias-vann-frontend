import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      setAuth(data.user, data.accessToken);
      toast.success('Bem-vinda de volta!');
      const adminRoles = ['OPERADOR', 'GERENTE', 'ADMINISTRADOR'];
      navigate(adminRoles.includes(data.user.role) ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BRAND.bege,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative star */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', top: 80, right: '15%', opacity: 0.15 }}
      >
        <Star11 size={120} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
      </motion.div>
      <motion.div
        initial={{ scale: 0, rotate: 90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', bottom: 100, left: '10%', opacity: 0.1 }}
      >
        <Star11 size={80} color={BRAND.roxo} fill={BRAND.roxo} stroke={0} />
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: BRAND.branco,
          borderRadius: 24,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 440,
          border: `1px solid ${BRAND.begeEsc}`,
          boxShadow: '0 8px 40px rgba(66,39,22,.08)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Section label */}
        <div
          className="font-mono"
          style={{
            fontSize: 12,
            color: BRAND.rosa,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          &#10022; entrar
        </div>

        {/* Heading */}
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: BRAND.marrom,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textAlign: 'center',
            margin: '0 0 8px',
          }}
        >
          bem-vinda de{' '}
          <span style={{ color: BRAND.rosa }}>volta</span>.
        </h1>

        <p
          style={{
            fontSize: 14,
            color: BRAND.marrom,
            opacity: 0.5,
            textAlign: 'center',
            marginBottom: 36,
          }}
        >
          entre para acompanhar seus pedidos
        </p>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
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
            e-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            style={{
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
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = BRAND.rosa)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BRAND.begeEsc)}
          />
        </div>

        {/* Senha */}
        <div style={{ marginBottom: 32 }}>
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
            senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            placeholder="sua senha"
            style={{
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
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = BRAND.rosa)}
            onBlur={(e) => (e.currentTarget.style.borderColor = BRAND.begeEsc)}
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '16px 32px',
            borderRadius: 999,
            background: BRAND.rosa,
            color: BRAND.branco,
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'entrando...' : 'entrar'}
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: BRAND.begeEsc }} />
          <span className="font-mono" style={{ fontSize: 10, color: BRAND.marrom + '66', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ou
          </span>
          <div style={{ flex: 1, height: 1, background: BRAND.begeEsc }} />
        </div>

        {/* Google Login */}
        <motion.a
          href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/auth/google`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '14px 32px',
            borderRadius: 999,
            background: BRAND.branco,
            color: BRAND.marrom,
            fontWeight: 600,
            fontSize: 14,
            border: `1.5px solid ${BRAND.begeEsc}`,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = BRAND.marrom + '44';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(66,39,22,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = BRAND.begeEsc;
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          entrar com Google
        </motion.a>

        {/* Link to register */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: BRAND.marrom,
            opacity: 0.6,
            marginTop: 20,
          }}
        >
          ainda nao tem conta?{' '}
          <Link
            to="/cadastro"
            style={{
              color: BRAND.rosa,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            criar conta
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
