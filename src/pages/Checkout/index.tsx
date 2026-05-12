import { useEffect, useMemo, useState } from 'react';
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

/** Calcula intersecao de modalidadesPermitidas de todos os itens do carrinho.
 *  Item sem o campo é tratado como permissivo (aceita qualquer modalidade). */
function calcularModalidadesPermitidas(items: { modalidadesPermitidas?: string[] }[]): Set<string> {
  return items.reduce<Set<string> | null>((acc, item) => {
    const permitidas = item.modalidadesPermitidas;
    if (!permitidas || permitidas.length === 0) return acc;
    if (acc === null) return new Set(permitidas);
    return new Set([...acc].filter((m) => permitidas.includes(m)));
  }, null) ?? new Set(MODALIDADES.map((m) => m.value));
}

const currency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalValor = useCartStore((s) => s.totalValor());
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const numeroPessoas = useCartStore((s) => s.numeroPessoas);
  const ocasiao = useCartStore((s) => s.ocasiao);

  const { data: me } = useMe();
  const { data: upsell = [] } = useUpsellItems();
  const { mutate: criar, isPending } = useCreateOrder();
  const { mutate: validarCupom, data: cupomData, isPending: validandoCupom } = useValidarCupom();

  const modalidadesPermitidas = useMemo(
    () => calcularModalidadesPermitidas(items),
    [items],
  );

  const maxLeadTimeHoras = useMemo(
    () => items.reduce((acc, it) => Math.max(acc, it.leadTimeHoras ?? 0), 0),
    [items],
  );
  const minDataAgendamento = useMemo(() => {
    if (maxLeadTimeHoras <= 0) return '';
    const min = new Date(Date.now() + maxLeadTimeHoras * 60 * 60 * 1000);
    // formato datetime-local "YYYY-MM-DDTHH:mm" no fuso local
    const off = min.getTimezoneOffset();
    const local = new Date(min.getTime() - off * 60 * 1000);
    return local.toISOString().slice(0, 16);
  }, [maxLeadTimeHoras]);
  const maxLeadTimeDias = Math.ceil(maxLeadTimeHoras / 24);
  const primeiraPermitida =
    MODALIDADES.find((m) => modalidadesPermitidas.has(m.value))?.value ?? MODALIDADES[0].value;
  const [modalidade, setModalidade] = useState(primeiraPermitida);
  const [horaFesta, setHoraFesta] = useState('');
  const [bufferHoras, setBufferHoras] = useState<number>(2);

  /* Se modalidade selecionada deixar de ser permitida (ex: item adicionado), troca pra primeira valida */
  useEffect(() => {
    if (!modalidadesPermitidas.has(modalidade)) {
      setModalidade(primeiraPermitida);
    }
  }, [modalidadesPermitidas, modalidade, primeiraPermitida]);

  /* Buffer minimo por modalidade — espelha o backend */
  const BUFFER_MIN: Record<string, number> = {
    RETIRADA_BALCAO: 0,
    MOTOBOY_LOCAL: 2,
    UBER_DIRECT: 1,
    NOVENTA_NOVE_ENTREGAS: 1,
  };
  const bufferMin = BUFFER_MIN[modalidade] ?? 0;
  useEffect(() => {
    if (bufferHoras < bufferMin) setBufferHoras(bufferMin);
  }, [bufferMin, bufferHoras]);
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
    !!horaFesta &&
    !!cpf &&
    (!precisaEndereco ||
      (!!endereco.logradouro && !!endereco.numero && !!endereco.bairro && !!endereco.cep));

  /* Despacho derivado da festa - buffer */
  const despachoStr = useMemo(() => {
    if (!horaFesta) return '';
    const festa = new Date(horaFesta);
    const despacho = new Date(festa.getTime() - bufferHoras * 60 * 60 * 1000);
    return despacho.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [horaFesta, bufferHoras]);

  /* min datetime: agora + (leadTime + buffer) garante despacho >= now+leadTime */
  const minHoraFesta = useMemo(() => {
    const horas = maxLeadTimeHoras + bufferHoras;
    if (horas <= 0) return '';
    const min = new Date(Date.now() + horas * 60 * 60 * 1000);
    const off = min.getTimezoneOffset();
    const local = new Date(min.getTime() - off * 60 * 1000);
    return local.toISOString().slice(0, 16);
  }, [maxLeadTimeHoras, bufferHoras]);

  const aplicarCupom = () => {
    if (!cupom.trim()) return;
    validarCupom({ codigo: cupom, subtotal: totalValor });
  };

  // Pega pessoas/ocasiao do primeiro item que tem (wizard preenche por bolo)
  // ou do estado global do carrinho como fallback.
  const itemComPessoas = items.find((i) => i.numeroPessoas && i.ocasiao);
  const pedidoNumeroPessoas = itemComPessoas?.numeroPessoas ?? numeroPessoas ?? undefined;
  const pedidoOcasiao = itemComPessoas?.ocasiao ?? ocasiao ?? undefined;

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
        horaFestaPrevista: new Date(horaFesta).toISOString(),
        bufferHorasAntes: bufferHoras,
        observacoes: observacoes || undefined,
        cupomCodigo: cupomData?.cupom?.codigo,
        numeroPessoas: pedidoNumeroPessoas,
        ocasiao: pedidoOcasiao,
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
                {MODALIDADES.map((m) => {
                  const liberada = modalidadesPermitidas.has(m.value);
                  const itemIncompativel = !liberada
                    ? items.find(
                        (i) =>
                          i.modalidadesPermitidas &&
                          !i.modalidadesPermitidas.includes(m.value),
                      )
                    : null;
                  return (
                    <label
                      key={m.value}
                      title={
                        !liberada && itemIncompativel
                          ? `${itemIncompativel.nome} não pode ser despachado por essa modalidade`
                          : undefined
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        borderRadius: 14,
                        cursor: liberada ? 'pointer' : 'not-allowed',
                        opacity: liberada ? 1 : 0.45,
                        background:
                          modalidade === m.value && liberada
                            ? BRAND.rosa + '11'
                            : BRAND.bege,
                        border: `1.5px solid ${
                          modalidade === m.value && liberada ? BRAND.rosa : BRAND.begeEsc
                        }`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="modalidade"
                          disabled={!liberada}
                          checked={modalidade === m.value}
                          onChange={() => setModalidade(m.value)}
                        />
                        <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.marrom }}>
                          {m.label}
                        </span>
                        {!liberada && itemIncompativel && (
                          <span
                            className="font-mono"
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#FFE8E8',
                              color: '#CC0000',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                            }}
                          >
                            não disponível
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.marrom, opacity: 0.6 }}>
                        {m.frete === 0 ? 'gratis' : currency(m.frete)}
                      </span>
                    </label>
                  );
                })}
              </div>
              {modalidadesPermitidas.size === 0 && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: '#FFE8E8',
                    border: '1.5px solid #CC0000',
                    fontSize: 12,
                    color: '#990000',
                  }}
                >
                  Nenhuma modalidade compatível com todos os itens do carrinho. Considere remover algum item.
                </div>
              )}

              {/* Schedule — festa + buffer */}
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
                  que horas é a festa?
                </div>
                <input
                  type="datetime-local"
                  value={horaFesta}
                  min={minHoraFesta || undefined}
                  onChange={(e) => setHoraFesta(e.target.value)}
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

                <div style={{ marginTop: 12 }}>
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
                    chegada do bolo (antes da festa)
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2, 3, 4].filter((h) => h >= bufferMin).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setBufferHoras(h)}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                          background: bufferHoras === h ? BRAND.rosa : BRAND.bege,
                          color: bufferHoras === h ? BRAND.branco : BRAND.marrom,
                          border: `1.5px solid ${bufferHoras === h ? BRAND.rosa : BRAND.begeEsc}`,
                          cursor: 'pointer',
                        }}
                      >
                        {h === 0 ? 'na hora' : `${h}h antes`}
                      </button>
                    ))}
                  </div>
                  {bufferMin > 0 && (
                    <div
                      className="font-mono"
                      style={{
                        marginTop: 4,
                        fontSize: 9,
                        color: `${BRAND.marrom}77`,
                        letterSpacing: '0.05em',
                      }}
                    >
                      mínimo {bufferMin}h para {modalidade.toLowerCase().replace(/_/g, ' ')}
                    </div>
                  )}
                </div>

                {horaFesta && despachoStr && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: `${BRAND.rosa}10`,
                      border: `1.5px dashed ${BRAND.rosa}55`,
                    }}
                  >
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 9,
                        color: BRAND.rosa,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      despacho previsto
                    </div>
                    <div style={{ fontSize: 14, color: BRAND.marrom, fontWeight: 700 }}>
                      {despachoStr}
                    </div>
                    <div style={{ fontSize: 12, color: `${BRAND.marrom}88`, marginTop: 2 }}>
                      {modalidade === 'RETIRADA_BALCAO'
                        ? 'esse é o horário pra retirada no balcão.'
                        : `bolo sai do nosso forno pra chegar ${bufferHoras}h antes da festa.`}
                    </div>
                  </div>
                )}

                {maxLeadTimeHoras > 0 && (
                  <div
                    className="font-mono"
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: BRAND.rosa,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}
                  >
                    ⏱ prazo mínimo {maxLeadTimeDias} dias ({maxLeadTimeHoras}h) de produção
                  </div>
                )}
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
