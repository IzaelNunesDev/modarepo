import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/product.service';

export default async function HomePage() {
  const products = await getProducts();

  // Get featured products
  const featuresMethods = products.slice(0, 4);
  const hotItems = products.slice(4, 6);

  // Fallback if no products
  if (products.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Nenhum produto encontrado. Verifique se o backend está rodando.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">

      {/* Hero Section with Glassmorphism */}
      <section className="relative w-full h-[480px] rounded-b-[40px] overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: featuresMethods[0]?.images?.[0] ? `url('${featuresMethods[0].images[0]}')` : 'linear-gradient(135deg, #ff2a9d, #b537f2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-primary)]/90 via-transparent to-transparent flex flex-col justify-end p-8 text-white pb-12">
          <div className="glass p-4 rounded-2xl backdrop-blur-md border border-white/20 inline-block mb-4 w-fit">
            <span className="bg-gradient-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nova Coleção
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm">Verão 2026</h1>
          <p className="text-white/90 mb-6 max-w-sm text-lg leading-relaxed font-light">
            Descubra a nova linha de biquínis e saídas de praia para brilhar neste verão.
          </p>
          <Link href="/produtos" className="bg-white text-[var(--text-primary)] font-bold py-4 px-8 rounded-full w-fit hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Ver Coleção
          </Link>
        </div>
      </section>

      <main className="flex-1 px-5 py-8 space-y-10">

        {/* Categories Section - Clean & Glassy */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Categorias</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
            {[
              { name: 'Biquínis', icon: '👙', href: '/produtos?cat=Biquínis' },
              { name: 'Maiôs', icon: '🩱', href: '/produtos?cat=Maiôs' },
              { name: 'Saídas', icon: '👘', href: '/produtos?cat=Saídas' },
              { name: 'Ver Tudo', icon: '👀', href: '/produtos' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href || `/produtos`}
                className="flex flex-col items-center gap-3 min-w-[80px] group"
              >
                <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 border border-white/50">
                  <span className="group-hover:scale-110 transition-transform">{cat.icon}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]/80">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* New Arrivals - Section Header & Grid */}
        <section>
          <div className="flex justify-between items-end mb-8 relative">
            <div className="relative">
              <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tight">Lançamentos</h2>
              <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-pink-500/30 rounded-full"></div>
            </div>
            <Link href="/produtos" className="group flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-pink-600 transition-colors">
              <span>Ver todos</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="group-hover:translate-x-1 transition-transform">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {featuresMethods.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Mid-Page Promo Banner */}
        <section className="relative overflow-hidden rounded-[2rem] shadow-2xl group cursor-pointer h-64 md:h-80">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-out group-hover:scale-110"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1596483238806-03c051515082?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-transparent flex flex-col justify-center p-8 md:p-12 text-white">
            <div className="bg-white/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-4">
              Oferta Relâmpago
            </div>
            <h3 className="font-black text-3xl md:text-5xl mb-2 drop-shadow-lg leading-tight">
              Frete Grátis
            </h3>
            <p className="text-white/80 text-sm md:text-lg font-medium mb-6 max-w-xs leading-relaxed">
              Para todo o Brasil em compras acima de <span className="text-pink-400 font-bold">R$ 200,00</span>
            </p>
            <button className="bg-white text-slate-900 font-bold py-3 px-6 rounded-full w-fit hover:bg-pink-50 transition-all shadow-lg active:scale-95 text-sm md:text-base">
              Aproveitar Agora
            </button>
          </div>
        </section>

        {/* Trending - Hot Items */}
        <section>
          <div className="flex flex-col mb-8 text-center items-center">
            <span className="text-pink-500 font-bold text-xs uppercase tracking-widest mb-2">Tendência</span>
            <h2 className="text-3xl font-black text-slate-900 leading-none">Em Alta no Verão</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highlighted Big Card */}
            {hotItems.length > 0 && (
              <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-slate-100 rounded-3xl overflow-hidden group">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: hotItems[0]?.images?.[0] ? `url("${hotItems[0].images[0]}")` : 'linear-gradient(135deg, #ff2a9d, #b537f2)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                  <h3 className="text-2xl font-bold mb-1">{hotItems[0].name}</h3>
                  <p className="text-white/80 text-sm line-clamp-2 mb-4">{hotItems[0].description}</p>
                  <Link href={`/produto/${hotItems[0].id}`} className="flex items-center gap-2 font-bold text-pink-300 hover:text-white transition-colors">
                    Ver Detalhes <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" /></svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Smaller Grid for remaining hot items */}
            <div className="grid grid-cols-2 gap-4">
              {hotItems.slice(1).concat(featuresMethods.slice(0, 3)).map((product) => (
                <ProductCard key={`hot-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
