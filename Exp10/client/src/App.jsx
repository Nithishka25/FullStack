import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Restaurant from './pages/Restaurant.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Profile from './pages/Profile.jsx'

function Private({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <nav className="flex items-center justify-between bg-gray-800/95 backdrop-blur-lg px-6 py-5 shadow-xl border-b border-gray-700 rounded-b-2xl">
        <div className="flex items-center gap-8">
          <Link className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transform" to="/">
            🍕 Foodie
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <Link className="btn-secondary flex items-center gap-2 text-sm" to="/">
                <span>🏠</span> Home
              </Link>
              <Link className="btn-secondary flex items-center gap-2 text-sm" to="/orders">
                <span>📦</span> My Orders
              </Link>
              <Link className="btn-secondary flex items-center gap-2 text-sm" to="/profile">
                <span>👤</span> Profile
              </Link>
              {user?.role === 'restaurant' && (
                <Link className="btn-secondary flex items-center gap-2 text-sm" to="/dashboard">
                  <span>📊</span> Dashboard
                </Link>
              )}
              <Link className="btn-secondary flex items-center gap-2 text-sm" to="/cart">
                <span>🛒</span> Cart
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-medium text-gray-300 bg-gray-700 px-3 py-1 rounded-full">
                👋 {user.name}
              </span>
              <button onClick={logout} className="btn-primary text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link className="btn-secondary text-sm" to="/login">Login</Link>
              <Link className="btn-primary text-sm" to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Private role="user"><Orders /></Private>} />
          <Route path="/profile" element={<Private><Profile /></Private>} />
          <Route path="/dashboard" element={<Private role="restaurant"><Dashboard /></Private>} />
        </Routes>
      </main>
      <footer className="mt-auto bg-gray-900 text-gray-400 py-6 rounded-t-2xl">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm">&copy; 2023 Foodie Delivery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
