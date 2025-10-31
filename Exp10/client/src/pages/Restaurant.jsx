import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'

export default function Restaurant() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const { add } = useCart()
  const [category, setCategory] = useState('')

  useEffect(() => { api.get(`/restaurants/${id}`).then(res => setData(res.data)) }, [id])

  if (!data) return <div>Loading...</div>

  const categories = Array.from(new Set((data.menu || []).map(i => i.category).filter(Boolean)))
  const items = category ? data.menu.filter(i => i.category === category) : data.menu

  return (
    <div>
      <div className="mb-2">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {data.restaurant.name}
        </h2>
        <div className="text-sm text-gray-600">{(data.restaurant.cuisines||[]).join(', ')}</div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <h3 className="text-xl font-semibold">Menu</h3>
        <div className="ml-auto" />
        <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" value={category} onChange={e => setCategory(e.target.value)}>
          <option value=''>All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map(i => (
          <div key={i._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{i.name}</div>
                {i.category && <div className="text-xs text-gray-500">{i.category}</div>}
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">${i.price?.toFixed(2)}</div>
            </div>
            <button className="btn-primary mt-4 w-full" onClick={() => add(id, { item: i._id, name: i.name, price: i.price, quantity: 1 })}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  )
}
