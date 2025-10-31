import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try { await login(email, password); nav('/') } catch { setErr('Invalid credentials') }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h2 className="mb-2 text-2xl font-semibold">Welcome back</h2>
        <p className="mb-4 text-sm text-gray-500">Login to continue ordering your favorites.</p>
        {err && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
        <form onSubmit={submit} className="grid gap-3">
          <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <div className="mt-2 flex items-center gap-3">
            <button type="submit" className="btn-primary w-full">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}
