import { Link } from 'react-router-dom'

import { useCart } from '../context/CartContext'

export function Header() {
  const {
    totalQuantity,
  } = useCart()

  return (
    <header className="border-b border-[#d8d2c8] bg-[#f7f4ee]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="font-editorial text-2xl font-semibold tracking-tight text-[#1c1c18]"
        >
          CommerceLab
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[#1c1c18] md:flex">
          <Link
            to="/#products"
            className="transition-colors hover:text-[#8c3b24]"
          >
            Shop
          </Link>

          <Link
            to="/#about"
            className="transition-colors hover:text-[#8c3b24]"
          >
            About
          </Link>

          <Link
            to="/cart"
            className="border-b border-[#1c1c18] pb-0.5 transition-colors hover:text-[#8c3b24]"
          >
            Cart ({totalQuantity})
          </Link>
        </nav>

        <Link
          to="/cart"
          className="text-sm md:hidden"
        >
          Cart ({totalQuantity})
        </Link>
      </div>
    </header>
  )
}