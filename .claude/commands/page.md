Crie uma nova página React seguindo as convenções do projeto Delicias da Vann.

**Nome da página**: $ARGUMENTS

## Instruções

1. Crie o arquivo em `src/pages/{NomeDaPagina}/index.tsx`
2. Se precisar de dados da API, crie um hook em `src/hooks/use{NomeDaPagina}.ts` seguindo o padrão existente:
   ```tsx
   import { useQuery } from '@tanstack/react-query';
   import api from '@/services/api';
   
   export function use{Nome}() {
     return useQuery({
       queryKey: ['{chave}'],
       queryFn: () => api.get('/{endpoint}').then(r => r.data),
     });
   }
   ```
3. Adicione a rota em `src/App.tsx`:
   - Import lazy: `const {NomeDaPagina} = lazy(() => import('./pages/{NomeDaPagina}'));`
   - Adicione `<Route>` no local apropriado (pública ou dentro de `<PrivateRoute>`)
4. Inclua estados de loading e erro:
   ```tsx
   if (isLoading) return <div className="flex justify-center py-20"><span className="text-brand-rosa text-lg">Carregando...</span></div>;
   if (error) return <div className="text-center py-20 text-red-500">Erro ao carregar dados</div>;
   ```
5. Use Tailwind com cores da marca: `bg-brand-bege`, `text-brand-marrom`, `bg-brand-rosa`
6. Fonte heading: `font-display`, corpo: `font-body`
7. Layout responsivo mobile-first
8. Use `framer-motion` para animações de entrada da página

## Template base

```tsx
import { motion } from 'framer-motion';

export default function {NomeDaPagina}() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      <h1 className="font-display text-3xl text-brand-marrom mb-6">{Título}</h1>
      {/* conteúdo */}
    </motion.div>
  );
}
```

Se o nome da página não foi fornecido via $ARGUMENTS, pergunte ao usuário o nome e a finalidade da página antes de criar.
