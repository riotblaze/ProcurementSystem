
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../src/store/requests';
import { StatusPill } from '../src/components/StatusPill';

const RequestTypeBadge = ({ type }: { type: string }) => {
  let config = { label: type, icon: 'help', style: 'bg-gray-50 text-gray-700 ring-gray-200' };

  const normalizedType = type.toLowerCase();

  if (normalizedType === 'direct' || normalizedType === 'direct procurement') {
      config = { 
        label: 'Direct Procurement', 
        icon: 'shopping_cart', 
        style: 'bg-blue-50 text-blue-700 ring-blue-600/20' 
      };
  } else if (normalizedType === 'other' || normalizedType === 'other procurement') {
      config = { 
        label: 'Other Procurement', 
        icon: 'inventory_2', 
        style: 'bg-slate-50 text-slate-700 ring-slate-600/20' 
      };
  } else if (normalizedType === 'direct invoice') {
      config = { 
        label: 'Direct Invoice', 
        icon: 'receipt_long', 
        style: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' 
      };
  } else if (normalizedType === 'other invoice') {
      config = { 
        label: 'Other Invoice', 
        icon: 'receipt', 
        style: 'bg-zinc-50 text-zinc-700 ring-zinc-600/20' 
      };
  } else if (normalizedType.includes('invoice')) {
      // Fallback
      config = { 
        label: 'Invoice Request', 
        icon: 'receipt', 
        style: 'bg-purple-50 text-purple-700 ring-purple-600/20' 
      };
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${config.style}`}>
      <span className="material-symbols-outlined text-[16px] leading-none">{config.icon}</span>
      {config.label}
    </span>
  );
};

const ApproveRequests = () => {
  const navigate = useNavigate();
  const { state } = useRequests();

  // Filter for pending items
  const pendingRequests = state.requests.filter(r => r.status.includes('Pending'));

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Approve Requests</h1>
                <p className="text-gray-500 mt-1">Review and approve pending procurement requests.</p>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-700">Pending My Action ({pendingRequests.length})</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">Filter</button>
                </div>
            </div>
            
            <table className="w-full text-left">
                <thead className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                        <th className="px-6 py-3">Request ID</th>
                        <th className="px-6 py-3">Request Type</th>
                        <th className="px-6 py-3">Applicant</th>
                        <th className="px-6 py-3">Team</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {pendingRequests.map((req) => (
                        <tr 
                          key={req.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/request/${req.id}`)}
                        >
                            <td className="px-6 py-4 text-sm text-gray-900 hover:text-primary-600 hover:underline font-medium">{req.id}</td>
                            <td className="px-6 py-4">
                                <RequestTypeBadge type={req.type} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{req.applicant}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{req.team}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{req.date}</td>
                            <td className="px-6 py-4">
                                <StatusPill status={req.status} />
                            </td>
                        </tr>
                    ))}
                    {pendingRequests.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500 italic">No pending requests found. Good job!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ApproveRequests;
