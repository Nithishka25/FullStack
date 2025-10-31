import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [restaurantName, setRestaurantName] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      await register({ name, email, password, role, restaurantName: role === 'restaurant' ? restaurantName : undefined })
      nav('/')
    } catch { setErr('Registration failed') }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h2 className="mb-2 text-2xl font-semibold">Create your account</h2>
        <p className="mb-4 text-sm text-gray-500">Join Foodie to discover great food around you.</p>
        {err && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
        <form onSubmit={submit} className="grid gap-3">
          <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="restaurant">Restaurant Owner</option>
            </select>
          </div>
          {role === 'restaurant' && (
            <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Restaurant name" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
          )}
          <div className="mt-2 flex items-center gap-3">
            <button type="submit" className="btn-primary w-full">Create account</button>
          </div>
        </form>
      </div>
    </div>
  )
}
