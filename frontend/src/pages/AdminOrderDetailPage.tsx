import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getAdminOrder,
  type AdminOrderDetail,
  type OrderStatus,
  updateAdminOrderStatus,
} from '../api/admin-orders'

const statuses: OrderStatus[] = [
  'confirmed',
  'processing',
  'shipped',
  'cancelled',
]

export function AdminOrderDetailPage() {
  const { id } =
    useParams<{
      id: string
    }>()

  const [
    order,
    setOrder,
  ] = useState<
    AdminOrderDetail | null
  >(null)

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<OrderStatus>(
    'confirmed',
  )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    savingStatus,
    setSavingStatus,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)

  const [
    statusMessage,
    setStatusMessage,
  ] = useState<
    string | null
  >(null)

  useEffect(() => {
    async function loadOrder() {
      const orderId =
        Number(id)

      if (
        !Number.isInteger(
          orderId,
        ) ||
        orderId <= 0
      ) {
        setError(
          'Invalid order.',
        )

        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError(null)

        const data =
          await getAdminOrder(
            orderId,
          )

        setOrder(data)
        setSelectedStatus(
          data.status,
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not load order.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  async function handleSaveStatus() {
    if (!order) {
      return
    }

    if (
      selectedStatus ===
      order.status
    ) {
      return
    }

    try {
      setSavingStatus(true)
      setError(null)
      setStatusMessage(null)

      const result =
        await updateAdminOrderStatus(
          order.id,
          selectedStatus,
        )

      setOrder({
        ...order,
        status:
          result.status,
      })

      setStatusMessage(
        'Order status updated.',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not update order status.',
      )
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1c1c18]">
      <header className="border-b border-[#d8d2c8] bg-[#fbf9f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c3b24]">
              CommerceLab Admin
            </p>

            <h1 className="font-editorial mt-1 text-3xl">
              Order details
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
              className="font-semibold"
            >
              Orders
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/admin/orders"
          className="text-sm text-[#69655e] transition hover:text-[#8c3b24]"
        >
          ← Back to orders
        </Link>

        {loading && (
          <p className="mt-8 text-[#69655e]">
            Loading order...
          </p>
        )}

        {error && (
          <div className="mt-8 border border-[#b46a58] bg-[#f7ebe7] p-4 text-sm text-[#8c3b24]">
            {error}
          </div>
        )}

        {!loading &&
          order && (
            <>
              <section className="mt-8 border border-[#d8d2c8] bg-[#fbf9f5] p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#777168]">
                      Order
                    </p>

                    <h2 className="font-editorial mt-2 text-4xl">
                      {
                        order.orderNumber
                      }
                    </h2>

                    <p className="mt-3 text-sm text-[#69655e]">
                      {new Date(
                        order.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="w-full max-w-sm border border-[#d8d2c8] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777168]">
                      Order status
                    </p>

                    <div className="mt-3 flex gap-3">
                      <select
                        value={
                          selectedStatus
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedStatus(
                            event
                              .target
                              .value as OrderStatus,
                          )
                        }
                        disabled={
                          savingStatus
                        }
                        className="min-w-0 flex-1 border border-[#cfc8bc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1c1c18]"
                      >
                        {statuses.map(
                          (
                            status,
                          ) => (
                            <option
                              key={
                                status
                              }
                              value={
                                status
                              }
                            >
                              {formatStatus(
                                status,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={
                          handleSaveStatus
                        }
                        disabled={
                          savingStatus ||
                          selectedStatus ===
                            order.status
                        }
                        className="border border-[#1c1c18] bg-[#1c1c18] px-4 py-2 text-sm text-white transition hover:bg-[#8c3b24] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {savingStatus
                          ? 'Saving...'
                          : 'Save'}
                      </button>
                    </div>

                    {statusMessage && (
                      <p className="mt-3 text-sm text-[#4f6a3f]">
                        {
                          statusMessage
                        }
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <section className="border border-[#d8d2c8] bg-[#fbf9f5] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777168]">
                    Customer
                  </p>

                  <p className="mt-4 font-medium">
                    {
                      order.firstName
                    }{' '}
                    {
                      order.lastName
                    }
                  </p>

                  <p className="mt-2 text-sm text-[#69655e]">
                    {
                      order.email
                    }
                  </p>
                </section>

                <section className="border border-[#d8d2c8] bg-[#fbf9f5] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777168]">
                    Shipping address
                  </p>

                  <div className="mt-4 text-sm leading-7">
                    <p>
                      {
                        order.address
                      }
                    </p>

                    <p>
                      {
                        order.postalCode
                      }{' '}
                      {
                        order.city
                      }
                    </p>

                    <p>
                      {
                        order.country
                      }
                    </p>
                  </div>
                </section>
              </div>

              <section className="mt-6 border border-[#d8d2c8] bg-[#fbf9f5]">
                <div className="border-b border-[#d8d2c8] p-6">
                  <h2 className="font-editorial text-3xl">
                    Items
                  </h2>
                </div>

                {order.items.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="grid gap-4 border-b border-[#e3ded5] p-6 last:border-b-0 sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-medium">
                          {
                            item.productName
                          }
                        </p>

                        <p className="mt-1 text-sm text-[#69655e]">
                          €
                          {(
                            item.unitPriceCents /
                            100
                          ).toFixed(
                            2,
                          )}{' '}
                          ×{' '}
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      <p className="font-semibold">
                        €
                        {(
                          item.lineTotalCents /
                          100
                        ).toFixed(
                          2,
                        )}
                      </p>
                    </div>
                  ),
                )}
              </section>

              <section className="mt-6 ml-auto max-w-md border border-[#d8d2c8] bg-[#fbf9f5] p-6">
                <div className="flex items-center justify-between">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    €
                    {(
                      order.subtotalCents /
                      100
                    ).toFixed(
                      2,
                    )}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#d8d2c8] pt-4 text-lg font-semibold">
                  <span>
                    Total
                  </span>

                  <span>
                    €
                    {(
                      order.totalCents /
                      100
                    ).toFixed(
                      2,
                    )}
                  </span>
                </div>
              </section>
            </>
          )}
      </main>
    </div>
  )
}

function formatStatus(
  status: OrderStatus,
) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  )
}