import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Profile() {
  const { token } = useAuth()
  const [me, setMe] = useState(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      setMe(res.data.user)
      setName(res.data.user?.name || '')
      setAddresses(res.data.user?.addresses || [])
    })
  }, [token])

  const addAddress = () => setAddresses(prev => [...prev, { label: '', line1: '', line2: '', city: '', state: '', postalCode: '' }])
  const updateAddress = (idx, field, value) => setAddresses(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))
  const removeAddress = (idx) => setAddresses(prev => prev.filter((_, i) => i !== idx))

  const save = async () => {
    await api.put('/users/me', { name, password: password || undefined, addresses }, { headers: { Authorization: `Bearer ${token}` } })
    alert('Profile updated')
    setPassword('')
  }

  if (!me) return <div>Loading...</div>

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-lg font-semibold">Account</h3>
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600" value={me.email} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
              <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="mt-2">
              <button className="btn-primary" onClick={save}>Save profile</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Addresses</h3>
            <button className="btn-secondary" onClick={addAddress}>Add address</button>
          </div>
          <div className="grid gap-3">
            {addresses.map((a, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Label" value={a.label || ''} onChange={e => updateAddress(idx, 'label', e.target.value)} />
                  <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Line 1" value={a.line1 || ''} onChange={e => updateAddress(idx, 'line1', e.target.value)} />
                  <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Line 2" value={a.line2 || ''} onChange={e => updateAddress(idx, 'line2', e.target.value)} />
                  <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="City" value={a.city || ''} onChange={e => updateAddress(idx, 'city', e.target.value)} />
                  <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="State" value={a.state || ''} onChange={e => updateAddress(idx, 'state', e.target.value)} />
                  <input className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Postal Code" value={a.postalCode || ''} onChange={e => updateAddress(idx, 'postalCode', e.target.value)} />
                </div>
                <button className="mt-2 text-sm text-red-600 hover:text-red-700" onClick={() => removeAddress(idx)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
