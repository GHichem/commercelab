import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  createProduct,
  deleteLegacyProductImage,
  deleteProductImage,
  getAdminProduct,
  reorderProductImages,
  updateProduct,
  uploadProductImages,
} from '../api/admin-products'

const MAX_IMAGES = 6

type SavedImageItem = {
  key: string
  kind: 'saved'
  id: number
  url: string
  altText: string | null
}

type NewImageItem = {
  key: string
  kind: 'new'
  file: File
  url: string
}

type ImageItem =
  | SavedImageItem
  | NewImageItem

export function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const productId = id ? Number(id) : null
  const isEditing = productId !== null

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const [legacyImageUrl, setLegacyImageUrl] =
    useState<string | null>(null)

  const [imageItems, setImageItems] =
    useState<ImageItem[]>([])

  const [isLoading, setIsLoading] =
    useState(isEditing)

  const [isSaving, setIsSaving] =
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
    if (productId === null) {
      return
    }

    const currentProductId = productId

    async function loadProduct() {
      try {
        const product =
          await getAdminProduct(
            currentProductId,
          )

        setName(product.name)
        setSlug(product.slug)

        setDescription(
          product.description ?? '',
        )

        setPrice(
          (
            product.priceCents / 100
          ).toFixed(2),
        )

        setStock(
          String(
            product.stockQuantity,
          ),
        )

        setIsActive(
          product.isActive,
        )

        setLegacyImageUrl(
          product.imageUrl,
        )

        setImageItems(
          product.images.map(
            (image) => ({
              key: `saved-${image.id}`,
              kind: 'saved' as const,
              id: image.id,
              url: image.url,
              altText: image.altText,
            }),
          ),
        )
      } catch {
        setError(
          'Could not load product.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  function handleNameChange(
    value: string,
  ) {
    setName(value)

    if (!isEditing) {
      setSlug(
        createSlug(value),
      )
    }
  }

  function addFiles(
    files: File[],
  ) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    const validFiles =
      files.filter((file) =>
        allowedMimeTypes.includes(
          file.type,
        ),
      )

    setImageItems(
      (current) => {
        const currentCount =
          current.length +
          (legacyImageUrl ? 1 : 0)

        const remainingSlots =
          MAX_IMAGES -
          currentCount

        if (
          remainingSlots <= 0
        ) {
          return current
        }

        const itemsToAdd =
          validFiles
            .slice(
              0,
              remainingSlots,
            )
            .map((file) => ({
              key: `new-${crypto.randomUUID()}`,
              kind: 'new' as const,
              file,
              url:
                URL.createObjectURL(
                  file,
                ),
            }))

        return [
          ...current,
          ...itemsToAdd,
        ]
      },
    )
  }

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    if (
      !event.target.files
    ) {
      return
    }

    addFiles(
      Array.from(
        event.target.files,
      ),
    )

    event.target.value = ''
  }

  function handleFileDrop(
    event:
      React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()

    addFiles(
      Array.from(
        event.dataTransfer.files,
      ),
    )
  }

  function handleSortEnd(
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

    setImageItems(
      (current) => {
        const oldIndex =
          current.findIndex(
            (item) =>
              item.key ===
              active.id,
          )

        const newIndex =
          current.findIndex(
            (item) =>
              item.key ===
              over.id,
          )

        if (
          oldIndex === -1 ||
          newIndex === -1
        ) {
          return current
        }

        return arrayMove(
          current,
          oldIndex,
          newIndex,
        )
      },
    )
  }

  function removeNewImage(
    imageKey: string,
  ) {
    setImageItems(
      (current) => {
        const item =
          current.find(
            (image) =>
              image.key ===
              imageKey,
          )

        if (
          item?.kind === 'new'
        ) {
          URL.revokeObjectURL(
            item.url,
          )
        }

        return current.filter(
          (image) =>
            image.key !==
            imageKey,
        )
      },
    )
  }

  async function handleDeleteExistingImage(
    item: SavedImageItem,
  ) {
    if (
      productId === null
    ) {
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to permanently remove this image?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteProductImage(
        productId,
        item.id,
      )

      setImageItems(
        (current) =>
          current.filter(
            (image) =>
              image.key !==
              item.key,
          ),
      )
    } catch {
      setError(
        'Could not remove image.',
      )
    }
  }

  async function handleDeleteLegacyImage() {
    if (
      productId === null ||
      !legacyImageUrl
    ) {
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to permanently remove this old product image?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteLegacyProductImage(
        productId,
      )

      setLegacyImageUrl(null)
    } catch {
      setError(
        'Could not remove old product image.',
      )
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)

    const priceNumber =
      Number(price)

    const stockNumber =
      Number(stock)

    if (!name.trim()) {
      setError(
        'Product name is required.',
      )
      return
    }

    if (!slug.trim()) {
      setError(
        'Slug is required.',
      )
      return
    }

    if (
      Number.isNaN(
        priceNumber,
      ) ||
      priceNumber < 0
    ) {
      setError(
        'Enter a valid price.',
      )
      return
    }

    if (
      !Number.isInteger(
        stockNumber,
      ) ||
      stockNumber < 0
    ) {
      setError(
        'Stock must be a whole number.',
      )
      return
    }

    const priceCents =
      Math.round(
        priceNumber * 100,
      )

    setIsSaving(true)

    try {
      const input = {
        name,
        slug,
        description,
        priceCents,
        stockQuantity:
          stockNumber,
        isActive,
      }

      let savedProductId:
        number

      if (
        productId !== null
      ) {
        const product =
          await updateProduct(
            productId,
            input,
          )

        savedProductId =
          product.id
      } else {
        const product =
          await createProduct(
            input,
          )

        savedProductId =
          product.id
      }

      const newItems =
        imageItems.filter(
          (
            item,
          ): item is NewImageItem =>
            item.kind ===
            'new',
        )

      const uploadResult =
        await uploadProductImages(
          savedProductId,
          newItems.map(
            (item) =>
              item.file,
          ),
        )

      const uploadedIdByKey =
        new Map<
          string,
          number
        >()

      if (uploadResult) {
        newItems.forEach(
          (
            item,
            index,
          ) => {
            const uploadedImage =
              uploadResult
                .images[index]

            if (
              uploadedImage
            ) {
              uploadedIdByKey.set(
                item.key,
                uploadedImage.id,
              )
            }
          },
        )
      }

      const orderedImageIds =
        imageItems
          .map((item) => {
            if (
              item.kind ===
              'saved'
            ) {
              return item.id
            }

            return (
              uploadedIdByKey.get(
                item.key,
              ) ?? null
            )
          })
          .filter(
            (
              imageId,
            ): imageId is number =>
              imageId !== null,
          )

      if (
        orderedImageIds.length >
        0
      ) {
        await reorderProductImages(
          savedProductId,
          orderedImageIds,
        )
      }

      imageItems.forEach(
        (item) => {
          if (
            item.kind === 'new'
          ) {
            URL.revokeObjectURL(
              item.url,
            )
          }
        },
      )

      navigate(
        '/admin/products',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not save product.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const totalImageCount =
    imageItems.length +
    (legacyImageUrl ? 1 : 0)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-6 py-10">
        Loading product...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-10 text-[#1c1c18]">
      <section className="mx-auto max-w-4xl">
        <Link
          to="/admin/products"
          className="text-sm text-[#69655e]"
        >
          ← Back to products
        </Link>

        <header className="mt-8 border-b border-[#cfc8bc] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
            CommerceLab Admin
          </p>

          <h1 className="font-editorial mt-3 text-5xl">
            {isEditing
              ? 'Edit product'
              : 'Add product'}
          </h1>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-10 space-y-10"
        >
          {error && (
            <div className="border border-[#b46a58] bg-[#f7ebe7] px-4 py-3 text-sm text-[#8c3b24]">
              {error}
            </div>
          )}

          <section className="grid gap-6 md:grid-cols-2">
            <Field label="Product name">
              <input
                value={name}
                onChange={(
                  event,
                ) =>
                  handleNameChange(
                    event.target.value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Slug">
              <input
                value={slug}
                onChange={(
                  event,
                ) =>
                  setSlug(
                    event.target.value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Price (€)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(
                  event,
                ) =>
                  setPrice(
                    event.target.value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Stock">
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(
                  event,
                ) =>
                  setStock(
                    event.target.value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>
          </section>

          <Field label="Description">
            <textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={5}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                isActive
              }
              onChange={(
                event,
              ) =>
                setIsActive(
                  event.target.checked,
                )
              }
              className="h-4 w-4 accent-[#8c3b24]"
            />

            <span className="text-sm">
              Product is active and visible in the shop
            </span>
          </label>

          <section>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#69655e]">
                  Product images
                </p>

                <p className="mt-2 text-sm text-[#777168]">
                  Drag images into the order you want. The first image becomes the main storefront image.
                </p>
              </div>

              <p className="text-xs text-[#777168]">
                {totalImageCount}
                {' / '}
                {MAX_IMAGES}
              </p>
            </div>

            <div
              onDragOver={(
                event,
              ) =>
                event.preventDefault()
              }
              onDrop={
                handleFileDrop
              }
              className="mt-4 border border-dashed border-[#aaa398] bg-[#fbf9f5] p-10 text-center"
            >
              <p className="font-editorial text-2xl">
                Drop product images here
              </p>

              <p className="mt-2 text-sm text-[#777168]">
                or choose files from your computer
              </p>

              <label className="mt-5 inline-block cursor-pointer border border-[#1c1c18] px-4 py-2 text-sm">
                Choose images

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />
              </label>
            </div>

            {totalImageCount >
              0 && (
              <div className="mt-5">
                {legacyImageUrl && (
                  <div className="mb-4 max-w-[220px] border border-[#d8d2c8] bg-[#fbf9f5]">
                    <div className="flex aspect-square items-center justify-center bg-white p-3">
                      <img
                        src={
                          legacyImageUrl
                        }
                        alt={name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs text-[#69655e]">
                        Old image
                      </span>

                      <button
                        type="button"
                        onClick={
                          handleDeleteLegacyImage
                        }
                        className="text-xs text-[#9b3e2f] underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {imageItems.length >
                  0 && (
                  <DndContext
                    sensors={
                      sensors
                    }
                    collisionDetection={
                      closestCenter
                    }
                    onDragEnd={
                      handleSortEnd
                    }
                  >
                    <SortableContext
                      items={imageItems.map(
                        (item) =>
                          item.key,
                      )}
                      strategy={
                        rectSortingStrategy
                      }
                    >
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {imageItems.map(
                          (
                            item,
                            index,
                          ) => (
                            <SortableImageCard
                              key={
                                item.key
                              }
                              item={
                                item
                              }
                              index={
                                index
                              }
                              name={
                                name
                              }
                              onRemove={() => {
                                if (
                                  item.kind ===
                                  'saved'
                                ) {
                                  handleDeleteExistingImage(
                                    item,
                                  )
                                } else {
                                  removeNewImage(
                                    item.key,
                                  )
                                }
                              }}
                            />
                          ),
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}
          </section>

          <div className="flex items-center justify-between border-t border-[#cfc8bc] pt-6">
            <Link
              to="/admin/products"
              className="text-sm text-[#69655e]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                isSaving
              }
              className="border border-[#1c1c18] bg-[#1c1c18] px-6 py-3 text-sm text-white disabled:opacity-50"
            >
              {isSaving
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create product'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

type SortableImageCardProps = {
  item: ImageItem
  index: number
  name: string
  onRemove: () => void
}

function SortableImageCard({
  item,
  index,
  name,
  onRemove,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.key,
  })

  const style = {
    transform:
      CSS.Transform.toString(
        transform,
      ),
    transition,
    opacity:
      isDragging
        ? 0.45
        : 1,
    zIndex:
      isDragging
        ? 10
        : undefined,
  }

  return (
    <div
      ref={
        setNodeRef
      }
      style={
        style
      }
      className="border border-[#d8d2c8] bg-[#fbf9f5]"
    >
      <div
        {...attributes}
        {...listeners}
        className="relative flex aspect-square cursor-grab touch-none items-center justify-center bg-white p-3 active:cursor-grabbing"
      >
        {index === 0 && (
          <span className="absolute left-2 top-2 z-10 bg-[#1c1c18] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            Main
          </span>
        )}

        <img
          src={item.url}
          alt={
            item.kind ===
            'saved'
              ? item.altText ??
                name
              : item.file.name
          }
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-xs text-[#69655e]">
          {index === 0
            ? 'Main image'
            : `Image ${index + 1}`}
        </span>

        <button
          type="button"
          onClick={
            onRemove
          }
          className="text-xs text-[#9b3e2f] underline"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

type FieldProps = {
  label: string
  children: ReactNode
}

function Field({
  label,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#69655e]">
        {label}
      </span>

      {children}
    </label>
  )
}

function createSlug(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
}

const inputClass =
  'w-full border border-[#cfc8bc] bg-[#fbf9f5] px-4 py-3 outline-none transition focus:border-[#1c1c18]'