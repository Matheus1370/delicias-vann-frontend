import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useOverview,
  useVendasDiarias,
  useMargemProduto,
  useCohort,
  useOcupacaoSlots,
  useGastoInsumo,
  useFunilConversao,
  useKpisEstrategicos,
} from '../../../hooks/useReports';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

const currency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando',
  PAGO: 'Pago',
  EM_PRODUCAO: 'Em producao',
  PRONTO: 'Pronto',
  EM_ENTREGA: 'Em entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  ATRASADO: 'Atrasado',
  FALHA_ENTREGA: 'Falha',
};

const STATUS_DOT: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: BRAND.begeEsc,
  PAGO: BRAND.ciano,
  EM_PRODUCAO: BRAND.roxo,
  PRONTO: BRAND.rosa,
  EM_ENTREGA: BRAND.ciano,
  ENTREGUE: BRAND.marrom,
  CANCELADO: '#DC2626',
  ATRASADO: '#F59E0B',
  FALHA_ENTREGA: '#DC2626',
};

export default function AdminReports() {
  const [days, setDays] = useState(30);
  const { data: overview, isLoading } = useOverview(days);
  const { data: vendasDiarias = [] } = useVendasDiarias(14);
  const { data: margens = [] } = useMargemProduto(days);
  const { data: cohort } = useCohort(90);
  const { data: ocupacao = [] } = useOcupacaoSlots(30);
  const { data: gastos = [] } = useGastoInsumo(days);
  const { data: funil } = useFunilConversao(14);
  const { data: kpis } = useKpisEstrategicos(days);

  const maxFat = Math.max(...vendasDiarias.map((d: any) => d.faturamento), 1);

  const funilEtapas = (funil?.etapas ?? []).filter((e) => e.sessoes > 0 || e.previousSessoes > 0);
  const maxSessoes = funilEtapas[0]?.sessoes ?? 1;

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> indicadores e analises
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 0.95,
                  fontStyle: 'italic',
                  color: BRAND.marrom,
                  marginTop: 8,
                }}
              >
                relatorios<span style={{ color: BRAND.rosa }}>.</span>
              </h1>
              <p className="font-mono" style={{ color: `${BRAND.marrom}88`, fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ultimos {days} dias
              </p>
            </div>

            {/* Period tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `1.5px solid ${days === d ? BRAND.rosa : BRAND.begeEsc}`,
                    background: days === d ? BRAND.rosa : BRAND.branco,
                    color: days === d ? BRAND.branco : BRAND.marrom,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading || !overview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77` }}
          >
            Carregando...
          </motion.div>
        ) : (
          <>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
              <Kpi label="Faturamento" value={currency(overview.faturamento)} delay={0} />
              <Kpi label="Ticket medio" value={currency(overview.ticketMedio)} delay={0.05} />
              <Kpi label="Margem bruta" value={`${overview.margemBrutaPct}%`} delay={0.1} highlight={overview.margemBrutaPct < 30} />
              <Kpi label="Pedidos" value={String(overview.totalPedidos)} delay={0.15} />
              <Kpi label="Retencao 90d" value={cohort ? `${cohort.taxaRetencaoPct}%` : '\u2014'} delay={0.2} />
            </div>

            {/* Alerts */}
            {(overview.insumosAbaixoDoMinimo > 0 || overview.produtosRevisaoMargem > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{
                  borderRadius: 24,
                  padding: 20,
                  marginBottom: 24,
                  background: '#FEE2E2',
                  border: '1.5px solid #FECACA',
                }}
              >
                <div className="font-display" style={{ fontWeight: 700, color: '#DC2626', marginBottom: 6, fontSize: 15 }}>
                  Atencao
                </div>
                <div style={{ fontSize: 13, color: '#991B1B' }}>
                  {overview.insumosAbaixoDoMinimo > 0 && (
                    <div>{overview.insumosAbaixoDoMinimo} insumo(s) abaixo do ponto de reposicao</div>
                  )}
                  {overview.produtosRevisaoMargem > 0 && (
                    <div>{overview.produtosRevisaoMargem} produto(s) em revisao de margem</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* KPIs estrategicos (Fase 4) */}
            {kpis && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <KpiStrat label="adicional anexado" value={`${kpis.taxaAnexacaoAdicional}%`} hint="% pedidos de bolo c/ adicional" alvo={kpis.taxaAnexacaoAdicional >= 30 ? 'ok' : 'baixo'} />
                <KpiStrat label="recompra 12m" value={`${kpis.recompra12mPct}%`} hint="clientes c/ ≥ 2 pedidos" alvo={kpis.recompra12mPct >= 25 ? 'ok' : 'baixo'} />
                <KpiStrat label="customização" value={`${kpis.customizacaoExtrema}%`} hint="% pedidos personalizados" />
                <KpiStrat label="erro operacional" value={`${kpis.erroOperacionalPct}%`} hint="falha entrega + NPS ≤ 6" alvo={kpis.erroOperacionalPct > 3 ? 'alto' : 'ok'} />
                <KpiStrat label="NPS pós-festa" value={kpis.npsPosFesta.amostra > 0 ? kpis.npsPosFesta.media.toFixed(1) : '—'} hint={`amostra ${kpis.npsPosFesta.amostra}`} alvo={kpis.npsPosFesta.media >= 9 ? 'ok' : kpis.npsPosFesta.media >= 7 ? '' : 'baixo'} />
                <KpiStrat label="ocupação semanal" value={`${kpis.ocupacaoSemanalPct}%`} hint="capacidade desta semana" alvo={kpis.ocupacaoSemanalPct > 90 ? 'alto' : 'ok'} />
              </div>
            )}

            {/* Charts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Daily revenue */}
              <Card title="Faturamento diario (14d)" delay={0.3}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 192 }}>
                  {vendasDiarias.map((d: any, i: number) => {
                    const h = maxFat ? (d.faturamento / maxFat) * 100 : 0;
                    return (
                      <motion.div
                        key={d.data}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.35 + i * 0.03, duration: 0.4 }}
                        style={{
                          flex: 1,
                          borderRadius: '6px 6px 0 0',
                          background: BRAND.rosa,
                          minHeight: d.faturamento > 0 ? 4 : 1,
                          opacity: d.faturamento > 0 ? 1 : 0.15,
                          cursor: 'default',
                        }}
                        title={`${new Date(d.data).toLocaleDateString('pt-BR')}: ${currency(d.faturamento)} - ${d.pedidos} pedidos`}
                      />
                    );
                  })}
                </div>
              </Card>

              {/* Status breakdown */}
              <Card title="Pedidos por status" delay={0.35}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {overview.porStatus.map((s: any, i: number) => (
                    <div
                      key={s.status}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: i < overview.porStatus.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[s.status] || BRAND.marrom }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.marrom }}>
                          {STATUS_LABEL[s.status] ?? s.status}
                        </span>
                      </div>
                      <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: BRAND.marrom }}>
                        {s.total}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Slot occupancy */}
              <Card title="Ocupacao media por dia da semana (30d)" delay={0.4}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 128 }}>
                  {ocupacao.map((o: any) => (
                    <div key={o.diaSemana} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div
                        style={{
                          width: '100%',
                          borderRadius: '6px 6px 0 0',
                          height: `${o.ocupacaoPct}%`,
                          background:
                            o.ocupacaoPct > 85 ? '#DC2626' : o.ocupacaoPct > 60 ? BRAND.rosa : BRAND.roxo,
                          minHeight: o.ocupacaoPct > 0 ? 4 : 1,
                          transition: 'height 0.5s',
                        }}
                      />
                      <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, color: `${BRAND.marrom}77`, textTransform: 'uppercase' }}>
                        {o.diaSemana}
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: BRAND.marrom }}>
                        {o.ocupacaoPct}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Cancellations */}
              <Card title="Cancelamentos por motivo" delay={0.45}>
                {overview.cancelamentosPorMotivo.length === 0 ? (
                  <div style={{ fontSize: 13, color: `${BRAND.marrom}66`, padding: '16px 0' }}>
                    Nenhum cancelamento.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {overview.cancelamentosPorMotivo.map((c: any, i: number) => (
                      <div
                        key={c.motivo}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          padding: '10px 0',
                          borderBottom: i < overview.cancelamentosPorMotivo.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
                        }}
                      >
                        <span style={{ fontSize: 12, color: `${BRAND.marrom}aa`, flex: 1, paddingRight: 16 }}>
                          {c.motivo}
                        </span>
                        <span className="font-display" style={{ fontWeight: 700, color: BRAND.marrom }}>
                          {c.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Margin table - full width */}
              <Card title="Margem por produto" delay={0.5} fullWidth>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Produto', 'Qtd', 'Preco medio', 'Custo', 'Margem', 'Receita'].map((h, hi) => (
                          <th
                            key={h}
                            className="font-mono"
                            style={{
                              padding: '8px 0',
                              textAlign: hi === 0 ? 'left' : 'right',
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: `${BRAND.marrom}88`,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {margens.map((m: any) => (
                        <tr key={m.produtoId} style={{ borderTop: `1px dashed ${BRAND.begeEsc}` }}>
                          <td style={{ padding: '10px 0', fontWeight: 700, color: BRAND.marrom }}>{m.nome}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: BRAND.marrom }}>{m.quantidadeVendida}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: BRAND.marrom }}>{currency(m.precoMedio)}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: `${BRAND.marrom}88` }}>{currency(m.custoMedio)}</td>
                          <td
                            style={{
                              padding: '10px 0',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: m.margemPct < 30 ? '#DC2626' : m.margemPct > 50 ? '#16A34A' : BRAND.marrom,
                            }}
                          >
                            {m.margemPct.toFixed(1)}%
                          </td>
                          <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: BRAND.marrom }}>
                            {currency(m.receitaTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Funil do configurador */}
              {funilEtapas.length > 0 && (
                <Card title="Funil do configurador (14d)" delay={0.5} fullWidth>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {funilEtapas.map((e) => {
                      const widthPct = maxSessoes > 0 ? (e.sessoes / maxSessoes) * 100 : 0;
                      return (
                        <div key={e.etapa} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            className="font-mono"
                            style={{
                              width: 220,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              color: BRAND.marrom,
                              flexShrink: 0,
                            }}
                          >
                            {e.etapa}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              background: BRAND.bege,
                              borderRadius: 8,
                              overflow: 'hidden',
                              height: 28,
                              position: 'relative',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPct}%` }}
                              transition={{ duration: 0.6 }}
                              style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${BRAND.rosa}, ${BRAND.rosaDeep})`,
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                                fontSize: 12,
                                fontWeight: 800,
                                color: widthPct > 30 ? BRAND.branco : BRAND.marrom,
                              }}
                            >
                              {e.sessoes}
                            </div>
                          </div>
                          <div
                            style={{
                              width: 80,
                              textAlign: 'right',
                              fontSize: 12,
                              fontWeight: 700,
                              color: e.dropDaAnteriorPct > 0 ? '#DC2626' : `${BRAND.marrom}66`,
                              flexShrink: 0,
                            }}
                          >
                            {e.dropDaAnteriorPct > 0 ? `-${e.dropDaAnteriorPct}%` : '—'}
                          </div>
                          <div
                            className="font-mono"
                            style={{
                              width: 64,
                              textAlign: 'right',
                              fontSize: 11,
                              color: `${BRAND.marrom}88`,
                              flexShrink: 0,
                            }}
                          >
                            {e.conversaoTotalPct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="font-mono" style={{ marginTop: 12, fontSize: 10, color: `${BRAND.marrom}55`, letterSpacing: '0.05em' }}>
                    {funil?.totalSessoesIniciadas ?? 0} sessões entraram no wizard · drop = perda em relação à etapa anterior · % = conversão sobre o total
                  </div>
                </Card>
              )}

              {/* Waste table - full width */}
              <Card title="Gasto por insumo / quebra" delay={0.55} fullWidth>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Insumo', 'Consumo', 'Quebra', '% Quebra', 'Gasto consumo', 'Gasto quebra'].map((h, hi) => (
                          <th
                            key={h}
                            className="font-mono"
                            style={{
                              padding: '8px 0',
                              textAlign: hi === 0 ? 'left' : 'right',
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: `${BRAND.marrom}88`,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map((g: any) => (
                        <tr key={g.insumoId} style={{ borderTop: `1px dashed ${BRAND.begeEsc}` }}>
                          <td style={{ padding: '10px 0', fontWeight: 700, color: BRAND.marrom }}>{g.nome}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: BRAND.marrom }}>
                            {g.consumido.toFixed(2)} {g.unidade}
                          </td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: '#DC2626' }}>
                            {g.quebra.toFixed(2)} {g.unidade}
                          </td>
                          <td
                            style={{
                              padding: '10px 0',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: g.percentualQuebra > 10 ? '#DC2626' : BRAND.marrom,
                            }}
                          >
                            {g.percentualQuebra}%
                          </td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: BRAND.marrom }}>
                            {currency(g.gastoConsumo)}
                          </td>
                          <td style={{ padding: '10px 0', textAlign: 'right', color: '#DC2626' }}>
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

/* ---- Sub-components ---- */

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: BRAND.branco,
        borderRadius: 24,
        border: `1px solid ${highlight ? '#FECACA' : BRAND.begeEsc}`,
        padding: 20,
      }}
    >
      <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}77` }}>
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginTop: 6,
          color: highlight ? '#DC2626' : BRAND.marrom,
        }}
      >
        {value}
      </div>
    </motion.div>
  );
}

function KpiStrat({
  label,
  value,
  hint,
  alvo,
}: {
  label: string;
  value: string;
  hint?: string;
  alvo?: 'ok' | 'baixo' | 'alto' | '';
}) {
  const cor =
    alvo === 'ok'
      ? '#15803d'
      : alvo === 'baixo' || alvo === 'alto'
      ? '#CC0000'
      : BRAND.marrom;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: BRAND.branco,
        borderRadius: 18,
        border: `1px solid ${BRAND.begeEsc}`,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div className="font-mono" style={{ fontSize: 9, color: `${BRAND.marrom}88`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: 26, fontWeight: 800, color: cor, lineHeight: 1, fontStyle: 'italic' }}>
        {value}
      </div>
      {hint && (
        <div className="font-mono" style={{ fontSize: 9, color: `${BRAND.marrom}66`, letterSpacing: '0.05em' }}>
          {hint}
        </div>
      )}
    </motion.div>
  );
}

function Card({
  title,
  children,
  fullWidth,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: BRAND.branco,
        borderRadius: 24,
        border: `1px solid ${BRAND.begeEsc}`,
        padding: 24,
        gridColumn: fullWidth ? '1 / -1' : undefined,
      }}
    >
      <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}88`, marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </motion.div>
  );
}
