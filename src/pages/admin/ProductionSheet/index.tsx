import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

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
      <div className="min-h-screen flex items-center justify-center font-body">
        <div className="text-gray-500">Carregando ficha...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-10 font-body text-black">
      <style>{`
        @media print {
          body { font-family: Georgia, serif; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-wider">Delicias da Vann</div>
            <div className="text-3xl font-black">Ficha de Produção</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider">Pedido</div>
            <div className="text-3xl font-black">
              #{pedido.id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500">Cliente</div>
            <div className="text-base font-bold">{pedido.cliente?.nome}</div>
            {pedido.cliente?.telefone && (
              <div className="text-sm">{pedido.cliente.telefone}</div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500">Entrega</div>
            <div className="text-base font-bold">
              {pedido.dataAgendamento
                ? new Date(pedido.dataAgendamento).toLocaleString('pt-BR')
                : '—'}
            </div>
            <div className="text-sm">{pedido.modalidadeEntrega}</div>
          </div>
        </div>

        {pedido.reservaProducao?.slot && (
          <div className="mb-6 p-4 border-2 border-black">
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Janela de produção
            </div>
            <div className="text-base font-bold">
              {new Date(pedido.reservaProducao.slot.horaInicio).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              —{' '}
              {new Date(pedido.reservaProducao.slot.horaFim).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}

        <div className="border-t-2 border-b-2 border-black py-4 mb-6">
          <div className="text-[10px] font-bold uppercase text-gray-500 mb-3">Itens</div>
          {pedido.itens?.map((item: any) => (
            <div key={item.id} className="mb-4">
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-black">{item.quantidade}×</div>
                <div className="text-xl font-bold">{item.produto?.nome}</div>
              </div>
              {item.opcoesEscolhidas && (
                <div className="ml-12 mt-1">
                  {Object.entries(item.opcoesEscolhidas).map(([k, v]) => (
                    <div key={k} className="text-sm">
                      <span className="uppercase text-[10px] text-gray-500">{k}:</span>{' '}
                      <span className="font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              {item.personalizacao && (
                <div className="ml-12 mt-1 p-2 border-l-4 border-black bg-gray-50 text-sm italic">
                  “{item.personalizacao}”
                </div>
              )}

              {item.produto?.fichasTecnicas?.[0]?.itens?.length > 0 && (
                <div className="ml-12 mt-2 text-xs">
                  <div className="uppercase text-[9px] text-gray-500">Insumos</div>
                  <table className="w-full mt-1">
                    <tbody>
                      {item.produto.fichasTecnicas[0].itens.map((f: any) => (
                        <tr key={f.id} className="border-b border-gray-200">
                          <td className="py-1">{f.insumo?.nome}</td>
                          <td className="py-1 text-right font-bold">
                            {(Number(f.quantidade) * item.quantidade).toFixed(2)}{' '}
                            {f.unidadeMedida}
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

        {pedido.observacoes && (
          <div className="mb-6 p-4 border-2 border-black">
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Observações do cliente
            </div>
            <div className="text-sm mt-1">{pedido.observacoes}</div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-6">
          <div className="border-t border-black pt-2">
            <div className="text-[10px] uppercase text-gray-500">Iniciado em</div>
          </div>
          <div className="border-t border-black pt-2">
            <div className="text-[10px] uppercase text-gray-500">Concluído em</div>
          </div>
        </div>

        <div className="no-print mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-xl font-bold text-white bg-black"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
