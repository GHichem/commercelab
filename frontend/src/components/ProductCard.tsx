import { Link } from 'react-router-dom'

import type { Product } from '../api/products'

type ProductCardProps = {
  product: Product
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const price = (
    product.priceCents / 100
  ).toFixed(2)

  const isOutOfStock =
    product.stockQuantity === 0

  const mainImage =
    product.images[0]?.url ??
    product.imageUrl

  return (
    <article className="group border border-[#d8d2c8] bg-[#fbf9f5]">
      <Link
        to={`/products/${product.slug}`}
        className="block aspect-square overflow-hidden border-b border-[#d8d2c8] bg-[#ebe6dc]"
      >
        {mainImage ? (
          <img
            src={mainImage}
            alt={
              product.images[0]
                ?.altText ??
              product.name
            }
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8d887f]">
            Product image
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <Link
            to={`/products/${product.slug}`}
            className="font-editorial text-2xl leading-tight transition hover:text-[#8c3b24]"
          >
            {product.name}
          </Link>

          <span className="shrink-0 text-base font-semibold">
            €{price}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-[#69655e]">
          {product.description ??
            'No description available'}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#e3ded5] pt-3">
          <span
            className={
              isOutOfStock
                ? 'text-xs font-medium uppercase tracking-[0.16em] text-[#9b3e2f]'
                : 'text-xs font-medium uppercase tracking-[0.16em] text-[#6b7464]'
            }
          >
            {isOutOfStock
              ? 'Out of stock'
              : `${product.stockQuantity} available`}
          </span>

          <Link
            to={`/products/${product.slug}`}
            className="border-b border-[#1c1c18] pb-0.5 text-sm font-medium transition hover:text-[#8c3b24]"
          >
            View product
          </Link>
        </div>
      </div>
    </article>
  )
}