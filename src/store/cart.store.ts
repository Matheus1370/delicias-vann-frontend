import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Ocasiao = 'adulto' | 'infantil' | 'casamento' | 'corporativo';

export interface CartItem {
  produtoId: string;
  nome: string;
  precoUnitario: number;
  pontosEsforco: number;
  quantidade: number;
  imagemUrl?: string;
  opcoesEscolhidas?: Record<string, string>;
  personalizacao?: string;
  numeroPessoas?: number;
  ocasiao?: Ocasiao;
  /** Modalidades de entrega aceitas para este item (intersect no checkout). */
  modalidadesPermitidas?: string[];
  /** Lead time mínimo em horas (base produto + opcoesEscolhidas extra). */
  leadTimeHoras?: number;
  /** Imagens de referência (data URLs) — quando presentes, pedido entra em AGUARDANDO_AVALIACAO_COMPLEXIDADE. */
  imagensReferencia?: string[];
}

interface CartState {
  items: CartItem[];
  slotId: string | null;
  dataAgendamento: string | null;
  modalidadeEntrega: string | null;
  numeroPessoas: number | null;
  ocasiao: Ocasiao | null;
  addItem: (item: CartItem) => void;
  removeItem: (produtoId: string) => void;
  updateQty: (produtoId: string, qty: number) => void;
  setSlot: (slotId: string, dataAgendamento: string) => void;
  setModalidade: (modalidade: string) => void;
  setOcasiao: (numeroPessoas: number | null, ocasiao: Ocasiao | null) => void;
  clear: () => void;
  totalPontos: () => number;
  totalValor: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      slotId: null,
      dataAgendamento: null,
      modalidadeEntrega: null,
      numeroPessoas: null,
      ocasiao: null,

      addItem: (item) =>
        set((s) => {
          const exists = s.items.find((i) => i.produtoId === item.produtoId);
          if (exists) {
            return {
              items: s.items.map((i) =>
                i.produtoId === item.produtoId
                  ? { ...i, quantidade: i.quantidade + item.quantidade }
                  : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.produtoId !== id) })),

      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.produtoId !== id)
              : s.items.map((i) => (i.produtoId === id ? { ...i, quantidade: qty } : i)),
        })),

      setSlot: (slotId, dataAgendamento) => set({ slotId, dataAgendamento }),
      setModalidade: (modalidade) => set({ modalidadeEntrega: modalidade }),
      setOcasiao: (numeroPessoas, ocasiao) => set({ numeroPessoas, ocasiao }),
      clear: () =>
        set({
          items: [],
          slotId: null,
          dataAgendamento: null,
          modalidadeEntrega: null,
          numeroPessoas: null,
          ocasiao: null,
        }),

      totalPontos: () =>
        get().items.reduce((acc, i) => acc + i.pontosEsforco * i.quantidade, 0),
      totalValor: () =>
        get().items.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0),
    }),
    { name: 'delicias-cart' },
  ),
);
