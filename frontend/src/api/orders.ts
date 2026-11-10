export type CreateOrderInput = {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string

  items: Array<{
    productId: number
    quantity: number
  }>
}

export type CreateOrderResponse = {
  orderNumber: string
  orderId: number
  totalCents: number
}

const apiUrl =
  import.meta.env.VITE_API_URL

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  const response = await fetch(
    `${apiUrl}/orders`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null)

    throw new Error(
      data?.message ??
        'Could not place order.',
    )
  }

  return response.json()
}