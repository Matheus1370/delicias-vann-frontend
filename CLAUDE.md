# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend da confeitaria **Delicias da Vann** — e-commerce com área do cliente (catálogo, montagem de bolo personalizado, checkout PIX, acompanhamento de pedido) e painel admin (pedidos, produção, estoque, cupons, relatórios).

## Commands

```bash
npm run dev        # Vite dev server (porta 5173, proxy /api → localhost:3000)
npm run build      # tsc -b + vite build
npm run preview    # Preview do build
npm run lint       # ESLint
```

## Architecture

**Stack**: React 18 + TypeScript + Vite + Tailwind + Zustand + TanStack React Query + React Router

**Path alias**: `@/` → `src/` (tsconfig + vite.config.ts)

### State Management (Zustand com persist)
- `store/auth.store.ts` — user, accessToken, logout (persisted: `delicias-auth`)
- `store/cart.store.ts` — CartItem[], slotId, dataAgendamento, modalidadeEntrega (persisted: `delicias-cart`)

### API Layer
- `services/api.ts` — instância Axios com base URL de `VITE_API_URL`
- Interceptor de request injeta Bearer token do auth store
- Interceptor de response faz refresh automático no 401 (com fila de requests pendentes)

### Data Fetching
- Hooks em `hooks/` (useProducts, useOrders, useSlots, useCupons, useReports, etc.)
- Todos usam TanStack React Query com `staleTime: 60s` padrão
- Mutations usam `useMutation` com invalidação de cache e toast

### Routing (App.tsx)
- Rotas públicas: `/`, `/cardapio`, `/montar`, `/login`, `/cadastro`, `/termos`, `/privacidade`
- Rotas privadas (cliente): `/checkout`, `/pedidos`, `/pedidos/:id`, `/perfil`, `/assinaturas`
- Rotas admin (OPERADOR/GERENTE/ADMINISTRADOR): `/admin/*`
- `PrivateRoute` enforça auth + role. Todas as pages são lazy-loaded com `React.lazy()`

### Layout
- `components/Layout.tsx` wrapa todas as páginas (navbar fixa com logo, nav, carrinho com badge, menu do usuário, hamburger mobile)
- O Header mostra link "Admin" condicionalmente se o usuário tem role admin

## Brand & Styling

Cores definidas em `styles/brand.ts` e registradas no Tailwind como `brand-*`:

| Token | Cor | Uso |
|-------|-----|-----|
| `brand-bege` | #F6EDE7 | Background principal |
| `brand-rosa` | #ED71A2 | Accent/botões primários |
| `brand-marrom` | #422716 | Texto |
| `brand-begeEsc` | #E8D8CE | Bordas/divisores |
| `brand-roxo` | #7684BF | Secundário |
| `brand-ciano` | #58C2E0 | Terciário |

Fontes: `font-display` (Playfair Display) para headings, `font-body` (Quicksand) para corpo.

Animações custom no tailwind.config.ts: `drip`, `float`, `marquee`, `spin-slow`, `sprinkle`.

## Conventions

- Nomenclatura PT-BR nos domínios de negócio (Pedido, Produto, Cupom, Assinatura, Avaliacao)
- Toasts globais com react-hot-toast (config em App.tsx, estilo brand: fundo marrom, texto bege)
- Ícones via lucide-react
- Radix UI para componentes acessíveis (dialog, select, tabs, tooltip)
- Framer Motion para animações de página e UI

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME="Delicias da Vann"
VITE_INSTAGRAM_HANDLE="@deliciasdavann"
VITE_WHATSAPP_NUMBER="5511982813152"
```

## Docker

```bash
docker build -t delicias-frontend .   # Multi-stage: node build → nginx
```

O nginx.conf faz proxy de `/api/` para `http://backend:3000/api/` e serve SPA com fallback `try_files`.
