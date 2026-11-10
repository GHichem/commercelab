import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  getAdminOrders,
  type AdminOrder,
} from '../api/admin-orders'

export function AdminOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<
    AdminOrder[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        setError(null)

        const data =
          await getAdminOrders()

        setOrders(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not load orders.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <header className="border-b border-[#d8d2c8] bg-[#fbf9f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3b24]">
              CommerceLab Admin
            </p>

            <h1 className="font-editorial mt-1 text-3xl">
              Orders
            </h1>
          </div>

          <nav className="flex items-center gap-5 text-sm">
            <Link
              to="/admin/products"
              className="text-[#69655e] transition hover:text-[#1c1c18]"
            >
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="font-semibold text-[#1c1c18]"
            >
              Orders
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-[#69655e]">
            Review customer orders and purchased items.
          </p>
        </div>

        {loading && (
          <p className="text-[#69655e]">
            Loading orders...
          </p>
        )}

        {error && (
          <div className="border border-[#b46a58] bg-[#f7ebe7] p-4 text-sm text-[#8c3b24]">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          orders.length ===
            0 && (
            <div className="border border-[#d8d2c8] bg-[#fbf9f5] p-10 text-center">
              <h2 className="font-editorial text-3xl">
                No orders yet.
              </h2>

              <p className="mt-2 text-sm text-[#69655e]">
                New checkout orders will appear here.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length >
            0 && (
            <div className="overflow-x-auto border border-[#d8d2c8] bg-[#fbf9f5]">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[#d8d2c8] bg-[#f1ede5]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Order
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Items
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Total
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody>
                  {orders.map(
                    (order) => (
                      <tr
                        key={
                          order.id
                        }
                        className="border-b border-[#e3ded5] last:border-b-0"
                      >
                        <td className="px-5 py-4 font-medium">
                          {
                            order.orderNumber
                          }
                        </td>

                        <td className="px-5 py-4">
                          <div>
                            <p>
                              {
                                order.firstName
                              }{' '}
                              {
                                order.lastName
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#777168]">
                              {
                                order.email
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {
                            order.itemCount
                          }
                        </td>

                        <td className="px-5 py-4 font-medium">
                          €
                          {(
                            order.totalCents /
                            100
                          ).toFixed(
                            2,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="border border-[#cfc8bc] bg-white px-3 py-1 text-xs uppercase tracking-[0.1em]">
                            {
                              order.status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[#69655e]">
                          {new Date(
                            order.createdAt,
                          ).toLocaleString()}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="text-[#8c3b24] underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
      </main>
    </div>
  )
}