import { Link } from 'react-router-dom'

import { Header } from '../components/Header'
import { useCart } from '../context/CartContext'

export function CartPage() {
  const {
    items,
    subtotalCents,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  const subtotal =
    (
      subtotalCents /
      100
    ).toFixed(2)

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="border-b border-[#cfc8bc] pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
            CommerceLab
          </p>

          <h1 className="font-editorial mt-3 text-5xl sm:text-6xl">
            Your cart
          </h1>

          <p className="mt-3 text-[#69655e]">
            Review your items before checkout.
          </p>
        </header>

        {items.length === 0 ? (
          <section className="py-20 text-center">
            <h2 className="font-editorial text-4xl">
              Your cart is empty.
            </h2>

            <p className="mt-3 text-[#69655e]">
              Add something from the shop to get started.
            </p>

            <Link
              to="/"
              className="mt-7 inline-block border border-[#1c1c18] px-5 py-3 text-sm transition hover:bg-[#1c1c18] hover:text-white"
            >
              Continue shopping
            </Link>
          </section>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="border border-[#d8d2c8] bg-[#fbf9f5]">
                {items.map((item) => {
                  const itemTotal =
                    (
                      item.priceCents *
                      item.quantity /
                      100
                    ).toFixed(2)

                  return (
                    <article
                      key={item.productId}
                      className="grid gap-5 border-b border-[#e3ded5] p-5 last:border-b-0 sm:grid-cols-[120px_1fr_auto]"
                    >
                      <Link
                        to={`/products/${item.slug}`}
                        className="aspect-square overflow-hidden border border-[#d8d2c8] bg-white"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[#8d887f]">
                            No image
                          </div>
                        )}
                      </Link>

                      <div>
                        <Link
                          to={`/products/${item.slug}`}
                          className="font-editorial text-2xl transition hover:text-[#8c3b24]"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-sm text-[#69655e]">
                          €
                          {(item.priceCents / 100).toFixed(2)}
                          {' '}each
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#777168]">
                          {item.stockQuantity} available
                        </p>

                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex items-center border border-[#cfc8bc] bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                item.quantity <= 1
                              }
                              className="px-4 py-2 text-lg disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="min-w-10 text-center text-sm">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                item.quantity >=
                                item.stockQuantity
                              }
                              className="px-4 py-2 text-lg disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const confirmed =
                                window.confirm(
                                  `Remove ${item.name} from your cart?`,
                                )

                              if (confirmed) {
                                removeFromCart(
                                  item.productId,
                                )
                              }
                            }}
                            className="text-sm text-[#9b3e2f] underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          €{itemTotal}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  const confirmed =
                    window.confirm(
                      'Clear the entire cart?',
                    )

                  if (confirmed) {
                    clearCart()
                  }
                }}
                className="mt-5 text-sm text-[#9b3e2f] underline"
              >
                Clear cart
              </button>
            </section>

            <aside>
              <div className="border border-[#d8d2c8] bg-[#fbf9f5] p-6 lg:sticky lg:top-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#69655e]">
                  Order summary
                </p>

                <div className="mt-6 flex items-center justify-between border-b border-[#d8d2c8] pb-5">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    €{subtotal}
                  </strong>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#777168]">
                  Shipping and taxes will be calculated at checkout.
                </p>

                <Link
                  to="/checkout"
                  className="mt-6 block w-full border border-[#1c1c18] bg-[#1c1c18] px-5 py-4 text-center text-sm font-medium text-white transition hover:bg-[#8c3b24]"
                >
                  Continue to checkout
                </Link>

                <Link
                  to="/"
                  className="mt-4 block text-center text-sm text-[#69655e] underline"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}