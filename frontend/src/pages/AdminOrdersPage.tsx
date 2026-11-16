import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  getAdminOrders,
  type AdminOrder,
  type OrderStatus,
} from '../api/admin-orders'

import {
  OrderStatusBadge,
} from '../components/OrderStatusBadge'

type StatusFilter =
  | 'all'
  | OrderStatus

const filters: StatusFilter[] = [
  'all',
  'confirmed',
  'processing',
  'shipped',
  'cancelled',
]

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

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    'all',
  )

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

  const filteredOrders =
    useMemo(() => {
      if (
        statusFilter ===
        'all'
      ) {
        return orders
      }

      return orders.filter(
        (order) =>
          order.status ===
          statusFilter,
      )
    }, [
      orders,
      statusFilter,
    ])

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
        <div className="flex flex-col gap-6 border-b border-[#d8d2c8] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-editorial text-4xl">
              Customer orders
            </h2>

            <p className="mt-2 text-sm text-[#69655e]">
              Review purchases, shipping details and order progress.
            </p>
          </div>

          <p className="text-sm text-[#69655e]">
            {filteredOrders.length}{' '}
            {filteredOrders.length === 1
              ? 'order'
              : 'orders'}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map(
            (filter) => {
              const active =
                statusFilter ===
                filter

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      filter,
                    )
                  }
                  className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                    active
                      ? 'border-[#1c1c18] bg-[#1c1c18] text-white'
                      : 'border-[#cfc8bc] bg-[#fbf9f5] text-[#69655e] hover:border-[#1c1c18]'
                  }`}
                >
                  {filter}
                </button>
              )
            },
          )}
        </div>

        {loading && (
          <p className="mt-10 text-[#69655e]">
            Loading orders...
          </p>
        )}

        {error && (
          <div className="mt-10 border border-[#b46a58] bg-[#f7ebe7] p-4 text-sm text-[#8c3b24]">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredOrders.length ===
            0 && (
            <div className="mt-10 border border-[#d8d2c8] bg-[#fbf9f5] p-10 text-center">
              <h2 className="font-editorial text-3xl">
                No orders found.
              </h2>

              <p className="mt-2 text-sm text-[#69655e]">
                There are no orders with this status.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredOrders.length >
            0 && (
            <div className="mt-8 overflow-x-auto border border-[#d8d2c8] bg-[#fbf9f5]">
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
                  {filteredOrders.map(
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
                          <OrderStatusBadge
                            status={
                              order.status
                            }
                          />
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