import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'

const RoleBadge = ({ role }) => {
  const map = { team_member: 'Employee', team_manager: 'Manager', general_manager: 'Administrator' }
  return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{map[role] || role}</span>
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/users')
      setUsers(data.data || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateUser = async (id, payload) => {
    try {
      setSavingId(id)
      await api.put(`/users/${id}`, payload)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed')
    } finally {
      setSavingId('')
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to remove this user?')) return
    try {
      setSavingId(id)
      await api.delete(`/users/${id}`)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed')
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Users</h2>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Manager</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.department}</td>
                    <td className="p-2"><RoleBadge role={u.role} /></td>
                    <td className="p-2">{u.manager?.name || '-'}</td>
                    <td className="p-2 flex gap-2">
                      <button className="btn" disabled={!!savingId} onClick={() => updateUser(u._id, { role: 'team_member' })}>Make Employee</button>
                      <button className="btn" disabled={!!savingId} onClick={() => updateUser(u._id, { role: 'team_manager' })}>Make Manager</button>
                      <button className="btn" disabled={!!savingId} onClick={() => updateUser(u._id, { role: 'general_manager' })}>Make Admin</button>
                      <button className="btn bg-red-600 hover:bg-red-700" disabled={!!savingId} onClick={() => deleteUser(u._id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
