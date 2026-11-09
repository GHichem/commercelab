import {
  type FormEvent,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { createOrder } from '../api/orders'
import { Header } from '../components/Header'
import { useCart } from '../context/CartContext'

export function CheckoutPage() {
  const navigate = useNavigate()

  const {
    items,
    subtotalCents,
    clearCart,
  } = useCart()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Germany')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = useMemo(
    () => (subtotalCents / 100).toFixed(2),
    [subtotalCents],
  )

  if (items.length === 0) {
    return (
      <Navigate
        to="/cart"
        replace
      />
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !postalCode.trim() ||
      !country.trim()
    ) {
      setError('Please complete all required fields.')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const order = await createOrder({
        email,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        country,

        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })

      clearCart()

      navigate(
        `/checkout/success?order=${encodeURIComponent(
          order.orderNumber,
        )}`,
        {
          replace: true,
        },
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not place order.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/cart"
          className="text-sm text-[#69655e] transition hover:text-[#8c3b24]"
        >
          ← Back to cart
        </Link>

        <header className="mt-8 border-b border-[#cfc8bc] pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
            CommerceLab
          </p>

          <h1 className="font-editorial mt-3 text-5xl sm:text-6xl">
            Checkout
          </h1>

          <p className="mt-3 text-[#69655e]">
            Enter your shipping information and review your order.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]"
        >
          <section>
            {error && (
              <div className="mb-6 border border-[#b46a58] bg-[#f7ebe7] px-4 py-3 text-sm text-[#8c3b24]">
                {error}
              </div>
            )}

            <div className="border border-[#d8d2c8] bg-[#fbf9f5] p-6">
              <h2 className="font-editorial text-3xl">
                Contact information
              </h2>

              <div className="mt-6">
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 border border-[#d8d2c8] bg-[#fbf9f5] p-6">
              <h2 className="font-editorial text-3xl">
                Shipping address
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="First name">
                  <input
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Last name">
                  <input
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Address">
                  <input
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    className={inputClass}
                    placeholder="Street and house number"
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Postal code">
                  <input
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="City">
                  <input
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Country">
                  <select
                    value={country}
                    onChange={(event) =>
                      setCountry(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option>Germany</option>
                    <option>Austria</option>
                    <option>Switzerland</option>
                    <option>Netherlands</option>
                    <option>Belgium</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="mt-6 border border-[#d8d2c8] bg-[#fbf9f5] p-6">
              <h2 className="font-editorial text-3xl">
                Payment
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#69655e]">
                Demo checkout — no real payment will be charged.
              </p>
            </div>
          </section>

          <aside>
            <div className="border border-[#d8d2c8] bg-[#fbf9f5] p-6 lg:sticky lg:top-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#69655e]">
                Order summary
              </p>

              <div className="mt-6 space-y-5">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden border border-[#d8d2c8] bg-white">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[#8d887f]">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#777168]">
                        Qty {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm font-medium">
                      €
                      {(
                        (item.priceCents *
                          item.quantity) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#d8d2c8] pt-5">
                <span>Subtotal</span>
                <strong>€{subtotal}</strong>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-[#69655e]">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#d8d2c8] pt-5 text-lg">
                <span className="font-semibold">
                  Total
                </span>

                <strong>
                  €{subtotal}
                </strong>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full border border-[#1c1c18] bg-[#1c1c18] px-5 py-4 text-sm font-medium text-white transition hover:bg-[#8c3b24] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Placing order...'
                  : 'Place order'}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#777168]">
                Demo checkout only. No payment is processed.
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  )
}

type FieldProps = {
  label: string
  children: React.ReactNode
}

function Field({
  label,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#69655e]">
        {label}
      </span>

      {children}
    </label>
  )
}

const inputClass =
  'w-full border border-[#cfc8bc] bg-white px-4 py-3 outline-none transition focus:border-[#1c1c18]'