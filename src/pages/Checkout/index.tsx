import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cart.store';
import { useCreateOrder } from '../../hooks/useOrders';
import { useUpsellItems } from '../../hooks/useProducts';
import { useValidarCupom } from '../../hooks/useCupons';
import { useMe } from '../../hooks/useUser';
import { BRAND } from '../../styles/brand';

const MODALIDADES = [
  { value: 'RETIRADA_BALCAO', label: 'Retirar no balcão', frete: 0 },
  { value: 'MOTOBOY_LOCAL', label: 'Motoboy (até 10km)', frete: 15 },
  { value: 'UBER_DIRECT', label: 'Uber Direct', frete: 22 },
];

const currency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalValor = useCartStore((s) => s.totalValor());
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const { data: me } = useMe();
  const { data: upsell = [] } = useUpsellItems();
  const { mutate: criar, isPending } = useCreateOrder();
  const { mutate: validarCupom, data: cupomData, isPending: validandoCupom } = useValidarCupom();

  const [modalidade, setModalidade] = useState(MODALIDADES[0].value);
  const [observacoes, setObservacoes] = useState('');
  const [cupom, setCupom] = useState('');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [cpf, setCpf] = useState(me?.cpf ?? '');
  const [endereco, setEndereco] = useState({
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '',
  });
  const [aceitou, setAceitou] = useState(false);

  const frete = MODALIDADES.find((m) => m.value === modalidade)?.frete ?? 0;
  const desconto = cupomData?.desconto ?? 0;
  const total = totalValor + frete - desconto;

  const precisaEndereco = modalidade !== 'RETIRADA_BALCAO';
  const podeConfirmar =
    items.length > 0 &&
    aceitou &&
    !!dataAgendamento &&
    !!cpf &&
    (!precisaEndereco ||
      (!!endereco.logradouro && !!endereco.numero && !!endereco.bairro && !!endereco.cep));

  const aplicarCupom = () => {
    if (!cupom.trim()) return;
    validarCupom({ codigo: cupom, subtotal: totalValor });
  };

  const handleConfirm = () => {
    criar(
      {
        itens: items.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          opcoesEscolhidas: i.opcoesEscolhidas,
          personalizacao: i.personalizacao,
        })),
        modalidadeEntrega: modalidade,
        dataAgendamento,
        observacoes: observacoes || undefined,
        cupomCodigo: cupomData?.cupom?.codigo,
      },
      {
        onSuccess: (pedido) => {
          navigate(`/pedidos/${pedido.id}`);
        },
      },
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bege font-body px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl font-black text-brand-marrom mb-4">
            Seu carrinho está vazio
          </h1>
          <button
            onClick={() => navigate('/cardapio')}
            className="mt-4 px-6 py-3 rounded-2xl font-bold text-white"
            style={{ background: BRAND.rosa }}
          >
            Ver cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-8">Checkout</h1>

        <Card title="Itens">
          <div className="space-y-3">
            {items.map((i) => (
              <div
                key={i.produtoId}
                className="flex justify-between items-start py-2 border-b border-brand-bege last:border-0"
              >
                <div className="flex-1">
                  <div className="font-bold text-brand-marrom">{i.nome}</div>
                  <div className="text-xs text-brand-marrom/60">
                    {i.quantidade} × {currency(i.precoUnitario)}
                  </div>
                  {i.personalizacao && (
                    <div className="text-xs text-brand-marrom/50 italic mt-0.5">
                      “{i.personalizacao}”
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-marrom">
                    {currency(i.precoUnitario * i.quantidade)}
                  </div>
                  <button
                    onClick={() => removeItem(i.produtoId)}
                    className="text-xs text-brand-rosa font-bold"
                  >
                    remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {upsell.length > 0 && (
          <Card title="Que tal adicionar?">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {upsell.map((u: any) => {
                const jaTem = items.some((i) => i.produtoId === u.id);
                return (
                  <button
                    key={u.id}
                    disabled={jaTem}
                    onClick={() =>
                      addItem({
                        produtoId: u.id,
                        nome: u.nome,
                        precoUnitario: Number(u.precoVenda),
                        pontosEsforco: u.pontosEsforco,
                        quantidade: 1,
                      })
                    }
                    className="p-3 rounded-xl text-left disabled:opacity-50"
                    style={{
                      background: BRAND.bege,
                      border: `1.5px solid ${BRAND.begeEsc}`,
                    }}
                  >
                    <div className="text-xs font-bold text-brand-marrom">{u.nome}</div>
                    <div className="text-[11px] text-brand-marrom/60 mt-0.5">
                      {currency(Number(u.precoVenda))}
                    </div>
                    {!jaTem && (
                      <div className="text-[10px] font-bold mt-1" style={{ color: BRAND.rosa }}>
                        + adicionar
                      </div>
                    )}
                    {jaTem && (
                      <div className="text-[10px] font-bold mt-1 text-brand-marrom/40">
                        ✓ no carrinho
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Entrega">
          <div className="flex flex-col gap-2">
            {MODALIDADES.map((m) => (
              <label
                key={m.value}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                style={{
                  background: modalidade === m.value ? BRAND.rosa + '11' : BRAND.bege,
                  border: `1.5px solid ${modalidade === m.value ? BRAND.rosa : BRAND.begeEsc}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="modalidade"
                    checked={modalidade === m.value}
                    onChange={() => setModalidade(m.value)}
                  />
                  <span className="text-sm font-bold text-brand-marrom">{m.label}</span>
                </div>
                <span className="text-sm font-bold text-brand-marrom/60">
                  {m.frete === 0 ? 'grátis' : currency(m.frete)}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <Label>Data de retirada/entrega</Label>
            <input
              type="datetime-local"
              value={dataAgendamento}
              onChange={(e) => setDataAgendamento(e.target.value)}
              className="w-full p-3 rounded-xl text-sm font-medium"
              style={{ background: BRAND.bege, border: `1.5px solid ${BRAND.begeEsc}` }}
            />
          </div>
        </Card>

        {precisaEndereco && (
          <Card title="Endereço de entrega">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                placeholder="CEP"
                value={endereco.cep}
                onChange={(v) => setEndereco((e) => ({ ...e, cep: v }))}
              />
              <Input
                placeholder="Logradouro"
                value={endereco.logradouro}
                onChange={(v) => setEndereco((e) => ({ ...e, logradouro: v }))}
              />
              <Input
                placeholder="Número"
                value={endereco.numero}
                onChange={(v) => setEndereco((e) => ({ ...e, numero: v }))}
              />
              <Input
                placeholder="Bairro"
                value={endereco.bairro}
                onChange={(v) => setEndereco((e) => ({ ...e, bairro: v }))}
              />
              <Input
                placeholder="Cidade"
                value={endereco.cidade}
                onChange={(v) => setEndereco((e) => ({ ...e, cidade: v }))}
              />
              <Input
                placeholder="Estado"
                value={endereco.estado}
                onChange={(v) => setEndereco((e) => ({ ...e, estado: v }))}
              />
            </div>
          </Card>
        )}

        <Card title="Dados para nota fiscal (opcional)">
          <Label>CPF</Label>
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={setCpf}
          />
          <p className="text-xs text-brand-marrom/50 mt-2">
            Usaremos para emitir nota fiscal quando o serviço for habilitado.
          </p>
        </Card>

        <Card title="Observações">
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Alergias, horário preferido, recado especial…"
            className="w-full p-3 rounded-xl text-sm font-medium resize-none outline-none"
            style={{ background: BRAND.bege, border: `1.5px solid ${BRAND.begeEsc}`, minHeight: 72 }}
          />
        </Card>

        <Card title="Cupom">
          <div className="flex gap-2">
            <input
              placeholder="Ex: VANN10"
              value={cupom}
              onChange={(e) => setCupom(e.target.value.toUpperCase())}
              className="flex-1 p-3 rounded-xl text-sm font-bold uppercase"
              style={{ background: BRAND.bege, border: `1.5px solid ${BRAND.begeEsc}` }}
            />
            <button
              onClick={aplicarCupom}
              disabled={validandoCupom || !cupom}
              className="px-4 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: BRAND.rosa }}
            >
              Aplicar
            </button>
          </div>
          {cupomData?.cupom && (
            <div className="mt-2 text-xs text-green-700 font-bold">
              ✓ {cupomData.cupom.codigo} aplicado — desconto de {currency(cupomData.desconto)}
            </div>
          )}
        </Card>

        <Card title="Resumo">
          <Row label="Subtotal" value={currency(totalValor)} />
          <Row label="Frete" value={frete === 0 ? 'grátis' : currency(frete)} />
          {desconto > 0 && <Row label="Desconto" value={`− ${currency(desconto)}`} />}
          <div className="flex justify-between pt-3 mt-3 border-t-2 border-brand-bege">
            <span className="font-display text-lg font-bold text-brand-marrom">Total</span>
            <span
              className="font-display text-2xl font-black"
              style={{ color: BRAND.rosa }}
            >
              {currency(total)}
            </span>
          </div>
        </Card>

        <label className="flex items-start gap-3 my-6 px-2">
          <input
            type="checkbox"
            checked={aceitou}
            onChange={(e) => setAceitou(e.target.checked)}
            className="mt-1"
          />
          <span className="text-xs text-brand-marrom/70">
            Li e aceito os{' '}
            <a href="/termos" className="text-brand-rosa font-bold underline">
              termos de uso
            </a>{' '}
            e a{' '}
            <a href="/privacidade" className="text-brand-rosa font-bold underline">
              política de privacidade
            </a>
            .
          </span>
        </label>

        <motion.button
          whileHover={{ scale: podeConfirmar ? 1.02 : 1 }}
          whileTap={{ scale: podeConfirmar ? 0.98 : 1 }}
          onClick={handleConfirm}
          disabled={!podeConfirmar || isPending}
          className="w-full py-4 rounded-2xl font-bold text-white shadow-lg disabled:opacity-40"
          style={{ background: BRAND.rosa, boxShadow: `0 8px 32px ${BRAND.rosa}55` }}
        >
          {isPending ? 'Criando pedido…' : `Pagar ${currency(total)} via Pix`}
        </motion.button>
      </div>
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-brand-marrom/50 uppercase tracking-wider mb-1">
      {children}
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded-xl text-sm font-medium outline-none"
      style={{ background: BRAND.bege, border: `1.5px solid ${BRAND.begeEsc}` }}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-brand-marrom/60 font-medium">{label}</span>
      <span className="font-bold text-brand-marrom">{value}</span>
    </div>
  );
}
