import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../src/store/requests';
import { StatusPill } from '../src/components/StatusPill';

const RequestsList = () => {
  const navigate = useNavigate();
  const { state } = useRequests();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Filtering State
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [typeFilter, setTypeFilter] = useState<string>('All Types');
  const [searchTerm, setSearchTerm] = useState('');

  // Derived Filtered List
  const filteredItems = state.requests.filter(req => {
    const matchStatus = statusFilter === 'All Status' || req.status === statusFilter;
    const matchType = typeFilter === 'All Types' || req.type.includes(typeFilter.split(' ')[0]); // 'Procurement' vs 'Invoice' logic
    const matchSearch = !searchTerm || 
                        req.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        req.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        req.applicant.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const toggleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
      else setSelectedItems([...selectedItems, id]);
  };

  const massExport = () => {
      if (selectedItems.length === 0) return;
      alert(`Downloading CSV for ${selectedItems.length} items...`);
  };

  const exportNetSuite = () => {
      alert("Generating NetSuite Export File...");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Requests & Approvals</h1>
          <p className="text-gray-500">Manage all submitted procurement requests, invoices, and items awaiting approval.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center py-4 gap-4">
           <div className="flex flex-wrap gap-3 items-center">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter by ID, Vendor..." 
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">search</span>
             </div>

             <div className="relative">
                <select 
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option>All Status</option>
                    <option>Pending Approval</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm pointer-events-none">expand_more</span>
             </div>
             
             <div className="relative">
                <select 
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500 cursor-pointer"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option>All Types</option>
                    <option>Procurement</option>
                    <option>Invoice</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm pointer-events-none">expand_more</span>
             </div>
           </div>
           
           <div className="flex gap-3">
               <button onClick={exportNetSuite} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 shadow-sm text-sm transition-all">
                  <span className="material-symbols-outlined text-lg">grid_on</span>
                  Export for NetSuite
               </button>

               {selectedItems.length > 0 && (
                   <button onClick={massExport} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 shadow-sm transition-all animate-in fade-in slide-in-from-right-2">
                      <span className="material-symbols-outlined text-lg">download</span>
                      Export Selected ({selectedItems.length})
                   </button>
               )}
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 w-12"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => navigate(`/request/${row.id}`)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedItems.includes(row.id) ? 'bg-primary-50' : ''}`}
                >
                   <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                       <input 
                        type="checkbox" 
                        checked={selectedItems.includes(row.id)} 
                        onChange={(e) => toggleSelect(row.id, e)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                       />
                   </td>
                   <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.id}</td>
                   <td className="px-4 py-3 text-sm text-gray-600">{row.type}</td>
                   <td className="px-4 py-3 text-sm text-gray-600">{row.applicant}</td>
                   <td className="px-4 py-3 text-sm text-gray-600">{row.vendor}</td>
                   <td className="px-4 py-3 text-sm font-medium text-gray-900">${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                   <td className="px-4 py-3">
                     <StatusPill status={row.status} />
                   </td>
                   <td className="px-4 py-3 text-right">
                     <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-100 z-10 relative">
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        View
                     </button>
                   </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No requests match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RequestsList;