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

  // Temporary legacy field.
  imageUrl: string | null

  isActive: boolean
  displayOrder: number

  images: ProductImage[]

  createdAt: string
  updatedAt: string
}

const apiUrl =
  import.meta.env.VITE_API_URL

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(
    `${apiUrl}/products`,
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch products',
    )
  }

  return response.json()
}

export async function getProductBySlug(
  slug: string,
): Promise<Product> {
  const response = await fetch(
    `${apiUrl}/products/${encodeURIComponent(slug)}`,
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        'Product not found',
      )
    }

    throw new Error(
      'Failed to fetch product',
    )
  }

  return response.json()
}