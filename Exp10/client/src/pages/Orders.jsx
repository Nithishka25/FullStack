import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { io } from 'socket.io-client'
import { useCart } from '../context/CartContext'

export default function Orders() {
  const { token, user } = useAuth()
  const [orders, setOrders] = useState([])
  const { loadFromOrder } = useCart()

  useEffect(() => {
    api.get('/orders/mine', { headers: { Authorization: `Bearer ${token}` } }).then(res => setOrders(res.data.orders))
  }, [token])

  useEffect(() => {
    if (!user) return
    const socket = io(import.meta.env.VITE_API_WS || 'http://localhost:5000', { withCredentials: true })
    socket.emit('join_user', user.id)
    socket.on('order_status', u => setOrders(prev => prev.map(o => o._id === u.id ? { ...o, status: u.status } : o)))
    return () => socket.close()
  }, [user])

  const reorder = (o) => {
    loadFromOrder(o.restaurant, o.items)
    alert('Items added to cart from previous order. Go to Cart to review and place again.')
  }

  const badgeClass = (status) => {
    const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold'
    switch (status) {
      case 'placed': return `${base} bg-gray-100 text-gray-700`
      case 'accepted': return `${base} bg-blue-100 text-blue-700`
      case 'preparing': return `${base} bg-yellow-100 text-yellow-800`
      case 'out_for_delivery': return `${base} bg-purple-100 text-purple-700`
      case 'delivered': return `${base} bg-green-100 text-green-700`
      case 'cancelled': return `${base} bg-red-100 text-red-700`
      default: return `${base} bg-gray-100 text-gray-700`
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">My Orders</h2>
      <div className="grid gap-3">
        {orders.map(o => (
          <div key={o._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Order</div>
                <div className="text-lg font-semibold">#{o._id}</div>
              </div>
              <span className={badgeClass(o.status)}>{o.status.replaceAll('_',' ')}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">Placed on {new Date(o.createdAt).toLocaleString()}</div>
            <div className="mt-2 text-lg font-semibold">Total: ${o.total?.toFixed(2)}</div>
            <div className="mt-4">
              <button className="btn-primary" onClick={() => reorder(o)}>Reorder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
