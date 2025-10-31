import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get('/auth/me')
        setMe(data.user)
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) return <div className="container py-10">Loading...</div>
  if (error) return <div className="container py-10 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Welcome, {me?.name}</h2>
        <p className="text-sm text-gray-600">Role: {me?.role} · Department: {me?.department}</p>
      </div>

      <div className="card">
        <h3 className="text-md font-semibold mb-4">Leave Balances</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(me?.leaveBalance || {}).map(([k,v]) => (
            <div key={k} className="rounded border p-4">
              <div className="text-xs uppercase text-gray-500">{k}</div>
              <div className="text-2xl font-bold">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
