import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { Product } from '../api/products'

export type CartItem = {
  productId: number
  name: string
  slug: string
  priceCents: number
  imageUrl: string | null
  quantity: number
  stockQuantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalQuantity: number
  subtotalCents: number

  addToCart: (
    product: Product,
    quantity: number,
  ) => void

  updateQuantity: (
    productId: number,
    quantity: number,
  ) => void

  removeFromCart: (
    productId: number,
  ) => void

  clearCart: () => void
}

const CartContext =
  createContext<CartContextValue | null>(null)

const STORAGE_KEY =
  'commercelab-cart'

export function CartProvider({
  children,
}: {
  children: ReactNode
}) {
  const [items, setItems] =
    useState<CartItem[]>(() => {
      try {
        const stored =
          localStorage.getItem(
            STORAGE_KEY,
          )

        if (!stored) {
          return []
        }

        return JSON.parse(
          stored,
        ) as CartItem[]
      } catch {
        return []
      }
    })

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    )
  }, [items])

  const totalQuantity =
    useMemo(
      () =>
        items.reduce(
          (total, item) =>
            total +
            item.quantity,
          0,
        ),
      [items],
    )

  const subtotalCents =
    useMemo(
      () =>
        items.reduce(
          (total, item) =>
            total +
            item.priceCents *
              item.quantity,
          0,
        ),
      [items],
    )

  function addToCart(
    product: Product,
    quantity: number,
  ) {
    const mainImage =
      product.images[0]?.url ??
      product.imageUrl

    setItems((current) => {
      const existing =
        current.find(
          (item) =>
            item.productId ===
            product.id,
        )

      if (existing) {
        return current.map(
          (item) => {
            if (
              item.productId !==
              product.id
            ) {
              return item
            }

            return {
              ...item,

              quantity:
                Math.min(
                  item.quantity +
                    quantity,
                  product.stockQuantity,
                ),

              stockQuantity:
                product.stockQuantity,

              priceCents:
                product.priceCents,

              imageUrl:
                mainImage,
            }
          },
        )
      }

      return [
        ...current,
        {
          productId:
            product.id,

          name:
            product.name,

          slug:
            product.slug,

          priceCents:
            product.priceCents,

          imageUrl:
            mainImage,

          quantity:
            Math.min(
              quantity,
              product.stockQuantity,
            ),

          stockQuantity:
            product.stockQuantity,
        },
      ]
    })
  }

  function updateQuantity(
    productId: number,
    quantity: number,
  ) {
    setItems((current) =>
      current.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item
        }

        return {
          ...item,

          quantity:
            Math.max(
              1,
              Math.min(
                quantity,
                item.stockQuantity,
              ),
            ),
        }
      }),
    )
  }

  function removeFromCart(
    productId: number,
  ) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.productId !==
          productId,
      ),
    )
  }

  function clearCart() {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        subtotalCents,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context =
    useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider',
    )
  }

  return context
}