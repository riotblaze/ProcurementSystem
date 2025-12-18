import React from 'react';

const statusStyles: Record<string, string> = {
  Approved: 'text-green-700 bg-green-50 ring-green-600/20',
  Pending: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  'Pending Team Lead': 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  'Pending Finance': 'text-orange-700 bg-orange-50 ring-orange-600/20',
  'Pending CFO': 'text-purple-700 bg-purple-50 ring-purple-600/20',
  'Pending Approval': 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  Rejected: 'text-red-700 bg-red-50 ring-red-600/20',
  Draft: 'text-blue-700 bg-blue-50 ring-blue-600/20',
};

export const StatusPill = ({ status }: { status: string }) => {
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset';
  const style = statusStyles[status] || 'bg-gray-50 text-gray-700 ring-gray-300/50';
  
  return <span className={`${base} ${style}`}>{status}</span>;
};
