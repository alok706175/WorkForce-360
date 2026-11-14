import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Users, CheckCircle, Clock, XCircle, Calendar, 
  Search, Check, X, RefreshCw, AlertCircle, FileText, MessageSquare
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Reject Modal state
  const [rejectModalData, setRejectModalData] = useState(null); // { id, employeeName }
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Fetch all manager data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, employeesRes, attendanceRes] = await Promise.all([
        api.get('/api/leaves/pending'),
        api.get('/api/employees'),
        api.get(`/api/attendance/all${selectedDate ? `?date=${selectedDate}` : ''}`)
      ]);

      setPendingLeaves(pendingRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
      setAttendanceRecords(attendanceRes.data.data || []);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Handle Approve
  const handleApprove = async (id, employeeName, days) => {
    setActionLoadingId(id);
    setActionNotice(null);
    try {
      await api.put(`/api/leaves/${id}/approve`);
      setPendingLeaves(prev => prev.filter(l => l.id !== id));
      
      // Update local employee balance list
      setEmployees(prev => prev.map(emp => {
        if (emp.fullName === employeeName) {
          return { ...emp, availableLeaveDays: Math.max(0, emp.availableLeaveDays - days) };
        }
        return emp;
      }));

      setActionNotice({
        type: 'success',
        text: `Leave request for ${employeeName} approved! ${days} days deducted from available balance.`
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve leave request';
      setActionNotice({ type: 'error', text: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (id, employeeName) => {
    setRejectModalData({ id, employeeName });
    setRejectionReason('');
  };

  // Submit Reject with Reason
  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectModalData) return;
    
    setRejecting(true);
    try {
      await api.put(`/api/leaves/${rejectModalData.id}/reject`, {
        reason: rejectionReason || 'Rejected by manager'
      });
      setPendingLeaves(prev => prev.filter(l => l.id !== rejectModalData.id));
      setActionNotice({
        type: 'info',
        text: `Leave request for ${rejectModalData.employeeName} rejected with feedback.`
      });
      setRejectModalData(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject leave request';
      setActionNotice({ type: 'error', text: msg });
    } finally {
      setRejecting(false);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  // Attendance stats for selected date
  const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const halfDayCount = attendanceRecords.filter(a => a.status === 'HALF_DAY').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;

  return (
    <div className="space-y-8">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Management & Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review pending leave applications, audit team balances, and monitor punch-in / punch-out logs.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-150 ${
          actionNotice.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : actionNotice.type === 'info'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionNotice.text}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Pending Approvals"
          value={pendingLeaves.length}
          subtitle="Requests requiring your action"
          icon={Clock}
          color={pendingLeaves.length > 0 ? 'amber' : 'emerald'}
        />
        <StatsCard
          title="Total Workforce"
          value={employees.length}
          subtitle="Registered staff members"
          icon={Users}
          color="indigo"
        />
        <StatsCard
          title="Present Today"
          value={presentCount}
          subtitle={`Checked in on ${selectedDate}`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Absences / Half Days"
          value={`${absentCount + halfDayCount}`}
          subtitle="Out of office or partial"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* SECTION 1: Pending Leave Approvals */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Pending Leave Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Approving automatically deducts days; Rejecting allows sending a comment to employee
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            {pendingLeaves.length} Pending
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 stroke-1" />
              <p className="mt-2 text-sm font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400">No pending leave requests require review at this time.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3 text-center">Days</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block">{leave.employeeName}</span>
                      <span className="text-[11px] text-slate-400">{leave.employeeEmail}</span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600">
                      {leave.department || 'General'}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={leave.leaveType} />
                      {leave.isHalfDay && (
                        <span className="block mt-1 text-[10px] text-amber-600 font-bold">
                          Half-Day ({leave.halfDayPeriod === 'FIRST_HALF' ? '1st Half' : '2nd Half'})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {leave.startDate} {leave.startDate !== leave.endDate && <><span className="text-slate-400">to</span> {leave.endDate}</>}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason || '—'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoadingId === leave.id}
                          onClick={() => handleApprove(leave.id, leave.employeeName, leave.numberOfDays)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          disabled={actionLoadingId === leave.id}
                          onClick={() => openRejectModal(leave.id, leave.employeeName)}
                          className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 disabled:opacity-50 text-rose-700 font-bold text-xs transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 2 & 3: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* All Employees & Balances (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                All Employees Leave Balances
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Remaining balances and department assignments
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff or dept..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Staff Member</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Available Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{emp.fullName}</span>
                      <span className="text-[11px] text-slate-400">{emp.email}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {emp.department || 'General'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-2 rounded-full ${
                              emp.availableLeaveDays > 10 ? 'bg-indigo-600' : emp.availableLeaveDays > 5 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, (emp.availableLeaveDays / 18) * 100)}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-sm text-slate-900">
                          {emp.availableLeaveDays}
                        </span>
                        <span className="text-slate-400 text-[11px]">days</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Attendance Overview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Team Attendance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Date-filtered punch-in/out records
              </p>
            </div>

            {/* Date filter picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick summary metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
              <span className="text-base font-extrabold text-emerald-800">{presentCount}</span>
            </div>
            <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Half Day</span>
              <span className="text-base font-extrabold text-amber-800">{halfDayCount}</span>
            </div>
            <div className="bg-rose-50 rounded-xl p-2.5 text-center border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Absent</span>
              <span className="text-base font-extrabold text-rose-800">{absentCount}</span>
            </div>
          </div>

          {/* Attendance list for date */}
          <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2 pr-1">
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No attendance recorded for {selectedDate}.
              </div>
            ) : (
              attendanceRecords.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {att.employeeName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {att.department || 'General'}
                      </span>
                    </div>
                    <StatusBadge status={att.status} />
                  </div>

                  {(att.checkInTime || att.checkOutTime) && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-600">
                      <span>In: <strong className="font-mono text-slate-800">{att.checkInTime || '—'}</strong></span>
                      <span>Out: <strong className="font-mono text-slate-800">{att.checkOutTime || '—'}</strong></span>
                      {att.totalHours != null && (
                        <span className="font-bold text-indigo-600">{att.totalHours} hrs</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Reject Leave Modal with Reason */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reject Leave Request</h3>
                  <p className="text-xs text-slate-500">Employee: {rejectModalData.employeeName}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitReject} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reason for Rejection (Feedback to Employee)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Critical release scheduled on this date, please reschedule or take alternate dates..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalData(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting || !rejectionReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
