
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const POGeneration = () => {
    const navigate = useNavigate();
    
    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBU, setSelectedBU] = useState('All BUs');
    const [selectedType, setSelectedType] = useState('All Types');

    // Mock Data reflecting the new structure
    const poRequests = [
        {
            id: 1,
            type: 'Direct Sales',
            client: 'Pfizer',
            bu: 'MC',
            amount: 5500.00,
            projects: ['SG-PR-002b'], // Direct
            budgets: [],
            amountLocal: 5500.00,
            amountUsd: 4070.00,
            currency: 'SGD',
            approvalDate: '2024-07-20'
        },
        {
            id: 2,
            type: 'Direct Sales',
            client: 'AstraZeneca',
            bu: 'MC',
            amount: 15000.00,
            projects: ['SG-PR-001a', 'SG-PR-001b'], // Parallel List
            budgets: [],
            amountLocal: 15000.00,
            amountUsd: 11100.00,
            currency: 'SGD',
            approvalDate: '2024-07-21'
        },
        {
            id: 3,
            type: 'Other',
            client: 'Internal',
            bu: 'Marketing',
            amount: 1250.00,
            projects: [],
            budgets: ['Marketing Q3 Campaign'], // Other
            amountLocal: 1250.00,
            amountUsd: 1250.00,
            currency: 'USD',
            approvalDate: '2024-07-22'
        },
        {
            id: 4,
            type: 'Other',
            client: 'Internal',
            bu: 'IT',
            amount: 50000.00,
            projects: [],
            budgets: ['IT Infra Upgrade', 'Server Maintenance'], // Parallel List
            amountLocal: 50000.00,
            amountUsd: 37000.00,
            currency: 'SGD',
            approvalDate: '2024-07-23'
        }
    ];

    // Filter Logic
    const filteredRequests = poRequests.filter(po => {
        const matchSearch = !searchQuery || 
                            po.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            po.projects.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            po.budgets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchBU = selectedBU === 'All BUs' || po.bu === selectedBU;
        const matchType = selectedType === 'All Types' || 
                          (selectedType === 'Direct Sales' && po.type === 'Direct Sales') ||
                          (selectedType === 'Other' && po.type === 'Other');
        return matchSearch && matchBU && matchType;
    });

    const totalLocal = filteredRequests.reduce((acc, curr) => acc + curr.amountLocal, 0); // Simplified total mixing currencies just for demo visual
    const totalUSD = filteredRequests.reduce((acc, curr) => acc + curr.amountUsd, 0);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Purchase Order Generation</h1>
                <p className="text-sm text-gray-500 mt-1">Generate PO documents for approved procurement requests.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">arrow_back</span> Back
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span> Generate PO
                </button>
            </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
                 <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Search by Client, PJ No..." 
                        className="w-full pl-10 border-gray-300 rounded-lg text-sm bg-gray-50 h-10 focus:ring-primary-500" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <div className="relative">
                     <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="pl-4 pr-10 py-2 border-gray-300 rounded-lg text-sm bg-gray-50 appearance-none h-10 focus:ring-primary-500"
                     >
                         <option>All Types</option>
                         <option>Direct Sales</option>
                         <option>Other</option>
                     </select>
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                 </div>
                 <div className="relative">
                     <select 
                        value={selectedBU}
                        onChange={(e) => setSelectedBU(e.target.value)}
                        className="pl-4 pr-10 py-2 border-gray-300 rounded-lg text-sm bg-gray-50 appearance-none h-10 focus:ring-primary-500"
                     >
                         <option>All BUs</option>
                         <option>MC</option>
                         <option>MPF</option>
                         <option>Marketing</option>
                         <option>IT</option>
                     </select>
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">expand_more</span>
                 </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                        <tr>
                            <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">BU</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">PJ No. / Budget Case</th>
                            <th className="px-4 py-3 text-right">Amt (Local)</th>
                            <th className="px-4 py-3 text-right">Amt (USD)</th>
                            <th className="px-4 py-3">Currency</th>
                            <th className="px-4 py-3">Approval Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm whitespace-nowrap">
                        {filteredRequests.map((po) => (
                            <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${po.type === 'Direct Sales' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {po.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{po.client}</td>
                                <td className="px-4 py-3 text-gray-600">{po.bu}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">{po.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {po.type === 'Direct Sales' ? (
                                        <div className="flex flex-col gap-1">
                                            {po.projects.map((p, i) => (
                                                <span key={i} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 w-fit">{p}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {po.budgets.map((b, i) => (
                                                <span key={i} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 w-fit">{b}</span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">{po.amountLocal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 text-right text-gray-900 font-medium">{po.amountUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{po.currency}</td>
                                <td className="px-4 py-3 text-gray-600">{po.approvalDate}</td>
                            </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={10} className="p-8 text-center text-gray-500">No requests found matching your filters.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold text-gray-900 text-sm border-t border-gray-200">
                        <tr>
                            <td colSpan={7} className="px-4 py-3 text-right">Total USD</td>
                            <td className="px-4 py-3 text-right">{totalUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 border-t border-gray-200">
                <div>
                    <span className="font-medium text-gray-700">{filteredRequests.length}</span> results
                </div>
                <div className="flex items-center gap-4">
                    <span>Rows per page: 10</span>
                    <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
                        <button className="p-1 rounded hover:bg-gray-100"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default POGeneration;
