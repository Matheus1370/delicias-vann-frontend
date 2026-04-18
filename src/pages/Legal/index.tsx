import { BRAND } from '../../styles/brand';

interface LegalProps {
  kind: 'termos' | 'privacidade';
}

const CONTENT: Record<string, { title: string; body: string[] }> = {
  termos: {
    title: 'Termos de Uso',
    body: [
      'Bem-vindo à Delicias da Vann. Ao utilizar nosso site, você concorda com os termos abaixo.',
      'Os produtos são preparados sob encomenda e podem conter traços de alergênicos (glúten, ovo, leite, frutos secos). Informe qualquer restrição alimentar no campo de observações do pedido.',
      'Os prazos de produção e entrega informados no checkout são estimativas. Faremos o nosso melhor para cumpri-los, mas podem variar em datas comemorativas.',
      'Cancelamentos são aceitos até 30 minutos após a confirmação do pagamento. Após esse período, entre em contato diretamente conosco.',
      'Em caso de dúvida, fale com a gente pelo WhatsApp.',
    ],
  },
  privacidade: {
    title: 'Política de Privacidade',
    body: [
      'A Delicias da Vann trata seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).',
      'Coletamos: nome, e-mail, telefone, CPF (opcional, para nota fiscal), endereço (para entrega) e data de nascimento (opcional, para cupom de aniversário).',
      'Usamos esses dados exclusivamente para: processar seus pedidos, emitir nota fiscal quando habilitado, enviar atualizações do pedido por WhatsApp e, se você aceitou o marketing opt-in, enviar novidades e cupons.',
      'Você pode, a qualquer momento, acessar, corrigir ou excluir seus dados na seção "Meu perfil". Ao excluir, anonimizamos imediatamente seus dados pessoais; seus pedidos permanecem apenas para fins fiscais, sem identificação.',
      'Nós não vendemos, compartilhamos ou transferimos seus dados para terceiros, exceto parceiros estritamente necessários para a operação (gateway de pagamento, logística, WhatsApp).',
      'Entre em contato pelo e-mail privacidade@deliciasdavann.com.br para qualquer solicitação relacionada aos seus dados.',
    ],
  },
};

export default function Legal({ kind }: LegalProps) {
  const { title, body } = CONTENT[kind];
  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-black text-brand-marrom mb-8">{title}</h1>
        <div
          className="bg-white rounded-3xl p-8 space-y-4"
          style={{ border: `2px solid ${BRAND.begeEsc}` }}
        >
          {body.map((p, i) => (
            <p key={i} className="text-sm text-brand-marrom/80 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
