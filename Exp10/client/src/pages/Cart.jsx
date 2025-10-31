import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/client'

export default function Cart() {
  const { cart, inc, dec, remove, clear } = useCart()
  const { token, user } = useAuth()
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', state: '', postalCode: '' })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedSaved, setSelectedSaved] = useState(-1) // -1 = custom

  const subtotal = useMemo(() => (cart.items || []).reduce((s, i) => s + (i.price || 0) * i.quantity, 0), [cart])

  useEffect(() => {
    if (!user) return
    api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const addrs = res.data.user?.addresses || []
        setSavedAddresses(addrs)
        if (addrs.length) {
          setSelectedSaved(0)
          setAddress({
            line1: addrs[0].line1 || '',
            line2: addrs[0].line2 || '',
            city: addrs[0].city || '',
            state: addrs[0].state || '',
            postalCode: addrs[0].postalCode || ''
          })
        }
      })
  }, [user, token])

  const onSelectSaved = (idx) => {
    setSelectedSaved(idx)
    if (idx >= 0) {
      const a = savedAddresses[idx]
      setAddress({ line1: a.line1 || '', line2: a.line2 || '', city: a.city || '', state: a.state || '', postalCode: a.postalCode || '' })
    }
  }

  const place = async () => {
    if (!user) return alert('Please login to place an order')
    if (!cart.restaurantId || !(cart.items || []).length) return alert('Cart is empty')
    const items = cart.items.map(i => ({ item: i.item, quantity: i.quantity }))
    const res = await api.post('/orders', { restaurantId: cart.restaurantId, items, address }, { headers: { Authorization: `Bearer ${token}` } })
    clear()
    alert(`Order placed: ${res.data.order._id}`)
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Your Cart</h2>
      {!cart.items?.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="grid gap-3">
          {(cart.items || []).map(i => (
            <div key={i.item} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex-1">
                <div className="text-base font-semibold">{i.name}</div>
                <div className="text-sm text-gray-500">${(i.price || 0).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary px-3 py-2" onClick={() => dec(i.item)}>-</button>
                <span className="min-w-[2ch] text-center font-semibold">{i.quantity}</span>
                <button className="btn-secondary px-3 py-2" onClick={() => inc(i.item)}>+</button>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">${((i.price || 0) * i.quantity).toFixed(2)}</div>
              <button className="ml-2 text-sm text-red-600 hover:text-red-700" onClick={() => remove(i.item)}>Remove</button>
            </div>
          ))}
          <div className="mt-2 text-right text-lg font-semibold">Subtotal: ${subtotal.toFixed(2)}</div>
        </div>
      )}

      <div className="mt-6 grid max-w-xl gap-3">
        {savedAddresses.length > 0 && (
          <div className="card">
            <div className="mb-2 text-sm font-semibold text-gray-700">Select saved address</div>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" value={selectedSaved} onChange={e => onSelectSaved(Number(e.target.value))}>
              {savedAddresses.map((a, idx) => (
                <option key={idx} value={idx}>{a.label || `${a.line1}, ${a.city}`}</option>
              ))}
              <option value={-1}>Use custom address</option>
            </select>
          </div>
        )}
        <div className="card grid gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Line 1" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Line 2" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="State" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
            <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Postal Code" value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button className="btn-primary" onClick={place} disabled={!cart.items?.length}>Place order</button>
        <button className="btn-secondary" onClick={clear} disabled={!cart.items?.length}>Clear cart</button>
      </div>
    </div>
  )
}
