import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useOverview,
  useVendasDiarias,
  useMargemProduto,
  useCohort,
  useOcupacaoSlots,
  useGastoInsumo,
} from '../../../hooks/useReports';
import { BRAND } from '../../../styles/brand';

const currency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando',
  PAGO: 'Pago',
  EM_PRODUCAO: 'Em produção',
  PRONTO: 'Pronto',
  EM_ENTREGA: 'Em entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  ATRASADO: 'Atrasado',
  FALHA_ENTREGA: 'Falha',
};

export default function AdminReports() {
  const [days, setDays] = useState(30);
  const { data: overview, isLoading } = useOverview(days);
  const { data: vendasDiarias = [] } = useVendasDiarias(14);
  const { data: margens = [] } = useMargemProduto(days);
  const { data: cohort } = useCohort(90);
  const { data: ocupacao = [] } = useOcupacaoSlots(30);
  const { data: gastos = [] } = useGastoInsumo(days);

  const maxFat = Math.max(...vendasDiarias.map((d: any) => d.faturamento), 1);

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-black text-brand-marrom">
              Relatórios
            </h1>
            <p className="text-brand-marrom/60 mt-1">últimos {days} dias</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-4 py-2 rounded-full text-xs font-bold"
                style={{
                  background: days === d ? BRAND.rosa : 'white',
                  color: days === d ? 'white' : BRAND.marrom,
                  border: `2px solid ${days === d ? BRAND.rosa : BRAND.begeEsc}`,
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {isLoading || !overview ? (
          <div className="text-center py-20 text-brand-marrom/50">Carregando...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <Kpi label="Faturamento" value={currency(overview.faturamento)} delay={0} />
              <Kpi label="Ticket médio" value={currency(overview.ticketMedio)} delay={0.05} />
              <Kpi
                label="Margem bruta"
                value={`${overview.margemBrutaPct}%`}
                delay={0.1}
                highlight={overview.margemBrutaPct < 30}
              />
              <Kpi label="Pedidos" value={String(overview.totalPedidos)} delay={0.15} />
              <Kpi
                label="Retenção 90d"
                value={cohort ? `${cohort.taxaRetencaoPct}%` : '—'}
                delay={0.2}
              />
            </div>

            {(overview.insumosAbaixoDoMinimo > 0 || overview.produtosRevisaoMargem > 0) && (
              <div
                className="rounded-3xl p-5 mb-6"
                style={{ background: '#FFE8E8', border: '2px solid #FFB4B4' }}
              >
                <div className="font-display font-bold text-red-700 mb-2">⚠ Atenção</div>
                <div className="text-sm text-red-800">
                  {overview.insumosAbaixoDoMinimo > 0 && (
                    <div>
                      {overview.insumosAbaixoDoMinimo} insumo(s) abaixo do ponto de reposição
                    </div>
                  )}
                  {overview.produtosRevisaoMargem > 0 && (
                    <div>
                      {overview.produtosRevisaoMargem} produto(s) em revisão de margem
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Faturamento diário (14d)">
                <div className="flex items-end gap-1 h-48">
                  {vendasDiarias.map((d: any, i: number) => {
                    const h = maxFat ? (d.faturamento / maxFat) * 100 : 0;
                    return (
                      <motion.div
                        key={d.data}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                        className="flex-1 rounded-t-md"
                        style={{
                          background: BRAND.rosa,
                          minHeight: d.faturamento > 0 ? 4 : 1,
                          opacity: d.faturamento > 0 ? 1 : 0.15,
                        }}
                        title={`${new Date(d.data).toLocaleDateString('pt-BR')}: ${currency(d.faturamento)} · ${d.pedidos} pedidos`}
                      />
                    );
                  })}
                </div>
              </Card>

              <Card title="Pedidos por status">
                <div className="flex flex-col gap-2">
                  {overview.porStatus.map((s: any) => (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-marrom">
                        {STATUS_LABEL[s.status] ?? s.status}
                      </span>
                      <span className="font-bold text-brand-marrom">{s.total}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Ocupação média por dia da semana (30d)">
                <div className="flex items-end gap-2 h-32">
                  {ocupacao.map((o: any) => (
                    <div key={o.diaSemana} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${o.ocupacaoPct}%`,
                          background:
                            o.ocupacaoPct > 85
                              ? '#CC0000'
                              : o.ocupacaoPct > 60
                                ? BRAND.rosa
                                : BRAND.roxo,
                          minHeight: o.ocupacaoPct > 0 ? 4 : 1,
                        }}
                      />
                      <div className="text-[10px] font-bold text-brand-marrom/60">
                        {o.diaSemana}
                      </div>
                      <div className="text-[10px] font-bold text-brand-marrom">
                        {o.ocupacaoPct}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Cancelamentos por motivo">
                {overview.cancelamentosPorMotivo.length === 0 ? (
                  <div className="text-sm text-brand-marrom/50">Nenhum cancelamento.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {overview.cancelamentosPorMotivo.map((c: any) => (
                      <div
                        key={c.motivo}
                        className="flex justify-between items-start pb-2 border-b border-brand-bege last:border-0"
                      >
                        <span className="text-xs text-brand-marrom/70 flex-1 pr-4">
                          {c.motivo}
                        </span>
                        <span className="font-bold text-brand-marrom">{c.total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Margem por produto" fullWidth>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase text-brand-marrom/60">
                        <th className="py-2">Produto</th>
                        <th className="py-2 text-right">Qtd</th>
                        <th className="py-2 text-right">Preço médio</th>
                        <th className="py-2 text-right">Custo</th>
                        <th className="py-2 text-right">Margem</th>
                        <th className="py-2 text-right">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {margens.map((m: any) => (
                        <tr
                          key={m.produtoId}
                          className="border-t border-brand-bege"
                        >
                          <td className="py-2 font-bold text-brand-marrom">{m.nome}</td>
                          <td className="py-2 text-right">{m.quantidadeVendida}</td>
                          <td className="py-2 text-right">{currency(m.precoMedio)}</td>
                          <td className="py-2 text-right text-brand-marrom/60">
                            {currency(m.custoMedio)}
                          </td>
                          <td
                            className="py-2 text-right font-bold"
                            style={{
                              color:
                                m.margemPct < 30
                                  ? '#CC0000'
                                  : m.margemPct > 50
                                    ? '#2D7A2D'
                                    : BRAND.marrom,
                            }}
                          >
                            {m.margemPct.toFixed(1)}%
                          </td>
                          <td className="py-2 text-right font-bold text-brand-marrom">
                            {currency(m.receitaTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Gasto por insumo · quebra" fullWidth>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase text-brand-marrom/60">
                        <th className="py-2">Insumo</th>
                        <th className="py-2 text-right">Consumo</th>
                        <th className="py-2 text-right">Quebra</th>
                        <th className="py-2 text-right">% Quebra</th>
                        <th className="py-2 text-right">Gasto consumo</th>
                        <th className="py-2 text-right">Gasto quebra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map((g: any) => (
                        <tr key={g.insumoId} className="border-t border-brand-bege">
                          <td className="py-2 font-bold text-brand-marrom">{g.nome}</td>
                          <td className="py-2 text-right">
                            {g.consumido.toFixed(2)} {g.unidade}
                          </td>
                          <td className="py-2 text-right text-red-600">
                            {g.quebra.toFixed(2)} {g.unidade}
                          </td>
                          <td
                            className="py-2 text-right font-bold"
                            style={{
                              color: g.percentualQuebra > 10 ? '#CC0000' : BRAND.marrom,
                            }}
                          >
                            {g.percentualQuebra}%
                          </td>
                          <td className="py-2 text-right">{currency(g.gastoConsumo)}</td>
                          <td className="py-2 text-right text-red-600">
                            {currency(g.gastoQuebra)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delay,
  highlight,
}: {
  label: string;
  value: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-3xl p-5"
      style={{
        border: `2px solid ${highlight ? '#FFB4B4' : BRAND.begeEsc}`,
        boxShadow: '0 4px 20px rgba(66,39,22,.05)',
      }}
    >
      <div className="text-[10px] font-bold text-brand-marrom/50 uppercase">{label}</div>
      <div
        className="font-display text-2xl font-black mt-1"
        style={{ color: highlight ? '#CC0000' : BRAND.marrom }}
      >
        {value}
      </div>
    </motion.div>
  );
}

function Card({
  title,
  children,
  fullWidth,
}: {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}
      style={{ border: `2px solid ${BRAND.begeEsc}` }}
    >
      <div className="font-display text-sm font-bold text-brand-marrom/60 uppercase mb-4">
        {title}
      </div>
      {children}
    </div>
  );
}
