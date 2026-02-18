import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { mockProducts } from '@/data/products';

export default function HomePage() {
  // Get 4 featured products
  const featuresMethods = mockProducts.slice(0, 4);
  const hotItems = mockProducts.slice(4, 6);

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">

      {/* Hero Section with Glassmorphism */}
      <section className="relative w-full h-[480px] rounded-b-[40px] overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('${mockProducts[0].images[0]}')` }}
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

        {/* New Arrivals - Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Lançamentos</h2>
            <Link href="/produtos" className="text-[var(--accent-pink)] text-sm font-bold hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featuresMethods.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Promo Banner - Gradient */}
        <section className="relative overflow-hidden rounded-3xl shadow-lg group cursor-pointer hover-lift">
          <div className="absolute inset-0 bg-gradient-brand opacity-90"></div>
          <div className="relative p-8 text-white flex justify-between items-center z-10">
            <div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">LIMITED TIME</div>
              <h3 className="font-bold text-2xl mb-1">Frete Grátis</h3>
              <p className="text-white/90 text-sm font-medium opacity-90">Nas compras acima de R$ 299</p>
            </div>
            <div className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">🚚</div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </section>

        {/* Hot Items */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Em Alta</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </main>

    </div>
  );
}
