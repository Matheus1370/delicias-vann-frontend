import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe, useUpdateMe, useAnonimizar } from '../../hooks/useUser';
import { useAuthStore } from '../../store/auth.store';
import { BRAND } from '../../styles/brand';

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
      <div className="min-h-screen bg-brand-bege font-body flex items-center justify-center">
        <div className="text-brand-marrom/60">Carregando...</div>
      </div>
    );
  }

  const handleSave = () => update(form);

  const handleAnonimizar = () => {
    if (
      confirm(
        'Isso irá apagar todos os seus dados pessoais. Seus pedidos serão mantidos de forma anonimizada. Confirma?',
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
    <div className="min-h-screen bg-brand-bege font-body px-6 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-8">
          Meu perfil
        </h1>

        <Card title="Dados pessoais">
          <Field label="Nome">
            <input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="Telefone">
            <input
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="CPF (para nota fiscal)">
            <input
              value={form.cpf}
              onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="Data de nascimento (vem cupom de aniversário!)">
            <input
              type="date"
              value={form.dataNascimento}
              onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
              className="input"
            />
          </Field>
        </Card>

        <Card title="Comunicação">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingOptIn: e.target.checked }))
              }
              className="mt-1"
            />
            <div>
              <div className="font-bold text-brand-marrom text-sm">
                Aceito receber novidades e cupons
              </div>
              <div className="text-xs text-brand-marrom/60 mt-0.5">
                Por WhatsApp. Pode desabilitar a qualquer momento.
              </div>
            </div>
          </label>
        </Card>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-4 rounded-2xl font-bold text-white mb-8 disabled:opacity-40"
          style={{ background: BRAND.rosa, boxShadow: `0 8px 24px ${BRAND.rosa}44` }}
        >
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </button>

        <Card title="Privacidade (LGPD)">
          <p className="text-xs text-brand-marrom/70 mb-3">
            Você tem direito a acessar, corrigir e excluir seus dados a qualquer momento.
            Ao anonimizar, seus dados pessoais são apagados; seus pedidos são mantidos
            sem identificação.
          </p>
          <button
            onClick={handleAnonimizar}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{
              background: '#FFE8E8',
              color: '#CC0000',
              border: '1.5px solid #FFB4B4',
            }}
          >
            Excluir meus dados
          </button>
        </Card>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: ${BRAND.bege};
          border: 1.5px solid ${BRAND.begeEsc};
          font-weight: 500;
          font-size: 0.875rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-3xl p-5 mb-4"
      style={{ border: `2px solid ${BRAND.begeEsc}`, boxShadow: '0 2px 12px rgba(66,39,22,.04)' }}
    >
      <div className="font-display text-sm font-bold text-brand-marrom/60 uppercase tracking-wider mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-bold text-brand-marrom/50 uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
