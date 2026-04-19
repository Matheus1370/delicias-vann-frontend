Crie um novo componente React seguindo as convenções do projeto Delicias da Vann.

**Nome do componente**: $ARGUMENTS

## Instruções

1. Crie o arquivo em `src/components/{NomeDoComponente}.tsx`
2. Use TypeScript com interface para as props
3. Exporte como `export default`
4. Aplique Tailwind com as cores da marca:
   - `bg-brand-bege`, `text-brand-marrom`, `bg-brand-rosa`, `border-brand-begeEsc`
   - Fonte heading: `font-display`, corpo: `font-body`
5. Use `lucide-react` para ícones se necessário
6. Faça responsivo (mobile-first: estilos base para mobile, `md:` para desktop)
7. Use `framer-motion` para animações se fizer sentido

## Template base

```tsx
import { /* icons */ } from 'lucide-react';

interface {NomeDoComponente}Props {
  // props aqui
}

export default function {NomeDoComponente}({ ...props }: {NomeDoComponente}Props) {
  return (
    <div className="...">
      {/* conteúdo */}
    </div>
  );
}
```

Se o nome do componente não foi fornecido via $ARGUMENTS, pergunte ao usuário o nome e a finalidade do componente antes de criar.
