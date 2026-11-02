import { useEffect, useState } from 'react'
import { getProducts, type Product } from './api/products'
import { ProductCard } from './components/ProductCard'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch {
        setError('Could not load products.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

 return (
  <main className="min-h-screen bg-[#f7f4ee] px-6 py-10 text-[#1c1c18]">
    <section className="mx-auto max-w-7xl">
      <header className="border-b border-[#cfc8bc] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c3b24]">
          CommerceLab
        </p>

        <h1 className="font-editorial mt-4 max-w-3xl text-5xl leading-none sm:text-6xl">
          Objects for modern work and everyday life.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-[#666159]">
          A curated collection of useful technology and desk essentials.
        </p>
      </header>

      {isLoading && (
        <p className="mt-10 text-[#69655e]">
          Loading products...
        </p>
      )}

      {error && (
        <p className="mt-10 text-[#9b3e2f]">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  </main>
)
}

export default App