export type ProductImage = {
  id: number
  productId: number
  storagePath: string
  altText: string | null
  position: number
  createdAt: string
  url: string
}

export type Product = {
  id: number
  name: string
  slug: string
  description: string | null
  priceCents: number
  stockQuantity: number

  // Temporary until all old manual image URLs are removed.
  imageUrl: string | null

  isActive: boolean
  displayOrder: number

  images: ProductImage[]

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