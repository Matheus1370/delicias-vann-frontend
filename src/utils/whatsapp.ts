export interface AdicionalResumo {
  nome: string;
  quantidade: number;
}

export interface WhatsAppPayload {
  produtoNome: string;
  numeroPessoas?: number;
  ocasiao?: string;
  opcoesEscolhidas: Record<string, string>;
  personalizacao?: string;
  adicionais: AdicionalResumo[];
  valorTotal: number;
  pedidoId?: string;
}

const OCASIAO_LABEL: Record<string, string> = {
  adulto: 'aniversário adulto',
  infantil: 'aniversário infantil',
  casamento: 'casamento',
  corporativo: 'corporativo',
};

const ETAPA_EMOJI: Record<string, string> = {
  tamanho: '📐',
  massa: '🍰',
  recheio: '🍫',
  cobertura: '✨',
};

export function gerarMensagemWhatsApp(payload: WhatsAppPayload): string {
  const linhas: string[] = [];
  linhas.push('Olá! Vim do site da Delícias da Vann e quero seguir esse pedido por aqui:');
  linhas.push('');
  linhas.push(`🎂 *${payload.produtoNome}*`);

  if (payload.numeroPessoas) {
    const oc = payload.ocasiao ? OCASIAO_LABEL[payload.ocasiao] ?? payload.ocasiao : null;
    linhas.push(`👥 ${payload.numeroPessoas} pessoas${oc ? ` (${oc})` : ''}`);
  }

  for (const [etapa, valor] of Object.entries(payload.opcoesEscolhidas)) {
    if (!valor) continue;
    const emoji = ETAPA_EMOJI[etapa] ?? '•';
    linhas.push(`${emoji} ${etapa}: ${valor}`);
  }

  if (payload.personalizacao) {
    linhas.push('');
    linhas.push(`💬 mensagem: "${payload.personalizacao}"`);
  }

  if (payload.adicionais.length > 0) {
    linhas.push('');
    linhas.push('🍬 adicionais:');
    for (const ad of payload.adicionais) {
      linhas.push(`- ${ad.quantidade}x ${ad.nome}`);
    }
  }

  linhas.push('');
  linhas.push(`💰 total estimado: R$ ${payload.valorTotal.toFixed(2).replace('.', ',')}`);

  if (payload.pedidoId) {
    linhas.push(`🆔 ref: ${payload.pedidoId.slice(0, 8)}`);
  }

  return linhas.join('\n');
}

export function gerarLinkWhatsApp(numero: string, payload: WhatsAppPayload): string {
  const numeroLimpo = numero.replace(/\D/g, '');
  const mensagem = encodeURIComponent(gerarMensagemWhatsApp(payload));
  return `https://wa.me/${numeroLimpo}?text=${mensagem}`;
}
