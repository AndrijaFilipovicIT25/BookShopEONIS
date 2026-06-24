import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute, AdminRoute } from './routes/Guards'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'

// Public
import Home from './pages/Home'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Collection from './pages/Collection'
import Author from './pages/Author'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Customer
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import Orders from './pages/customer/Orders'
import OrderDetail from './pages/customer/OrderDetail'
import Profile from './pages/customer/Profile'

// Admin
import Dashboard from './pages/admin/Dashboard'
import AdminBooks from './pages/admin/AdminBooks'
import AdminBookForm from './pages/admin/AdminBookForm'
import AdminCategories from './pages/admin/AdminCategories'
import AdminAuthors from './pages/admin/AdminAuthors'
import AdminCollections from './pages/admin/AdminCollections'
import AdminOrders from './pages/admin/AdminOrders'

function AdminPage({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/collections/:id" element={<Collection />} />
              <Route path="/authors/:id" element={<Author />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<AdminPage><Dashboard /></AdminPage>} />
              <Route path="/admin/books" element={<AdminPage><AdminBooks /></AdminPage>} />
              <Route path="/admin/books/new" element={<AdminPage><AdminBookForm /></AdminPage>} />
              <Route path="/admin/books/:id/edit" element={<AdminPage><AdminBookForm /></AdminPage>} />
              <Route path="/admin/categories" element={<AdminPage><AdminCategories /></AdminPage>} />
              <Route path="/admin/authors" element={<AdminPage><AdminAuthors /></AdminPage>} />
              <Route path="/admin/collections" element={<AdminPage><AdminCollections /></AdminPage>} />
              <Route path="/admin/orders" element={<AdminPage><AdminOrders /></AdminPage>} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
