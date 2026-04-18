import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  produtoId: string;
  nome: string;
  precoUnitario: number;
  pontosEsforco: number;
  quantidade: number;
  imagemUrl?: string;
  opcoesEscolhidas?: Record<string, string>;
  personalizacao?: string;
}

interface CartState {
  items: CartItem[];
  slotId: string | null;
  dataAgendamento: string | null;
  modalidadeEntrega: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (produtoId: string) => void;
  updateQty: (produtoId: string, qty: number) => void;
  setSlot: (slotId: string, dataAgendamento: string) => void;
  setModalidade: (modalidade: string) => void;
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
      clear: () =>
        set({ items: [], slotId: null, dataAgendamento: null, modalidadeEntrega: null }),

      totalPontos: () =>
        get().items.reduce((acc, i) => acc + i.pontosEsforco * i.quantidade, 0),
      totalValor: () =>
        get().items.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0),
    }),
    { name: 'delicias-cart' },
  ),
);
