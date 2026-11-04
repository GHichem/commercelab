import { useEffect, useMemo, useState } from 'react'

import { getProducts, type Product } from '../api/products'
import { Header } from '../components/Header'
import { ProductCard } from '../components/ProductCard'

export function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

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

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)

      const matchesStock =
        !inStockOnly || product.stockQuantity > 0

      return matchesSearch && matchesStock
    })
  }, [products, search, inStockOnly])

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <Header />

      <main className="px-6 py-10">
        <section className="mx-auto max-w-7xl">
          <header className="border-b border-[#cfc8bc] pb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c3b24]">
              CommerceLab
            </p>

            <h1 className="font-editorial mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-6xl">
              Objects for modern work and everyday life.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#666159]">
              A curated collection of useful technology and desk essentials.
            </p>
          </header>

          <section
            id="products"
            className="scroll-mt-24"
          >
            <div className="mt-8 flex flex-col gap-4 border-b border-[#cfc8bc] pb-6 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-md">
                <label
                  htmlFor="product-search"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#69655e]"
                >
                  Search
                </label>

                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products..."
                  className="w-full border-b border-[#9f998f] bg-transparent px-0 py-2 text-base outline-none transition placeholder:text-[#aaa49a] focus:border-[#1c1c18]"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) =>
                    setInStockOnly(event.target.checked)
                  }
                  className="h-4 w-4 accent-[#8c3b24]"
                />

                <span>In stock only</span>
              </label>
            </div>

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

            {!isLoading &&
              !error &&
              filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="font-editorial text-3xl">
                    No products found.
                  </p>

                  <p className="mt-2 text-sm text-[#69655e]">
                    Try changing your search or filters.
                  </p>
                </div>
              )}

            {!isLoading &&
              !error &&
              filteredProducts.length > 0 && (
                <>
                  <p className="mt-6 text-xs uppercase tracking-[0.16em] text-[#777168]">
                    {filteredProducts.length}{' '}
                    {filteredProducts.length === 1
                      ? 'product'
                      : 'products'}
                  </p>

                  <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                </>
              )}
          </section>

          <section
            id="about"
            className="mt-24 border-t border-[#cfc8bc] py-12"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <h2 className="font-editorial text-4xl leading-tight">
                Built as a real full-stack commerce project.
              </h2>

              <p className="max-w-xl leading-7 text-[#666159]">
                CommerceLab connects a React frontend with an Express API,
                Prisma and PostgreSQL. The project focuses on clean
                architecture, reliable data handling and a storefront that
                feels like a real product rather than a technical demo.
              </p>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}