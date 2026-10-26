import type { Product } from '../api/products'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = (product.priceCents / 100).toFixed(2)

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex h-44 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span>No image</span>
        )}
      </div>

      <h2 className="text-xl font-semibold text-white">
        {product.name}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        {product.description ?? 'No description available'}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-lg font-bold text-emerald-400">
          €{price}
        </span>

        <span className="text-sm text-slate-400">
          Stock: {product.stockQuantity}
        </span>
      </div>
    </article>
  )
}