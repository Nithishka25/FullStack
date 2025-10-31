import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { io } from 'socket.io-client'

export default function Dashboard() {
  const { token, user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ name: '', description: '', cuisines: '' })
  const [menu, setMenu] = useState([])
  const [itemForm, setItemForm] = useState({ id: '', name: '', price: '', category: '', description: '' })
  const [analytics, setAnalytics] = useState({ totals: { orders: 0, revenue: 0 }, daily: [] })

  useEffect(() => {
    if (!user?.restaurant) return
    api.get(`/orders/restaurant/${user.restaurant}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data.orders))
    api.get(`/menu/${user.restaurant}`).then(res => setMenu(res.data.items))
    api.get('/analytics/restaurant/summary', { headers: { Authorization: `Bearer ${token}` }, params: { days: 7 } })
      .then(res => setAnalytics(res.data))
  }, [token, user])

  useEffect(() => {
    if (!user?.restaurant) return
    const socket = io(import.meta.env.VITE_API_WS || 'http://localhost:5000', { withCredentials: true })
    socket.emit('join_user', user.id)
    socket.on('order_status', u => setOrders(prev => prev.map(o => o._id === u.id ? { ...o, status: u.status } : o)))
    return () => socket.close()
  }, [user])

  const save = async () => {
    const payload = { ...form, cuisines: form.cuisines.split(',').map(s => s.trim()).filter(Boolean) }
    const res = await api.post('/restaurants/me', payload, { headers: { Authorization: `Bearer ${token}` } })
    setRestaurant(res.data.restaurant)
  }

  const updateOrder = async (id, status) => {
    const res = await api.patch(`/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
    setOrders(prev => prev.map(o => o._id === id ? res.data.order : o))
  }

  const editItem = (i) => setItemForm({ id: i._id, name: i.name, price: String(i.price || ''), category: i.category || '', description: i.description || '' })

  const submitItem = async () => {
    const payload = { name: itemForm.name, price: Number(itemForm.price || 0), category: itemForm.category, description: itemForm.description }
    if (itemForm.id) {
      const res = await api.put(`/menu/${itemForm.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      setMenu(prev => prev.map(m => m._id === itemForm.id ? res.data.item : m))
    } else {
      const res = await api.post('/menu', payload, { headers: { Authorization: `Bearer ${token}` } })
      setMenu(prev => [res.data.item, ...prev])
    }
    setItemForm({ id: '', name: '', price: '', category: '', description: '' })
  }

  const deleteItem = async (id) => {
    await api.delete(`/menu/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    setMenu(prev => prev.filter(m => m._id !== id))
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Restaurant Dashboard</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Restaurant Profile</h3>
          <div className="grid gap-3">
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Cuisines (comma separated)" value={form.cuisines} onChange={e => setForm({ ...form, cuisines: e.target.value })} />
            <div className="mt-2">
              <button className="btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Add / Edit Menu Item</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Item name" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Price" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Category" value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Description" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} />
          </div>
          <div className="mt-3 flex gap-3">
            <button className="btn-primary" onClick={submitItem}>{itemForm.id ? 'Update' : 'Add'} item</button>
            {itemForm.id && <button className="btn-secondary" onClick={() => setItemForm({ id: '', name: '', price: '', category: '', description: '' })}>Cancel</button>}
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold">Menu Items</h3>
      <div className="mt-2 grid gap-3">
        {menu.map(i => (
          <div key={i._id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex-1">
              <div className="font-semibold">{i.name} {i.available === false && <span className="text-sm text-gray-400">(unavailable)</span>}</div>
              <div className="text-sm text-gray-900">${(i.price || 0).toFixed(2)} • {i.category || 'uncategorized'}</div>
            </div>
            <button className="btn-secondary" onClick={() => editItem(i)}>Edit</button>
            <button className="text-sm text-red-600 hover:text-red-700" onClick={() => deleteItem(i._id)}>Delete</button>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-lg font-semibold">Orders</h3>
      <div className="mt-2 grid gap-3">
        {orders.map(o => (
          <div key={o._id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">#{o._id}</div>
              <div className="text-sm text-gray-900">${o.total?.toFixed(2)}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['accepted','preparing','out_for_delivery','delivered','cancelled'].map(s => (
                <button key={s} className="btn-secondary text-sm" onClick={() => updateOrder(o._id, s)}>{s.replaceAll('_',' ')}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-lg font-semibold">Sales (last 7 days)</h3>
      <div className="card">
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
            <div className="text-sm text-gray-500">Orders</div>
            <div className="text-2xl font-bold">{analytics?.totals?.orders || 0}</div>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100">
            <div className="text-sm text-gray-500">Revenue</div>
            <div className="text-2xl font-bold">${Number(analytics?.totals?.revenue || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {analytics?.daily?.map(d => (
            <div key={d._id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
              <div className="w-28 text-sm text-gray-600">{d._id}</div>
              <div className="text-sm">Orders: <span className="font-semibold">{d.orders}</span></div>
              <div className="text-sm">Revenue: <span className="font-semibold">${d.revenue.toFixed(2)}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
