import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'
import { CartProvider } from './context/CartContext'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminProductFormPage } from './pages/AdminProductFormPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { CartPage } from './pages/CartPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { StorefrontPage } from './pages/StorefrontPage'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<StorefrontPage />}
          />

          <Route
            path="/products/:slug"
            element={<ProductDetailPage />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />

          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />

          <Route
            element={<ProtectedAdminRoute />}
          >
            <Route
              path="/admin"
              element={
                <Navigate
                  to="/admin/products"
                  replace
                />
              }
            />

            <Route
              path="/admin/products"
              element={<AdminProductsPage />}
            />

            <Route
              path="/admin/products/new"
              element={<AdminProductFormPage />}
            />

            <Route
              path="/admin/products/:id/edit"
              element={<AdminProductFormPage />}
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App