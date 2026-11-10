export type OrderStatus =
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'cancelled'

export type AdminOrder = {
  id: number
  orderNumber: string

  email: string
  firstName: string
  lastName: string

  address: string
  city: string
  postalCode: string
  country: string

  status: OrderStatus

  subtotalCents: number
  totalCents: number

  createdAt: string

  itemCount: number
}

export type AdminOrderItem = {
  id: number

  orderId: number

  productId:
    | number
    | null

  productName: string
  productSlug: string

  unitPriceCents: number
  quantity: number
  lineTotalCents: number
}

export type AdminOrderDetail =
  Omit<
    AdminOrder,
    'itemCount'
  > & {
    items:
      AdminOrderItem[]
  }

const apiUrl =
  import.meta.env.VITE_API_URL

export async function getAdminOrders(): Promise<
  AdminOrder[]
> {
  const response =
    await fetch(
      `${apiUrl}/admin/orders`,
      {
        credentials:
          'include',
      },
    )

  if (!response.ok) {
    throw new Error(
      'Could not load orders.',
    )
  }

  return response.json()
}

export async function getAdminOrder(
  id: number,
): Promise<AdminOrderDetail> {
  const response =
    await fetch(
      `${apiUrl}/admin/orders/${id}`,
      {
        credentials:
          'include',
      },
    )

  if (!response.ok) {
    throw new Error(
      'Could not load order.',
    )
  }

  return response.json()
}

export async function updateAdminOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<{
  id: number
  status: OrderStatus
}> {
  const response =
    await fetch(
      `${apiUrl}/admin/orders/${id}/status`,
      {
        method: 'PATCH',

        credentials:
          'include',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          status,
        }),
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(() => null)

    throw new Error(
      data?.message ??
        'Could not update order status.',
    )
  }

  return response.json()
}