import { useEffect, useMemo, useState } from 'react'
import api, { getUserFromStorage } from '../api/client'

export default function Leaves() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const auth = getUserFromStorage()

  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/leaves')
      const all = data.data || []
      const mine = all.filter(l => String(l.user?._id || l.user) === String(auth?.user?.id))
      setItems(mine)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(() => {
    return items.map(l => {
      const requesterName = l.user?.name || 'Me'
      const target = (l.user?.role === 'team_manager') ? 'Administrator' : 'Manager'
      const approvedBy = l.approvedBy ? `${l.approvedBy.name} (${l.approvedBy.role === 'general_manager' ? 'Administrator' : 'Manager'})` : ''
      return { ...l, requesterName, target, approvedBy }
    })
  }, [items])

  useEffect(() => {
    load()
    const id = setInterval(load, 12000)
    return () => clearInterval(id)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/leaves', form)
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' })
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to apply')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadStatement = async () => {
    try {
      setDownloading(true)
      const res = await api.get('/leaves/statement', { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'leave_statement.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError('Failed to download statement')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select className="input" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
              <option value="casual">Casual</option>
              <option value="medical">Medical</option>
              <option value="earned">Earned</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Reason</label>
            <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
          <div className="md:col-span-2">
            <button className="btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold">My Leave Requests</h3>
          <button className="btn" onClick={downloadStatement} disabled={downloading}>{downloading ? 'Downloading...' : 'Download Statement (CSV)'}</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Requested By</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Start</th>
                  <th className="text-left p-2">End</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Approver Target</th>
                  <th className="text-left p-2">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l._id} className="border-t">
                    <td className="p-2">{l.requesterName}</td>
                    <td className="p-2 capitalize">{l.leaveType}</td>
                    <td className="p-2">{new Date(l.startDate).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="p-2 capitalize">{l.status}</td>
                    <td className="p-2">{l.reason}</td>
                    <td className="p-2">{l.target}</td>
                    <td className="p-2">{l.approvedBy}</td>
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
