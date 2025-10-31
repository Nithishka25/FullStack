import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [q, setQ] = useState('')
  const [cuisine, setCuisine] = useState('')

  useEffect(() => {
    const params = {}
    if (q) params.q = q
    if (cuisine) params.cuisine = cuisine
    api.get('/restaurants', { params }).then(res => setRestaurants(res.data.restaurants))
  }, [q, cuisine])

  const cuisines = Array.from(new Set(restaurants.flatMap(r => r.cuisines || [])))

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Restaurants</h2>
      <div className="flex items-center gap-3">
        <input className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
        <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" value={cuisine} onChange={e => setCuisine(e.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {restaurants.map(r => (
          <Link key={r._id} to={`/restaurant/${r._id}`} className="rounded-xl border border-gray-200 bg-white p-4 no-underline shadow-sm transition hover:shadow">
            <div className="font-semibold text-gray-900">{r.name}</div>
            <div className="text-sm text-gray-600">{(r.cuisines||[]).join(', ')}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
