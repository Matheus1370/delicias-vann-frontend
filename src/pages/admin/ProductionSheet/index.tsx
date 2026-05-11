import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { BRAND } from '../../../styles/brand';

export default function ProductionSheet() {
  const { id } = useParams();
  const { data: pedido, isLoading } = useQuery({
    queryKey: ['ficha-producao', id],
    queryFn: () => api.get(`/orders/${id}/ficha-producao`).then((r) => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (pedido) {
      setTimeout(() => window.print(), 500);
    }
  }, [pedido]);

  if (isLoading || !pedido) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.bege }}>
        <div style={{ color: `${BRAND.marrom}77`, fontWeight: 500 }}>Carregando ficha...</div>
      </div>
    );
  }

  return (
    <div className="font-body" style={{ minHeight: '100vh', background: BRAND.branco, padding: 40, color: BRAND.marrom }}>
      <style>{`
        @media print {
          body { font-family: Georgia, serif; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `2px solid ${BRAND.marrom}`,
            paddingBottom: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: BRAND.rosa, fontFamily: 'Space Grotesk' }}>
              Delicias da Vann
            </div>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 700, fontStyle: 'italic', color: BRAND.marrom, marginTop: 4 }}>
              Ficha de <span style={{ color: BRAND.rosa }}>Producao</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}88` }}>
              Pedido
            </div>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: BRAND.marrom }}>
              #{pedido.id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Festa (pessoas + ocasião) — só aparece se preenchido */}
        {(pedido.numeroPessoas || pedido.ocasiao) && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              background: `${BRAND.rosa}10`,
              border: `1.5px dashed ${BRAND.rosa}55`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: BRAND.rosa }}>
              Festa
            </div>
            <div style={{ fontSize: 14, color: BRAND.marrom, fontWeight: 700 }}>
              {pedido.numeroPessoas ? `${pedido.numeroPessoas} pessoas` : '—'}
              {pedido.ocasiao && (
                <span style={{ fontWeight: 500, color: `${BRAND.marrom}aa`, marginLeft: 8 }}>
                  · {pedido.ocasiao}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Client / Delivery info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div
            style={{
              background: BRAND.bege,
              borderRadius: 16,
              padding: 16,
              border: `1px solid ${BRAND.begeEsc}`,
            }}
          >
            <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}88`, marginBottom: 6 }}>
              Cliente
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{pedido.cliente?.nome}</div>
            {pedido.cliente?.telefone && (
              <div style={{ fontSize: 13, color: `${BRAND.marrom}88`, marginTop: 2 }}>{pedido.cliente.telefone}</div>
            )}
          </div>
          <div
            style={{
              background: BRAND.bege,
              borderRadius: 16,
              padding: 16,
              border: `1px solid ${BRAND.begeEsc}`,
            }}
          >
            <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}88`, marginBottom: 6 }}>
              Entrega
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {pedido.dataAgendamento
                ? new Date(pedido.dataAgendamento).toLocaleString('pt-BR')
                : '\u2014'}
            </div>
            <div style={{ fontSize: 13, color: `${BRAND.marrom}88`, marginTop: 2 }}>{pedido.modalidadeEntrega}</div>
          </div>
        </div>

        {/* Production window */}
        {pedido.reservaProducao?.slot && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 16,
              background: BRAND.marrom,
              color: BRAND.bege,
            }}
          >
            <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.bege}aa`, marginBottom: 6 }}>
              Janela de producao
            </div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>
              {new Date(pedido.reservaProducao.slot.horaInicio).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              \u2014{' '}
              {new Date(pedido.reservaProducao.slot.horaFim).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div
          style={{
            background: BRAND.branco,
            borderRadius: 24,
            border: `1px solid ${BRAND.begeEsc}`,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${BRAND.marrom}88`, marginBottom: 16 }}>
            Itens do pedido
          </div>

          {pedido.itens?.map((item: any, idx: number) => (
            <div
              key={item.id}
              style={{
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: idx < pedido.itens.length - 1 ? `1px dashed ${BRAND.begeEsc}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: BRAND.rosa }}>
                  {item.quantidade}x
                </div>
                <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: BRAND.marrom }}>
                  {item.produto?.nome}
                </div>
              </div>

              {item.opcoesEscolhidas && (
                <div style={{ marginLeft: 48, marginTop: 6 }}>
                  {Object.entries(item.opcoesEscolhidas).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 13 }}>
                      <span className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: `${BRAND.marrom}88` }}>{k}:</span>{' '}
                      <span style={{ fontWeight: 700 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.personalizacao && (
                <div
                  style={{
                    marginLeft: 48,
                    marginTop: 8,
                    padding: '8px 12px',
                    borderLeft: `3px solid ${BRAND.rosa}`,
                    background: BRAND.bege,
                    borderRadius: '0 8px 8px 0',
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: `${BRAND.marrom}cc`,
                  }}
                >
                  "{item.personalizacao}"
                </div>
              )}

              {/* Ingredients table */}
              {item.produto?.fichasTecnicas?.[0]?.itens?.length > 0 && (
                <div style={{ marginLeft: 48, marginTop: 12 }}>
                  <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: `${BRAND.marrom}88`, marginBottom: 6 }}>
                    Insumos
                  </div>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <tbody>
                      {item.produto.fichasTecnicas[0].itens.map((f: any) => (
                        <tr key={f.id} style={{ borderBottom: `1px dashed ${BRAND.begeEsc}` }}>
                          <td style={{ padding: '4px 0', color: BRAND.marrom }}>{f.insumo?.nome}</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700, color: BRAND.marrom }}>
                            {(Number(f.quantidade) * item.quantidade).toFixed(2)} {f.unidadeMedida}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {pedido.observacoes && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 16,
              background: `${BRAND.rosa}12`,
              border: `1.5px solid ${BRAND.rosa}33`,
            }}
          >
            <div className="font-mono" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: BRAND.rosa, marginBottom: 6 }}>
              Observacoes do cliente
            </div>
            <div style={{ fontSize: 14, color: BRAND.marrom }}>{pedido.observacoes}</div>
          </div>
        )}

        {/* Signature lines */}
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ borderTop: `1px solid ${BRAND.begeEsc}`, paddingTop: 8 }}>
            <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: `${BRAND.marrom}88` }}>
              Iniciado em
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${BRAND.begeEsc}`, paddingTop: 8 }}>
            <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: `${BRAND.marrom}88` }}>
              Concluido em
            </div>
          </div>
        </div>

        {/* Print button */}
        <div className="no-print" style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: '12px 32px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              color: BRAND.branco,
              background: BRAND.rosa,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
