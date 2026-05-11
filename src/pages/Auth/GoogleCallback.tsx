import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { BRAND } from '../../styles/brand';
import { Star11 } from '../../components/BrandElements';
import { motion } from 'framer-motion';

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth(user, token);

        const ADMIN_ROLES = ['OPERADOR', 'GERENTE', 'ADMINISTRADOR'];
        const dest = ADMIN_ROLES.includes(user.role) ? '/admin' : '/';
        navigate(dest, { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, setAuth, navigate]);

  return (
    <div
      style={{
        background: BRAND.bege,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Star11 size={48} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
      </motion.div>
      <p className="font-display" style={{ fontSize: 20, color: BRAND.marrom, fontStyle: 'italic' }}>
        autenticando...
      </p>
    </div>
  );
}
