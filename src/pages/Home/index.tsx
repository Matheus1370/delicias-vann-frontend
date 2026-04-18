import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useProducts';

export default function Home() {
  const { data: categorias } = useCategories();

  return (
    <div className="min-h-screen bg-brand-bege font-body px-6 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-display text-6xl font-black text-brand-marrom tracking-tight">
          Delicias <span className="italic text-brand-rosa">da Vann</span>
        </h1>
        <p className="text-brand-marrom/60 mt-4 text-lg font-medium">
          Bolos, docinhos e sobremesas feitos com carinho.
        </p>

        <div className="flex gap-4 justify-center mt-10">
          <Link
            to="/cardapio"
            className="px-6 py-3 rounded-2xl font-bold text-white bg-brand-rosa shadow-lg"
          >
            Ver cardápio
          </Link>
          <Link
            to="/montar"
            className="px-6 py-3 rounded-2xl font-bold text-brand-marrom bg-white border-2 border-brand-rosa"
          >
            Montar meu bolo
          </Link>
        </div>

        {categorias && categorias.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-brand-marrom mb-4">Categorias</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {categorias.map((c: any) => (
                <span
                  key={c.id}
                  className="px-4 py-2 rounded-full bg-white border border-brand-rosa/30 text-sm font-bold text-brand-marrom"
                >
                  {c.nome}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
