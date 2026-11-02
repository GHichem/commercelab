export function Header() {
  return (
    <header className="border-b border-[#d8d2c8] bg-[#f7f4ee]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a
          href="/"
          className="font-editorial text-2xl font-semibold tracking-tight text-[#1c1c18]"
        >
          CommerceLab
        </a>

        <nav className="hidden items-center gap-8 text-sm text-[#1c1c18] md:flex">
          <a
            href="#products"
            className="transition-colors hover:text-[#8c3b24]"
          >
            Shop
          </a>

          <a
            href="#about"
            className="transition-colors hover:text-[#8c3b24]"
          >
            About
          </a>

          <button
            type="button"
            className="border-b border-[#1c1c18] pb-0.5 transition-colors hover:border-[#8c3b24] hover:text-[#8c3b24]"
          >
            Cart (0)
          </button>
        </nav>

        <button
          type="button"
          className="text-sm text-[#1c1c18] md:hidden"
          aria-label="Open navigation"
        >
          Menu
        </button>
      </div>
    </header>
  )
}