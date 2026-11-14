import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Calendar, CheckCircle, Clock, PlusCircle, AlertCircle, 
  Send, RefreshCw, X, ShieldAlert, History, LogIn, LogOut, Ban, Info
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user, refreshProfile } = useAuth();

  // State
  const [leaves, setLeaves] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeaveFilter, setActiveLeaveFilter] = useState('ALL');

  // Today's attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [punching, setPunching] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState(null);

  // Apply Leave Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState('FIRST_HALF');
  const [reason, setReason] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Cancelling leave state
  const [cancellingId, setCancellingId] = useState(null);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, attendanceRes] = await Promise.all([
        api.get('/api/leaves/my'),
        api.get('/api/attendance/my')
      ]);

      const myLeaves = leavesRes.data.data || [];
      const myAttendance = attendanceRes.data.data || [];

      setLeaves(myLeaves);
      setAttendanceLogs(myAttendance);

      // Check today's record
      const todayRecord = myAttendance.find(log => log.date === todayStr);
      setTodayAttendance(todayRecord || null);

      refreshProfile();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check In (Punch In)
  const handleCheckIn = async () => {
    setPunching(true);
    setAttendanceMessage(null);
    try {
      const response = await api.post('/api/attendance/check-in');
      const saved = response.data.data;
      setTodayAttendance(saved);
      setAttendanceLogs(prev => [saved, ...prev.filter(l => l.date !== todayStr)]);
      setAttendanceMessage({ 
        type: 'success', 
        text: `Checked In successfully at ${saved.checkInTime || 'now'}!` 
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to check in';
      setAttendanceMessage({ type: 'error', text: msg });
    } finally {
      setPunching(false);
    }
  };

  // Check Out (Punch Out)
  const handleCheckOut = async () => {
    setPunching(true);
    setAttendanceMessage(null);
    try {
      const response = await api.post('/api/attendance/check-out');
      const saved = response.data.data;
      setTodayAttendance(saved);
      setAttendanceLogs(prev => prev.map(l => l.id === saved.id ? saved : l));
      setAttendanceMessage({ 
        type: 'success', 
        text: `Checked Out successfully at ${saved.checkOutTime || 'now'}! Total hours: ${saved.totalHours || 0} hrs` 
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to check out';
      setAttendanceMessage({ type: 'error', text: msg });
    } finally {
      setPunching(false);
    }
  };

  // Cancel Pending Leave
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this pending leave request?")) {
      return;
    }
    setCancellingId(leaveId);
    try {
      const response = await api.put(`/api/leaves/${leaveId}/cancel`);
      const updated = response.data.data;
      setLeaves(prev => prev.map(l => l.id === leaveId ? updated : l));
      alert("Leave request cancelled successfully.");
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel leave';
      alert(msg);
    } finally {
      setCancellingId(null);
    }
  };

  // Calculate requested days
  const calculateDays = () => {
    if (isHalfDay) return 0.5;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays();

  // Handle submit leave
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    const targetEndDate = isHalfDay ? startDate : endDate;

    if (!isHalfDay && requestedDays <= 0) {
      setApplyError('End date must be greater than or equal to start date.');
      return;
    }

    if (requestedDays > (user?.availableLeaveDays || 0)) {
      setApplyError(`Insufficient leave balance! You requested ${requestedDays} day(s) but only have ${user?.availableLeaveDays} day(s) left.`);
      return;
    }

    setSubmittingLeave(true);
    try {
      const response = await api.post('/api/leaves/apply', {
        leaveType,
        startDate,
        endDate: targetEndDate,
        isHalfDay,
        halfDayPeriod: isHalfDay ? halfDayPeriod : null,
        reason,
      });

      const newLeave = response.data.data;
      setLeaves(prev => [newLeave, ...prev]);
      setApplySuccess('Leave application submitted successfully! Waiting for manager approval.');
      setStartDate('');
      setEndDate('');
      setIsHalfDay(false);
      setReason('');
      
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess('');
      }, 1500);

      refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit leave request';
      setApplyError(msg);
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Filter leaves
  const filteredLeaves = leaves.filter(l => {
    if (activeLeaveFilter === 'ALL') return true;
    return l.status === activeLeaveFilter;
  });

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;

  return (
    <div className="space-y-8">

      {/* Top Banner & Punch In / Out Widget */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 backdrop-blur">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="mt-1 text-sm text-indigo-200/90 max-w-xl">
              Track your daily check-in / check-out times, working hours, and manage leave requests.
            </p>
          </div>

          {/* Today's Punch Clock Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col sm:flex-row items-center gap-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
                Today's Punch Status
              </span>
              
              <div className="mt-1.5 flex flex-col gap-1">
                {!todayAttendance ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    Not Checked In Yet
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-300 font-bold">In:</span>
                      <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white">{todayAttendance.checkInTime || 'Recorded'}</span>
                      {todayAttendance.checkOutTime && (
                        <>
                          <span className="text-amber-300 font-bold ml-1">Out:</span>
                          <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white">{todayAttendance.checkOutTime}</span>
                        </>
                      )}
                    </div>
                    {todayAttendance.totalHours != null && (
                      <span className="text-[11px] text-indigo-200 font-semibold block">
                        Total Worked: <strong className="text-white">{todayAttendance.totalHours} hrs</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Check-In / Check-Out Actions */}
            <div className="flex items-center gap-2">
              {!todayAttendance ? (
                <button
                  disabled={punching}
                  onClick={handleCheckIn}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  {punching ? 'Recording...' : 'Check In (Punch In)'}
                </button>
              ) : !todayAttendance.checkOutTime ? (
                <button
                  disabled={punching}
                  onClick={handleCheckOut}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  {punching ? 'Recording...' : 'Check Out (Punch Out)'}
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  Day Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {attendanceMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            attendanceMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
          }`}>
            <AlertCircle className="w-4 h-4" />
            {attendanceMessage.text}
          </div>
        )}
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Available Leave Days"
          value={`${user?.availableLeaveDays ?? 18} Days`}
          subtitle="Remaining balance this annual cycle"
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Pending Leave Requests"
          value={pendingCount}
          subtitle="Awaiting manager sign-off"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Approved Leaves"
          value={approvedCount}
          subtitle="Approved requests to date"
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Attendance Logged"
          value={`${attendanceLogs.length} Days`}
          subtitle="Total recorded check-in days"
          icon={History}
          color="blue"
        />
      </div>

      {/* Main Grid: Leave Management & Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Leave Management & History Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  My Leave Applications
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review status, cancel pending requests, or see manager feedback
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Apply For Leave
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-4 pb-2 overflow-x-auto">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveLeaveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeLeaveFilter === filter
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {filter === 'ALL' ? 'All Leaves' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Leaves Table */}
            <div className="mt-4 overflow-x-auto">
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">No leave requests found</p>
                  <p className="text-xs text-slate-400">Apply for a leave using the button above.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Dates</th>
                      <th className="py-3 px-3 text-center">Duration</th>
                      <th className="py-3 px-3">Reason / Manager Comment</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-medium">
                          <StatusBadge status={leave.leaveType} />
                          {leave.isHalfDay && (
                            <span className="block mt-1 text-[10px] text-amber-600 font-bold">
                              Half-Day ({leave.halfDayPeriod === 'FIRST_HALF' ? '1st Half' : '2nd Half'})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                          {leave.startDate} {leave.startDate !== leave.endDate && <><span className="text-slate-400">to</span> {leave.endDate}</>}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">
                          {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                        </td>
                        <td className="py-3 px-3 max-w-xs text-slate-600">
                          <p className="truncate" title={leave.reason}>{leave.reason || '—'}</p>
                          {leave.status === 'REJECTED' && leave.rejectionReason && (
                            <p className="mt-1 text-[11px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                              <strong>Manager Note:</strong> {leave.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <StatusBadge status={leave.status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          {leave.status === 'PENDING' && (
                            <button
                              disabled={cancellingId === leave.id}
                              onClick={() => handleCancelLeave(leave.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center gap-1 ml-auto"
                            >
                              <Ban className="w-3 h-3" />
                              {cancellingId === leave.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance History Log */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Recent Attendance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Punch records & working hours
                </p>
              </div>
              <button
                onClick={fetchData}
                title="Refresh log"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 max-h-[420px] overflow-y-auto space-y-2 pr-1">
              {attendanceLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No attendance records logged yet.
                </div>
              ) : (
                attendanceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {log.date}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                      </div>
                      <StatusBadge status={log.status} />
                    </div>

                    {(log.checkInTime || log.checkOutTime) && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-600">
                        <span>In: <strong className="font-mono text-slate-800">{log.checkInTime || '—'}</strong></span>
                        <span>Out: <strong className="font-mono text-slate-800">{log.checkOutTime || '—'}</strong></span>
                        {log.totalHours != null && (
                          <span className="font-bold text-indigo-600">{log.totalHours} hrs</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Apply for Leave</h3>
                  <p className="text-xs text-slate-500">Available Balance: <strong className="text-indigo-600">{user?.availableLeaveDays} days</strong></p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            {applySuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{applySuccess}</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 bg-white"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                </select>
              </div>

              {/* Half-Day Toggle Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Apply for Half-Day Leave</span>
                  <span className="text-[11px] text-slate-500">Deducts 0.5 days from balance</span>
                </div>
                <input
                  type="checkbox"
                  checked={isHalfDay}
                  onChange={(e) => {
                    setIsHalfDay(e.target.checked);
                    if (e.target.checked && startDate) {
                      setEndDate(startDate);
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {isHalfDay && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Half-Day Period
                  </label>
                  <select
                    value={halfDayPeriod}
                    onChange={(e) => setHalfDayPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 bg-white"
                  >
                    <option value="FIRST_HALF">First Half (Morning 9 AM - 1:30 PM)</option>
                    <option value="SECOND_HALF">Second Half (Afternoon 1:30 PM - 6 PM)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isHalfDay ? 'Leave Date' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (isHalfDay) setEndDate(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                {!isHalfDay && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      min={startDate || todayStr}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Day count alert */}
              {requestedDays > 0 && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
                  requestedDays > (user?.availableLeaveDays || 0)
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  <span>Requested Duration:</span>
                  <span className="font-bold text-sm">
                    {requestedDays} {requestedDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the purpose of your leave request..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave || requestedDays <= 0 || requestedDays > (user?.availableLeaveDays || 0)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2"
                >
                  {submittingLeave ? 'Submitting...' : 'Submit Leave Request'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
