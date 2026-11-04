import type {
  Product,
  ProductImage,
} from './products'

const apiUrl =
  import.meta.env.VITE_API_URL

export type ProductInput = {
  name: string
  slug: string
  description: string
  priceCents: number
  stockQuantity: number
  isActive: boolean
}

type UploadImagesResponse = {
  message: string
  images: ProductImage[]
}

async function adminFetch(
  path: string,
  options: RequestInit = {},
) {
  return fetch(
    `${apiUrl}${path}`,
    {
      ...options,
      credentials:
        'include',
    },
  )
}

export async function getAdminProducts(): Promise<Product[]> {
  const response =
    await adminFetch(
      '/admin/products',
    )

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Unauthorized'
        : 'Failed to fetch admin products',
    )
  }

  return response.json()
}

export async function getAdminProduct(
  id: number,
): Promise<Product> {
  const response =
    await adminFetch(
      `/admin/products/${id}`,
    )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch product',
    )
  }

  return response.json()
}

export async function createProduct(
  input: ProductInput,
): Promise<Product> {
  const response =
    await adminFetch(
      '/admin/products',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(
            input,
          ),
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to create product',
    )
  }

  return response.json()
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product> {
  const response =
    await adminFetch(
      `/admin/products/${id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(
            input,
          ),
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to update product',
    )
  }

  return response.json()
}

export async function reorderProducts(
  productIds: number[],
) {
  const response =
    await adminFetch(
      '/admin/products/order',
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            productIds,
          }),
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to reorder products',
    )
  }
}

export async function uploadProductImages(
  productId: number,
  files: File[],
): Promise<UploadImagesResponse | null> {
  if (
    files.length === 0
  ) {
    return null
  }

  const formData =
    new FormData()

  files.forEach(
    (file) => {
      formData.append(
        'images',
        file,
      )
    },
  )

  const response =
    await adminFetch(
      `/admin/products/${productId}/images`,
      {
        method: 'POST',
        body: formData,
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to upload product images',
    )
  }

  return response.json()
}

export async function reorderProductImages(
  productId: number,
  imageIds: number[],
) {
  const response =
    await adminFetch(
      `/admin/products/${productId}/images/order`,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            imageIds,
          }),
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to reorder images',
    )
  }
}

export async function deleteProductImage(
  productId: number,
  imageId: number,
) {
  const response =
    await adminFetch(
      `/admin/products/${productId}/images/${imageId}`,
      {
        method:
          'DELETE',
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to delete image',
    )
  }
}

export async function deleteLegacyProductImage(
  productId: number,
) {
  const response =
    await adminFetch(
      `/admin/products/${productId}/legacy-image`,
      {
        method:
          'DELETE',
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to delete legacy image',
    )
  }
}

export async function deleteProduct(
  productId: number,
) {
  const response =
    await adminFetch(
      `/admin/products/${productId}`,
      {
        method:
          'DELETE',
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Failed to delete product',
    )
  }
}