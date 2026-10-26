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
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          CommerceLab
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Products
        </h1>

        <p className="mt-3 text-slate-400">
          Products loaded from the CommerceLab API.
        </p>

        {isLoading && (
          <p className="mt-8 text-slate-400">
            Loading products...
          </p>
        )}

        {error && (
          <p className="mt-8 text-red-400">
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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