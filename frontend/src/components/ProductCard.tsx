import type { Product } from '../api/products'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = (product.priceCents / 100).toFixed(2)
  const isOutOfStock = product.stockQuantity === 0

  return (
    <article className="group border border-[#d8d2c8] bg-[#fbf9f5]">
      <div className="aspect-[4/3] overflow-hidden border-b border-[#d8d2c8] bg-[#ebe6dc]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8d887f]">
            Product image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-editorial text-2xl leading-tight">
            {product.name}
          </h2>

          <span className="shrink-0 text-base font-semibold">
            €{price}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-[#69655e]">
          {product.description ?? 'No description available'}
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

          <button
            disabled={isOutOfStock}
            className="border-b border-[#1c1c18] pb-0.5 text-sm font-medium transition hover:text-[#8c3b24] disabled:cursor-not-allowed disabled:border-[#aaa59d] disabled:text-[#aaa59d]"
          >
            View product
          </button>
        </div>
      </div>
    </article>
  )
}