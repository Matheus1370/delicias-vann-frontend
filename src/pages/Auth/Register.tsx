import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Cadastro concluído!');
      // Auto-login after successful registration
      const { data } = await api.post('/auth/login', {
        email: form.email,
        senha: form.senha,
      });
      setAuth(data.user, data.accessToken);
      const adminRoles = ['OPERADOR', 'GERENTE', 'ADMINISTRADOR'];
      navigate(adminRoles.includes(data.user.role) ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bege font-body flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border-2 border-brand-rosa/20"
      >
        <h1 className="font-display text-3xl font-black text-brand-marrom mb-6 text-center">
          Criar conta
        </h1>

        {(['nome', 'email', 'telefone', 'senha'] as const).map((k) => (
          <label key={k} className="block mb-4">
            <span className="text-xs font-bold text-brand-marrom/60 uppercase">{k}</span>
            <input
              type={k === 'senha' ? 'password' : k === 'email' ? 'email' : 'text'}
              value={form[k]}
              onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
              required={k !== 'telefone'}
              className="w-full mt-1 p-3 rounded-xl border border-brand-rosa/30 outline-none"
            />
          </label>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-brand-rosa text-white font-bold disabled:opacity-40"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-center text-sm text-brand-marrom/60 mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand-rosa hover:underline font-bold">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
