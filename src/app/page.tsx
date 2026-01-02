'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { mockProducts } from '@/data/products';

export default function HomePage() {
  // Get 4 featured products
  const featuresMethods = mockProducts.slice(0, 4);
  const summerCollection = mockProducts.filter(p => p.category === 'Biquínis').slice(0, 2);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[var(--bg-primary)] pb-safe">

      {/* Hero Section */}
      <section className="relative w-full h-[400px] bg-cover bg-center rounded-b-[32px] overflow-hidden shadow-lg"
        style={{ backgroundImage: `url('${mockProducts[0].images[0]}')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-primary)]/80 to-transparent flex flex-col justify-end p-6 text-white pb-10">
          <span className="bg-[var(--accent-pink)] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
            NOVA COLEÇÃO
          </span>
          <h1 className="text-4xl font-bold mb-2">Verão 2026</h1>
          <p className="text-white/90 mb-4 max-w-xs">
            Descubra a nova linha de biquínis e saídas de praia para brilhar neste verão.
          </p>
          <Link href="/produtos" className="bg-white text-[var(--text-primary)] font-bold py-3 px-6 rounded-full w-fit hover:bg-gray-100 transition-colors">
            Ver Coleção
          </Link>
        </div>
      </section>

      <main className="flex-1 px-4 py-8 space-y-8">

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Categorias</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {[
              { name: 'Biquínis', icon: '👙' },
              { name: 'Maiôs', icon: '🩱' },
              { name: 'Saídas', icon: '👘' },
              { name: 'Ver Tudo', icon: '👀', href: '/produtos' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href || `/produtos`}
                className="flex flex-col items-center gap-2 min-w-[72px]"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-2xl shadow-sm">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-[var(--text-primary)]">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Lançamentos</h2>
            <Link href="/produtos" className="text-[var(--accent-pink)] text-sm font-bold">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuresMethods.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="bg-gradient-to-r from-[var(--accent-pink)] to-[#ff6bb3] rounded-2xl p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl mb-1">Frete Grátis</h3>
            <p className="text-white/90 text-sm">Nas compras acima de R$ 299</p>
          </div>
          <div className="text-4xl">🚚</div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
