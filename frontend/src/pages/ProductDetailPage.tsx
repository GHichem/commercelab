import {
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import type {
  Product,
} from '../api/products'

import { Header } from '../components/Header'
import { useCart } from '../context/CartContext'

const apiUrl =
  import.meta.env.VITE_API_URL

export function ProductDetailPage() {
  const { slug } = useParams<{
    slug: string
  }>()

  const { addToCart } =
    useCart()

  const [
    product,
    setProduct,
  ] = useState<Product | null>(
    null,
  )

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<string | null>(
    null,
  )

  const [
    quantity,
    setQuantity,
  ] = useState(1)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  )

  const [
    addedMessage,
    setAddedMessage,
  ] = useState(false)

  useEffect(() => {
    if (!slug) {
      setError(
        'Product not found.',
      )

      setLoading(false)

      return
    }

    async function loadProduct() {
      try {
        setLoading(true)
        setError(null)

        const response =
          await fetch(
            `${apiUrl}/products/${slug}`,
          )

        if (!response.ok) {
          throw new Error(
            'Product not found.',
          )
        }

        const data: Product =
          await response.json()

        setProduct(data)

        const firstImage =
          data.images?.[0]?.url ??
          data.imageUrl ??
          null

        setSelectedImage(
          firstImage,
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not load product.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  function decreaseQuantity() {
    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1,
        ),
    )
  }

  function increaseQuantity() {
    if (!product) {
      return
    }

    setQuantity(
      (current) =>
        Math.min(
          product.stockQuantity,
          current + 1,
        ),
    )
  }

  function handleAddToCart() {
    if (!product) {
      return
    }

    if (
      product.stockQuantity <= 0
    ) {
      return
    }

    const nextQuantity =
      Math.min(
        quantity,
        product.stockQuantity,
      )

    addToCart(
      product,
      nextQuantity,
    )

    setAddedMessage(true)

    window.setTimeout(
      () => {
        setAddedMessage(false)
      },
      2000,
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-[#69655e]">
            Loading product...
          </p>
        </main>
      </div>
    )
  }

  if (
    error ||
    !product
  ) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-20">
          <h1 className="font-editorial text-5xl">
            Product not found
          </h1>

          <p className="mt-4 text-[#69655e]">
            {error ??
              'This product is unavailable.'}
          </p>

          <Link
            to="/"
            className="mt-7 inline-block border border-[#1c1c18] px-5 py-3 text-sm transition hover:bg-[#1c1c18] hover:text-white"
          >
            Back to shop
          </Link>
        </main>
      </div>
    )
  }

  const productImages =
    product.images?.length
      ? product.images
      : product.imageUrl
        ? [
            {
              id: -1,
              url:
                product.imageUrl,
              altText:
                product.name,
              position: 0,
            },
          ]
        : []

  const isOutOfStock =
    product.stockQuantity <= 0

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

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <section>
            <div className="aspect-square overflow-hidden border border-[#d8d2c8] bg-white">
              {selectedImage ? (
                <img
                  src={
                    selectedImage
                  }
                  alt={
                    product.name
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#8d887f]">
                  No image available
                </div>
              )}
            </div>

            {productImages.length >
              1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {productImages.map(
                  (image) => {
                    const active =
                      selectedImage ===
                      image.url

                    return (
                      <button
                        key={
                          image.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            image.url,
                          )
                        }
                        className={`aspect-square overflow-hidden border bg-white transition ${
                          active
                            ? 'border-[#1c1c18]'
                            : 'border-[#d8d2c8] hover:border-[#8c3b24]'
                        }`}
                      >
                        <img
                          src={
                            image.url
                          }
                          alt={
                            image.altText ??
                            product.name
                          }
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )
                  },
                )}
              </div>
            )}
          </section>

          <section className="lg:pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
              CommerceLab
            </p>

            <h1 className="font-editorial mt-3 text-5xl leading-tight sm:text-6xl">
              {product.name}
            </h1>

            <p className="mt-6 text-2xl font-semibold">
              €
              {(
                product.priceCents /
                100
              ).toFixed(2)}
            </p>

            {product.description && (
              <p className="mt-7 max-w-xl leading-7 text-[#69655e]">
                {
                  product.description
                }
              </p>
            )}

            <div className="mt-8 border-y border-[#d8d2c8] py-5">
              {isOutOfStock ? (
                <p className="text-sm font-medium text-[#9b3e2f]">
                  Out of stock
                </p>
              ) : (
                <p className="text-sm text-[#69655e]">
                  {
                    product.stockQuantity
                  }{' '}
                  in stock
                </p>
              )}
            </div>

            {!isOutOfStock && (
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#69655e]">
                  Quantity
                </p>

                <div className="flex items-center gap-5">
                  <div className="flex items-center border border-[#cfc8bc] bg-white">
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <= 1
                      }
                      className="px-5 py-3 text-lg disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      −
                    </button>

                    <span className="min-w-12 text-center">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        product.stockQuantity
                      }
                      className="px-5 py-3 text-lg disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm text-[#777168]">
                    Max{' '}
                    {
                      product.stockQuantity
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  className="mt-6 w-full border border-[#1c1c18] bg-[#1c1c18] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#8c3b24] sm:w-auto sm:min-w-64"
                >
                  Add{' '}
                  {quantity}{' '}
                  to cart
                </button>

                {addedMessage && (
                  <p className="mt-4 text-sm font-medium text-[#4f6a3f]">
                    Added to cart.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}