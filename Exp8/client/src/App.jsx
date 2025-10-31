import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import NewProduct from './pages/NewProduct.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import EditProduct from './pages/EditProduct.jsx';
import Chat from './pages/Chat.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import MyListings from './pages/MyListings.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import './App.css';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
