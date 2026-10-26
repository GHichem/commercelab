export type Product = {
  id: number
  name: string
  slug: string
  description: string | null
  priceCents: number
  stockQuantity: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getProducts(): Promise<Product[]> {
  const apiUrl = import.meta.env.VITE_API_URL

  const response = await fetch(`${apiUrl}/products`)

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  return response.json()
}