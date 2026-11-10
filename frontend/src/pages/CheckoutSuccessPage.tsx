import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import { Header } from '../components/Header'

export function CheckoutSuccessPage() {
  const [searchParams] =
    useSearchParams()

  const orderNumber =
    searchParams.get('order') ??
    'CL-DEMO'

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
          CommerceLab
        </p>

        <h1 className="font-editorial mt-4 text-5xl sm:text-6xl">
          Order confirmed.
        </h1>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-[#69655e]">
          Your demo order has been created successfully.
          No real payment was processed.
        </p>

        <div className="mx-auto mt-10 max-w-md border border-[#d8d2c8] bg-[#fbf9f5] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[#777168]">
            Order number
          </p>

          <p className="font-editorial mt-2 text-3xl">
            {orderNumber}
          </p>
        </div>

        <Link
          to="/"
          className="mt-8 inline-block border border-[#1c1c18] bg-[#1c1c18] px-6 py-3 text-sm text-white transition hover:bg-[#8c3b24]"
        >
          Continue shopping
        </Link>
      </main>
    </div>
  )
}