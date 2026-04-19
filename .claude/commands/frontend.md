Você está trabalhando no frontend da confeitaria **Delicias da Vann** (React + Vite + TypeScript + Tailwind). Siga rigorosamente estas convenções:

## Stack & Imports
- React 18 + TypeScript strict
- Path alias: `@/` → `src/`
- Ícones: somente `lucide-react`
- Componentes acessíveis: `@radix-ui/*`
- Animações: `framer-motion`
- Notificações: `react-hot-toast` (toast global, estilo brand)

## Brand & Styling (Tailwind)
| Classe | Cor | Uso |
|--------|-----|-----|
| `bg-brand-bege` | #F6EDE7 | Background principal |
| `bg-brand-rosa` / `text-brand-rosa` | #ED71A2 | Accent, botões primários |
| `text-brand-marrom` | #422716 | Texto |
| `border-brand-begeEsc` | #E8D8CE | Bordas, divisores |
| `bg-brand-roxo` | #7684BF | Secundário |
| `bg-brand-ciano` | #58C2E0 | Terciário |

- Fonte heading: `font-display` (Playfair Display)
- Fonte corpo: `font-body` (Quicksand)
- Abordagem mobile-first com breakpoints Tailwind (`sm:`, `md:`, `lg:`)
- Botão primário: `bg-brand-rosa text-white rounded-full px-6 py-3 hover:bg-brand-rosa/90`
- Botão secundário: `border border-brand-rosa text-brand-rosa rounded-full px-6 py-3`

## State Management
- **Auth**: `useAuthStore` (Zustand, persisted) — user, accessToken, logout
- **Cart**: `useCartStore` (Zustand, persisted) — items, addItem, removeItem, clear, totalValor, totalPontos
- **Server state**: TanStack React Query via hooks em `src/hooks/` (useProducts, useOrders, useSlots, etc.)

## API
- Axios instance em `src/services/api.ts` com interceptor de Bearer token e refresh automático no 401
- Base URL via `VITE_API_URL` (proxy `/api` → backend em dev)

## Padrões
- Todas as páginas são lazy-loaded (`React.lazy()` + `Suspense`)
- Todas as páginas são wrappadas pelo `Layout` (`src/components/Layout.tsx`) que fornece Header/Navbar
- Rotas privadas usam `PrivateRoute` com check de auth e roles
- Nomenclatura PT-BR para domínio de negócio: Pedido, Produto, Cupom, Assinatura, Avaliação
- Toast de sucesso: `toast.success('Mensagem')` / erro: `toast.error('Mensagem')`

## Estrutura de pastas
```
src/
├── components/   → componentes reutilizáveis (Layout, CookieBanner)
├── pages/        → páginas por feature (Home/, Catalog/, Checkout/, admin/)
├── hooks/        → hooks de data fetching (useProducts, useOrders, etc.)
├── services/     → api.ts (axios)
├── store/        → Zustand stores (auth, cart)
├── styles/       → brand.ts, globals.css
```

Aplique essas convenções em todo código que criar ou modificar neste projeto.
