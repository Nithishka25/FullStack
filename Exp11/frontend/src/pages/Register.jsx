import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { saveAuth } from '../api/client'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' })
  const [role, setRole] = useState('Employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const roleMap = {
    Employee: 'team_member',
    Manager: 'team_manager',
    Administrator: 'general_manager',
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, role: roleMap[role] }
      const { data } = await api.post('/auth/register', payload)
      saveAuth(data)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Register</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Department</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Employee</option>
              <option>Manager</option>
              <option>Administrator</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          Already have an account? <Link className="text-blue-600 hover:underline" to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
