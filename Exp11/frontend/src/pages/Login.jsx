import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { saveAuth } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveAuth(data)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Your password" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          No account? <Link className="text-blue-600 hover:underline" to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}
