import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

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
    <div className="min-h-screen bg-brand-bege font-body flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border-2 border-brand-rosa/20"
      >
        <h1 className="font-display text-3xl font-black text-brand-marrom mb-6 text-center">
          Entrar
        </h1>

        <label className="block mb-4">
          <span className="text-xs font-bold text-brand-marrom/60 uppercase">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-3 rounded-xl border border-brand-rosa/30 outline-none"
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs font-bold text-brand-marrom/60 uppercase">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full mt-1 p-3 rounded-xl border border-brand-rosa/30 outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-brand-rosa text-white font-bold disabled:opacity-40"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-brand-marrom/60 mt-4">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-brand-rosa hover:underline font-bold">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
