import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  deleteProduct,
  getAdminProducts,
  reorderProducts,
} from '../api/admin-products'
import type { Product } from '../api/products'

export function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSavingOrder, setIsSavingOrder] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    async function loadProducts() {
      try {
        const data =
          await getAdminProducts()

        const sorted = [...data].sort(
          (a, b) =>
            a.displayOrder -
              b.displayOrder ||
            a.id - b.id,
        )

        setProducts(sorted)
      } catch {
        setError(
          'Could not load admin products.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  async function handleDragEnd(
    event: DragEndEvent,
  ) {
    const {
      active,
      over,
    } = event

    if (
      !over ||
      active.id === over.id
    ) {
      return
    }

    const oldIndex =
      products.findIndex(
        (product) =>
          product.id === active.id,
      )

    const newIndex =
      products.findIndex(
        (product) =>
          product.id === over.id,
      )

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return
    }

    const reordered =
      arrayMove(
        products,
        oldIndex,
        newIndex,
      ).map(
        (product, index) => ({
          ...product,
          displayOrder: index,
        }),
      )

    setProducts(reordered)

    setIsSavingOrder(true)
    setError(null)

    try {
      await reorderProducts(
        reordered.map(
          (product) => product.id,
        ),
      )
    } catch {
      setError(
        'Could not save product order.',
      )

      const refreshed =
        await getAdminProducts()

      setProducts(
        [...refreshed].sort(
          (a, b) =>
            a.displayOrder -
              b.displayOrder ||
            a.id - b.id,
        ),
      )
    } finally {
      setIsSavingOrder(false)
    }
  }

  async function handleDeleteProduct(
    productId: number,
  ) {
    const confirmed =
      window.confirm(
        'Are you sure you want to permanently delete this product?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteProduct(
        productId,
      )

      const remainingProducts =
        products.filter(
          (product) =>
            product.id !==
            productId,
        )

      setProducts(
        remainingProducts,
      )

      await reorderProducts(
        remainingProducts.map(
          (product) =>
            product.id,
        ),
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not delete product.',
      )
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-6 py-10">
        Loading products...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-10 text-[#1c1c18]">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between border-b border-[#cfc8bc] pb-6">
          <div>
            <Link
              to="/"
              className="text-xs text-[#69655e]"
            >
              ← Storefront
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
              CommerceLab Admin
            </p>

            <h1 className="font-editorial mt-3 text-5xl">
              Products
            </h1>

            <p className="mt-2 text-sm text-[#69655e]">
              Drag products to control storefront order.
            </p>

            {isSavingOrder && (
              <p className="mt-2 text-xs text-[#8c3b24]">
                Saving order...
              </p>
            )}
          </div>

          <Link
            to="/admin/products/new"
            className="border border-[#1c1c18] px-4 py-2 text-sm font-medium transition hover:bg-[#1c1c18] hover:text-white"
          >
            Add product
          </Link>
        </div>

        {error && (
          <div className="mt-6 border border-[#b46a58] bg-[#f7ebe7] px-4 py-3 text-sm text-[#8c3b24]">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-x-auto border border-[#d8d2c8] bg-[#fbf9f5]">
          <div className="grid min-w-[900px] grid-cols-[60px_1fr_120px_100px_120px_100px_160px] border-b border-[#d8d2c8] text-xs uppercase tracking-[0.14em] text-[#69655e]">
            <div className="px-4 py-4">
              Order
            </div>

            <div className="px-4 py-4">
              Product
            </div>

            <div className="px-4 py-4">
              Price
            </div>

            <div className="px-4 py-4">
              Stock
            </div>

            <div className="px-4 py-4">
              Status
            </div>

            <div className="px-4 py-4">
              Images
            </div>

            <div className="px-4 py-4">
              Actions
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={
              closestCenter
            }
            onDragEnd={
              handleDragEnd
            }
          >
            <SortableContext
              items={products.map(
                (product) =>
                  product.id,
              )}
              strategy={
                verticalListSortingStrategy
              }
            >
              {products.map(
                (
                  product,
                  index,
                ) => (
                  <SortableProductRow
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                    index={
                      index
                    }
                    onDelete={() =>
                      handleDeleteProduct(
                        product.id,
                      )
                    }
                  />
                ),
              )}
            </SortableContext>
          </DndContext>
        </div>
      </section>
    </main>
  )
}

type SortableProductRowProps = {
  product: Product
  index: number
  onDelete: () => void
}

function SortableProductRow({
  product,
  index,
  onDelete,
}: SortableProductRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
  })

  const style = {
    transform:
      CSS.Transform.toString(
        transform,
      ),
    transition,
    opacity:
      isDragging
        ? 0.5
        : 1,
    zIndex:
      isDragging
        ? 10
        : undefined,
  }

  const mainImage =
    product.images[0]?.url ??
    product.imageUrl

  const price =
    (
      product.priceCents /
      100
    ).toFixed(2)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid min-w-[900px] grid-cols-[60px_1fr_120px_100px_120px_100px_160px] items-center border-b border-[#e6e0d7] bg-[#fbf9f5] last:border-b-0"
    >
      <div className="px-4 py-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Move ${product.name}`}
          className="cursor-grab touch-none text-lg text-[#777168] active:cursor-grabbing"
          title="Drag to reorder"
        >
          ☰
        </button>

        <span className="ml-2 text-xs text-[#9a948a]">
          {index + 1}
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[#d8d2c8] bg-white">
            {mainImage ? (
              <img
                src={mainImage}
                alt={
                  product.name
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-[#8d887f]">
                No image
              </span>
            )}
          </div>

          <div>
            <p className="font-editorial text-xl">
              {product.name}
            </p>

            <p className="mt-1 text-xs text-[#777168]">
              {product.slug}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 text-sm">
        €{price}
      </div>

      <div className="px-4 py-4 text-sm">
        {product.stockQuantity}
      </div>

      <div className="px-4 py-4">
        <span
          className={
            product.isActive
              ? 'text-xs font-semibold uppercase tracking-[0.12em] text-[#66725f]'
              : 'text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3e2f]'
          }
        >
          {product.isActive
            ? 'Active'
            : 'Inactive'}
        </span>
      </div>

      <div className="px-4 py-4 text-sm">
        {product.images.length +
          (product.imageUrl
            ? 1
            : 0)}
      </div>

      <div className="flex gap-4 px-4 py-4">
        <Link
          to={`/admin/products/${product.id}/edit`}
          className="border-b border-[#1c1c18] pb-0.5 text-sm"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={
            onDelete
          }
          className="border-b border-[#9b3e2f] pb-0.5 text-sm text-[#9b3e2f]"
        >
          Delete
        </button>
      </div>
    </div>
  )
}