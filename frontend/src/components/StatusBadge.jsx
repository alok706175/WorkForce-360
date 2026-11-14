import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'APPROVED':
    case 'PRESENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {normalized === 'APPROVED' ? 'Approved' : 'Present'}
        </span>
      );

    case 'PENDING':
    case 'HALF_DAY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {normalized === 'PENDING' ? 'Pending Review' : 'Half Day'}
        </span>
      );

    case 'REJECTED':
    case 'ABSENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {normalized === 'REJECTED' ? 'Rejected' : 'Absent'}
        </span>
      );

    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Cancelled
        </span>
      );

    case 'CASUAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Casual Leave
        </span>
      );

    case 'SICK':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          Sick Leave
        </span>
      );

    case 'ANNUAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Annual Leave
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};

