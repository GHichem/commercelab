import type {
  OrderStatus,
} from '../api/admin-orders'

type Props = {
  status: OrderStatus
}

export function OrderStatusBadge({
  status,
}: Props) {
  const styles =
    getStatusStyles(status)

  return (
    <span
      className={`inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${styles}`}
    >
      {status}
    </span>
  )
}

function getStatusStyles(
  status: OrderStatus,
) {
  switch (status) {
    case 'confirmed':
      return 'border-[#cfc8bc] bg-white text-[#69655e]'

    case 'processing':
      return 'border-[#c6a66a] bg-[#fff8e8] text-[#7a5b20]'

    case 'shipped':
      return 'border-[#8fa28a] bg-[#edf4eb] text-[#4f6a3f]'

    case 'cancelled':
      return 'border-[#b46a58] bg-[#f7ebe7] text-[#8c3b24]'
  }
}