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
import { Star11, Pill, ProductPlaceholder } from '../../components/BrandElements';

const MODALIDADES = [
  { value: 'RETIRADA_BALCAO', label: 'Retirar no balcao', frete: 0 },
  { value: 'MOTOBOY_LOCAL', label: 'Motoboy (ate 10km)', frete: 15 },
  { value: 'UBER_DIRECT', label: 'Uber Direct', frete: 22 },
];

const currency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalValor = useCartStore((s) => s.totalValor());
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);

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
    cidade: 'Sao Paulo',
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
      <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '0 32px' }}>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(48px, 6vw, 88px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              margin: 0,
              fontStyle: 'italic',
              color: BRAND.marrom,
            }}
          >
            carrinho <span style={{ color: BRAND.rosa }}>vazio</span>.
          </h1>
          <div style={{ marginTop: 32 }}>
            <Pill bg={BRAND.rosa} fg={BRAND.bege} onClick={() => navigate('/cardapio')}>
              ver cardapio →
            </Pill>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BRAND.bege, minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display"
          style={{
            fontSize: 'clamp(48px, 6vw, 88px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            margin: 0,
            fontStyle: 'italic',
            color: BRAND.marrom,
          }}
        >
          <span style={{ color: BRAND.rosa }}>prontinho</span>
          <br />
          pra finalizar.
        </motion.h1>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 32, marginTop: 48 }}>
          {/* Left column: items + delivery + forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Item cards */}
            {items.map((it, i) => (
              <motion.div
                key={it.produtoId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex',
                  gap: 16,
                  background: BRAND.branco,
                  padding: 16,
                  borderRadius: 20,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 14,
                    background: BRAND.rosa + '22',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {it.imagemUrl ? (
                    <img
                      src={it.imagemUrl}
                      alt={it.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ProductPlaceholder label={it.nome} accent={BRAND.rosa} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: BRAND.rosa,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {it.opcoesEscolhidas ? 'personalizado' : 'cardapio'}
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: BRAND.marrom,
                      fontStyle: 'italic',
                    }}
                  >
                    {it.nome}
                  </div>
                  {it.personalizacao && (
                    <div
                      style={{
                        fontSize: 12,
                        color: BRAND.marrom,
                        opacity: 0.5,
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}
                    >
                      "{it.personalizacao}"
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {/* Qty picker */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: BRAND.bege,
                        padding: 3,
                        borderRadius: 999,
                      }}
                    >
                      <button
                        onClick={() => {
                          if (it.quantidade <= 1) {
                            removeItem(it.produtoId);
                          } else {
                            updateQty(it.produtoId, it.quantidade - 1);
                          }
                        }}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: 16,
                          color: BRAND.marrom,
                        }}
                      >
                        -
                      </button>
                      <span
                        className="font-mono"
                        style={{
                          minWidth: 20,
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {it.quantidade}
                      </span>
                      <button
                        onClick={() => updateQty(it.produtoId, it.quantidade + 1)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: 16,
                          color: BRAND.marrom,
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: BRAND.marrom }}>
                      {currency(it.precoUnitario * it.quantidade)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Upsell section */}
            {upsell.length > 0 && (
              <div
                style={{
                  background: BRAND.branco,
                  padding: 20,
                  borderRadius: 20,
                  border: `1px solid ${BRAND.begeEsc}`,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: BRAND.roxo,
                    marginBottom: 12,
                  }}
                >
                  ✦ que tal adicionar?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          textAlign: 'left',
                          cursor: jaTem ? 'default' : 'pointer',
                          opacity: jaTem ? 0.5 : 1,
                          background: BRAND.bege,
                          border: `1.5px solid ${BRAND.begeEsc}`,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.marrom }}>{u.nome}</div>
                        <div style={{ fontSize: 11, color: BRAND.marrom, opacity: 0.6, marginTop: 2 }}>
                          {currency(Number(u.precoVenda))}
                        </div>
                        {!jaTem && (
                          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: BRAND.rosa }}>
                            + adicionar
                          </div>
                        )}
                        {jaTem && (
                          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: BRAND.marrom, opacity: 0.4 }}>
                            ✓ no carrinho
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery section */}
            <div
              style={{
                background: BRAND.branco,
                padding: 24,
                borderRadius: 20,
                border: `1px solid ${BRAND.begeEsc}`,
                marginTop: 8,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: BRAND.rosa,
                  marginBottom: 16,
                }}
              >
                ✦ entrega
              </div>

              {/* Delivery modality */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {MODALIDADES.map((m) => (
                  <label
                    key={m.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 14,
                      cursor: 'pointer',
                      background: modalidade === m.value ? BRAND.rosa + '11' : BRAND.bege,
                      border: `1.5px solid ${modalidade === m.value ? BRAND.rosa : BRAND.begeEsc}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="modalidade"
                        checked={modalidade === m.value}
                        onChange={() => setModalidade(m.value)}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.marrom }}>{m.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.marrom, opacity: 0.6 }}>
                      {m.frete === 0 ? 'gratis' : currency(m.frete)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Schedule */}
              <div style={{ marginBottom: 16 }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: BRAND.marrom,
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  data de retirada/entrega
                </div>
                <input
                  type="datetime-local"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 500,
                    background: BRAND.bege,
                    border: `1.5px solid ${BRAND.begeEsc}`,
                    outline: 'none',
                    color: BRAND.marrom,
                  }}
                />
              </div>

              {/* Address fields (conditional) */}
              {precisaEndereco && (
                <div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: BRAND.marrom,
                      opacity: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}
                  >
                    endereco de entrega
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <StyledInput
                      placeholder="CEP"
                      value={endereco.cep}
                      onChange={(v) => setEndereco((e) => ({ ...e, cep: v }))}
                    />
                    <StyledInput
                      placeholder="Logradouro"
                      value={endereco.logradouro}
                      onChange={(v) => setEndereco((e) => ({ ...e, logradouro: v }))}
                      style={{ gridColumn: '1 / -1' }}
                    />
                    <StyledInput
                      placeholder="Numero"
                      value={endereco.numero}
                      onChange={(v) => setEndereco((e) => ({ ...e, numero: v }))}
                    />
                    <StyledInput
                      placeholder="Bairro"
                      value={endereco.bairro}
                      onChange={(v) => setEndereco((e) => ({ ...e, bairro: v }))}
                    />
                    <StyledInput
                      placeholder="Cidade"
                      value={endereco.cidade}
                      onChange={(v) => setEndereco((e) => ({ ...e, cidade: v }))}
                    />
                    <StyledInput
                      placeholder="Estado"
                      value={endereco.estado}
                      onChange={(v) => setEndereco((e) => ({ ...e, estado: v }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CPF / Observacoes / Cupom */}
            <div
              style={{
                background: BRAND.branco,
                padding: 24,
                borderRadius: 20,
                border: `1px solid ${BRAND.begeEsc}`,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: BRAND.rosa,
                  marginBottom: 16,
                }}
              >
                ✦ dados adicionais
              </div>

              <div style={{ marginBottom: 16 }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: BRAND.marrom,
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  cpf (para nota fiscal)
                </div>
                <StyledInput placeholder="000.000.000-00" value={cpf} onChange={setCpf} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: BRAND.marrom,
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  observacoes
                </div>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Alergias, horario preferido, recado especial..."
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 500,
                    background: BRAND.bege,
                    border: `1.5px solid ${BRAND.begeEsc}`,
                    outline: 'none',
                    color: BRAND.marrom,
                    resize: 'vertical',
                    minHeight: 72,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: BRAND.marrom,
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  cupom
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="Ex: VANN10"
                    value={cupom}
                    onChange={(e) => setCupom(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 14,
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: BRAND.bege,
                      border: `1.5px solid ${BRAND.begeEsc}`,
                      outline: 'none',
                      color: BRAND.marrom,
                    }}
                  />
                  <Pill
                    bg={BRAND.rosa}
                    fg={BRAND.bege}
                    size="sm"
                    onClick={aplicarCupom}
                  >
                    aplicar
                  </Pill>
                </div>
                {cupomData?.cupom && (
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                    ✓ {cupomData.cupom.codigo} aplicado — desconto de {currency(cupomData.desconto)}
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '8px 4px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={aceitou}
                onChange={(e) => setAceitou(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ fontSize: 12, color: BRAND.marrom, opacity: 0.7, lineHeight: 1.5 }}>
                Li e aceito os{' '}
                <a href="/termos" style={{ color: BRAND.rosa, fontWeight: 700, textDecoration: 'underline' }}>
                  termos de uso
                </a>{' '}
                e a{' '}
                <a href="/privacidade" style={{ color: BRAND.rosa, fontWeight: 700, textDecoration: 'underline' }}>
                  politica de privacidade
                </a>
                .
              </span>
            </label>
          </div>

          {/* Right column: sticky summary panel */}
          <div style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
            <div
              style={{
                background: BRAND.marrom,
                color: BRAND.bege,
                padding: 28,
                borderRadius: 24,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Star decoration */}
              <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.3 }}>
                <Star11 size={80} color={BRAND.rosa} fill={BRAND.rosa} stroke={0} />
              </div>

              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 0.6,
                }}
              >
                resumo
              </div>

              {/* Breakdown */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>subtotal</span>
                  <span>{currency(totalValor)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>frete</span>
                  <span>{frete === 0 ? 'gratis' : currency(frete)}</span>
                </div>
                {desconto > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>desconto</span>
                    <span>- {currency(desconto)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: BRAND.rosa }}>
                  <span>✦ mimo da van</span>
                  <span>gratis</span>
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 24,
                  borderTop: `2px dashed ${BRAND.bege}22`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: 13, opacity: 0.7 }}>total</span>
                <span
                  className="font-display"
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: BRAND.rosa,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {currency(total)}
                </span>
              </div>

              {/* Pay button */}
              <motion.button
                whileHover={{ scale: podeConfirmar ? 1.02 : 1 }}
                whileTap={{ scale: podeConfirmar ? 0.98 : 1 }}
                onClick={handleConfirm}
                disabled={!podeConfirmar || isPending}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: 18,
                  background: BRAND.rosa,
                  color: BRAND.bege,
                  border: 'none',
                  borderRadius: 999,
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: podeConfirmar && !isPending ? 'pointer' : 'not-allowed',
                  opacity: podeConfirmar && !isPending ? 1 : 0.4,
                }}
              >
                {isPending ? 'criando pedido...' : 'pagar agora →'}
              </motion.button>

              <div
                className="font-mono"
                style={{
                  marginTop: 12,
                  textAlign: 'center',
                  fontSize: 11,
                  opacity: 0.6,
                  letterSpacing: '0.05em',
                }}
              >
                pix · cartao · whatsapp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable styled input */
function StyledInput({
  placeholder,
  value,
  onChange,
  style: extraStyle,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: 12,
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 500,
        background: BRAND.bege,
        border: `1.5px solid ${BRAND.begeEsc}`,
        outline: 'none',
        color: BRAND.marrom,
        ...extraStyle,
      }}
    />
  );
}
