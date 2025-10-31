import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'

const RoleLabel = ({ role }) => {
  const map = { team_member: 'Employee', team_manager: 'Manager', general_manager: 'Administrator' }
  return <span>{map[role] || role}</span>
}

export default function AdminApprovals() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/leaves')
      const pending = (data.data || []).filter(l => l.status === 'pending' && l.user?.role === 'team_manager')
      setItems(pending)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const act = async (id, status) => {
    try {
      setBusyId(id)
      await api.put(`/leaves/${id}/status`, { status })
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Manager Leave Approvals</h2>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600">No pending requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Manager</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Start</th>
                  <th className="text-left p-2">End</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(l => (
                  <tr key={l._id} className="border-t">
                    <td className="p-2">{l.user?.name || '-'}</td>
                    <td className="p-2"><RoleLabel role={l.user?.role} /></td>
                    <td className="p-2 capitalize">{l.leaveType}</td>
                    <td className="p-2">{new Date(l.startDate).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="p-2">{l.reason}</td>
                    <td className="p-2 flex gap-2">
                      <button className="btn" disabled={!!busyId} onClick={() => act(l._id, 'approved')}>{busyId===l._id?'...':'Approve'}</button>
                      <button className="btn bg-red-600 hover:bg-red-700" disabled={!!busyId} onClick={() => act(l._id, 'rejected')}>{busyId===l._id?'...':'Reject'}</button>
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
