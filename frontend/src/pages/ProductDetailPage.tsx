import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getProductBySlug,
  type Product,
} from '../api/products'
import { Header } from '../components/Header'

export function ProductDetailPage() {
  const { slug } = useParams()

  const [product, setProduct] =
    useState<Product | null>(null)

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0)

  const [quantity, setQuantity] =
    useState(1)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('Product not found.')
      setIsLoading(false)
      return
    }

    async function loadProduct() {
      try {
        const data =
          await getProductBySlug(slug!)

        setProduct(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not load product.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  const images = useMemo(() => {
    if (!product) {
      return []
    }

    if (product.images.length > 0) {
      return product.images.map((image) => ({
        url: image.url,
        alt:
          image.altText ??
          product.name,
      }))
    }

    if (product.imageUrl) {
      return [
        {
          url: product.imageUrl,
          alt: product.name,
        },
      ]
    }

    return []
  }, [product])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-16">
          Loading product...
        </main>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-[#9b3e2f]">
            {error ?? 'Product not found.'}
          </p>

          <Link
            to="/"
            className="mt-6 inline-block border-b border-[#1c1c18] text-sm"
          >
            ← Back to shop
          </Link>
        </main>
      </div>
    )
  }

  const price =
    (product.priceCents / 100).toFixed(2)

  const isOutOfStock =
    product.stockQuantity === 0

  const selectedImage =
    images[selectedImageIndex]

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(
        1,
        current - 1,
      ),
    )
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        product.stockQuantity,
        current + 1,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/"
          className="text-sm text-[#69655e] transition hover:text-[#8c3b24]"
        >
          ← Back to shop
        </Link>

        <section className="mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden border border-[#d8d2c8] bg-white">
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#8d887f]">
                  No product image
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex(index)
                    }
                    className={
                      index === selectedImageIndex
                        ? 'aspect-square overflow-hidden border-2 border-[#1c1c18] bg-white'
                        : 'aspect-square overflow-hidden border border-[#d8d2c8] bg-white'
                    }
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
              CommerceLab
            </p>

            <h1 className="font-editorial mt-4 text-5xl leading-[0.95] sm:text-6xl">
              {product.name}
            </h1>

            <p className="mt-5 text-2xl font-semibold">
              €{price}
            </p>

            <div className="mt-6 border-t border-[#cfc8bc] pt-6">
              <p className="max-w-xl leading-7 text-[#69655e]">
                {product.description ??
                  'No description available.'}
              </p>
            </div>

            <div className="mt-8 border-t border-[#cfc8bc] pt-6">
              <p
                className={
                  isOutOfStock
                    ? 'text-xs font-semibold uppercase tracking-[0.16em] text-[#9b3e2f]'
                    : 'text-xs font-semibold uppercase tracking-[0.16em] text-[#66725f]'
                }
              >
                {isOutOfStock
                  ? 'Out of stock'
                  : `${product.stockQuantity} available`}
              </p>

              {!isOutOfStock && (
                <>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="text-sm font-medium">
                      Quantity
                    </span>

                    <div className="flex items-center border border-[#cfc8bc] bg-[#fbf9f5]">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        className="px-4 py-2 text-lg"
                      >
                        −
                      </button>

                      <span className="min-w-10 text-center text-sm">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        className="px-4 py-2 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-6 w-full border border-[#1c1c18] bg-[#1c1c18] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#8c3b24] lg:max-w-sm"
                  >
                    Add {quantity} to cart
                  </button>
                </>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}