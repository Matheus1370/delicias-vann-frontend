import { motion } from 'framer-motion';
import {
  useMinhasAssinaturas,
  useMudarAssinatura,
} from '../../hooks/useAssinaturas';
import { BRAND } from '../../styles/brand';

const STATUS_LABEL: Record<string, string> = {
  ATIVA: 'Ativa',
  PAUSADA: 'Pausada',
  CANCELADA: 'Cancelada',
};

export default function Subscriptions() {
  const { data: assinaturas = [], isLoading } = useMinhasAssinaturas();
  const { mutate: mudar } = useMudarAssinatura();

  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-2">
          Minhas assinaturas
        </h1>
        <p className="text-brand-marrom/60 mb-8">
          Doces entregues automaticamente na frequência que você escolher.
        </p>

        {isLoading ? (
          <div className="text-center text-brand-marrom/50 py-16">Carregando...</div>
        ) : assinaturas.length === 0 ? (
          <div className="text-center text-brand-marrom/60 py-16">
            <div className="font-display text-2xl font-bold text-brand-marrom mb-2">
              Nenhuma assinatura ativa
            </div>
            <p className="text-sm">Experimente nossos produtos e assine os seus favoritos!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {assinaturas.map((a: any, i: number) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-5 flex gap-4"
                style={{ border: `1.5px solid ${BRAND.begeEsc}` }}
              >
                {a.produto?.imagemUrl && (
                  <img
                    src={a.produto.imagemUrl}
                    alt={a.produto.nome}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="font-bold text-brand-marrom">{a.produto?.nome}</div>
                  <div className="text-xs text-brand-marrom/60 mt-1">
                    a cada {a.frequenciaDias} dias · {STATUS_LABEL[a.status]}
                  </div>
                  <div className="text-xs text-brand-marrom/60">
                    próxima entrega:{' '}
                    {new Date(a.proximaGeracao).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {a.status === 'ATIVA' && (
                      <button
                        onClick={() => mudar({ id: a.id, acao: 'pausar' })}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-bege text-brand-marrom"
                      >
                        Pausar
                      </button>
                    )}
                    {a.status === 'PAUSADA' && (
                      <button
                        onClick={() => mudar({ id: a.id, acao: 'retomar' })}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                        style={{ background: BRAND.rosa }}
                      >
                        Retomar
                      </button>
                    )}
                    {a.status !== 'CANCELADA' && (
                      <button
                        onClick={() => {
                          if (confirm('Cancelar esta assinatura?')) {
                            mudar({ id: a.id, acao: 'cancelar' });
                          }
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: '#FFE8E8',
                          color: '#CC0000',
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
