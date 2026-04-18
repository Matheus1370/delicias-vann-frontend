import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useCupons,
  useCriarCupom,
  useToggleCupom,
} from '../../../hooks/useCupons';
import { BRAND } from '../../../styles/brand';

export default function AdminCoupons() {
  const { data: cupons = [], isLoading } = useCupons();
  const { mutate: criar, isPending } = useCriarCupom();
  const { mutate: toggle } = useToggleCupom();

  const [form, setForm] = useState({
    codigo: '',
    tipo: 'PERCENTUAL' as 'PERCENTUAL' | 'FIXO',
    valor: '',
    minimoCompra: '',
    usoMaximo: '',
    validoAte: '',
    descricao: '',
    campanha: '',
  });

  const submit = () => {
    criar(
      {
        codigo: form.codigo,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        minimoCompra: form.minimoCompra ? parseFloat(form.minimoCompra) : 0,
        usoMaximo: form.usoMaximo ? parseInt(form.usoMaximo, 10) : undefined,
        validoAte: form.validoAte,
        descricao: form.descricao || undefined,
        campanha: form.campanha || undefined,
      },
      {
        onSuccess: () =>
          setForm({
            codigo: '',
            tipo: 'PERCENTUAL',
            valor: '',
            minimoCompra: '',
            usoMaximo: '',
            validoAte: '',
            descricao: '',
            campanha: '',
          }),
      },
    );
  };

  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-8">Cupons</h1>

        <div
          className="bg-white rounded-3xl p-6 mb-6"
          style={{ border: `2px solid ${BRAND.begeEsc}` }}
        >
          <div className="font-display text-sm font-bold text-brand-marrom/60 uppercase mb-4">
            Novo cupom
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Código (ex: NIVER15)"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              className="field"
            />
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))}
              className="field"
            >
              <option value="PERCENTUAL">% desconto</option>
              <option value="FIXO">R$ fixo</option>
            </select>
            <input
              placeholder="Valor"
              value={form.valor}
              onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              className="field"
            />
            <input
              placeholder="Mínimo R$"
              value={form.minimoCompra}
              onChange={(e) => setForm((f) => ({ ...f, minimoCompra: e.target.value }))}
              className="field"
            />
            <input
              placeholder="Uso máximo (opcional)"
              value={form.usoMaximo}
              onChange={(e) => setForm((f) => ({ ...f, usoMaximo: e.target.value }))}
              className="field"
            />
            <input
              type="date"
              value={form.validoAte}
              onChange={(e) => setForm((f) => ({ ...f, validoAte: e.target.value }))}
              className="field"
            />
            <input
              placeholder="Campanha"
              value={form.campanha}
              onChange={(e) => setForm((f) => ({ ...f, campanha: e.target.value }))}
              className="field"
            />
            <input
              placeholder="Descrição"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="field"
            />
          </div>
          <button
            disabled={isPending || !form.codigo || !form.valor || !form.validoAte}
            onClick={submit}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-white disabled:opacity-40"
            style={{ background: BRAND.rosa }}
          >
            Criar cupom
          </button>
        </div>

        {isLoading ? (
          <div className="text-center text-brand-marrom/50 py-12">Carregando...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {cupons.map((c: any, i: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-white rounded-2xl p-4 flex items-center gap-4"
                style={{
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  opacity: c.ativo ? 1 : 0.6,
                }}
              >
                <div className="flex-1">
                  <div className="font-display font-bold text-brand-marrom">
                    {c.codigo}
                    {c.campanha && (
                      <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-brand-bege text-brand-marrom/60">
                        {c.campanha}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-brand-marrom/60">
                    {c.tipo === 'PERCENTUAL'
                      ? `${c.valor}% off`
                      : `R$ ${Number(c.valor).toFixed(2)}`}{' '}
                    · mín R$ {Number(c.minimoCompra).toFixed(2)} · usos {c.usoAtual}
                    {c.usoMaximo ? `/${c.usoMaximo}` : ''}
                  </div>
                  {c.descricao && (
                    <div className="text-xs text-brand-marrom/50 italic mt-0.5">
                      {c.descricao}
                    </div>
                  )}
                </div>
                <div className="text-xs text-brand-marrom/50">
                  até {new Date(c.validoAte).toLocaleDateString('pt-BR')}
                </div>
                <button
                  onClick={() => toggle({ id: c.id, ativo: !c.ativo })}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ background: c.ativo ? BRAND.marrom : BRAND.rosa }}
                >
                  {c.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .field {
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
