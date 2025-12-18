
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '../src/store/requests';
import { useAuth } from '../src/store/auth';
import { StatusPill } from '../src/components/StatusPill';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useRequests();
  const { user } = useAuth();
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(document.getElementById('header-portal'));
  }, []);
  
  // Find request in store
  const request = state.requests.find(r => r.id === id) || {
     id: id || 'Unknown', type: id?.startsWith('INV') ? 'Invoice' : 'Direct', applicant: 'Unknown', team: 'Unknown', vendor: 'Unknown', amount: 0, status: 'Pending Approval', date: '2024-01-01'
  };

  const isInvoice = request.type.includes('Invoice') || request.id.startsWith('INV');
  const isDirectProcurement = request.type === 'Direct' || request.type === 'Direct Procurement';
  const isFinanceUser = user?.role === 'Finance';

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const handleAction = (type: string) => {
      setActionType(type);
      setShowActionModal(true);
  };

  const confirmAction = () => {
      if (actionType === 'Approve') {
          dispatch({ type: 'UPDATE_STATUS', id: id!, status: 'Approved' });
      } else if (actionType === 'Reject') {
          dispatch({ type: 'UPDATE_STATUS', id: id!, status: 'Rejected' });
      } else if (actionType === 'Send Back') {
          dispatch({ type: 'UPDATE_STATUS', id: id!, status: 'Draft' });
      }
      setShowActionModal(false);
      navigate('/approve-requests');
  };

  // Approval Process: Applicant -> Manager -> Finance
  const steps = [
    { label: 'Applicant', done: true },
    { 
        label: 'Manager', 
        done: request.status === 'Pending Finance' || request.status === 'Approved'
    },
    { 
        label: 'Finance', 
        done: request.status === 'Approved' 
    },
  ];

  // Logic to show approval actions
  const canApprove = user && (user.role === 'Admin' || user.role === 'Approver' || user.role === 'Finance') && request.status.includes('Pending');

  // --- MOCK DATA FOR DETAILED VIEWS ---
  
  // Expanded Mock Data to include multiple vendors (competitors) and detailed allocation
  const procurementDetails = {
      // Vendor Comparison Data (Competitors)
      vendors: [
          { id: 1, name: 'Office Supplies Co.', country: 'Singapore', currency: 'USD', estCost: 1250.00, estCostUsd: 1250.00, ptUsd: 0, selected: true, note: 'Preferred due to existing contract.', grade: 'A', attachment: 'Quote_OSC_v1.pdf' },
          { id: 2, name: 'Global Tech', country: 'Singapore', currency: 'SGD', estCost: 1800.00, estCostUsd: 1332.00, ptUsd: 0, selected: false, note: 'Alternative option, higher cost.', grade: 'B', attachment: 'Proposal_GT.pdf' },
          { id: 3, name: 'Staples & More', country: 'USA', currency: 'USD', estCost: 1400.00, estCostUsd: 1400.00, ptUsd: 50, selected: false, note: 'Long delivery time.', grade: 'A', attachment: 'Est_Staples.pdf' }
      ],
      // Direct Procurement Data (Cost & Margin)
      costLines: [
           { 
             projectId: 'p1', pjNo: 'SG-PR-001-a', client: 'AstraZeneca', bu: 'MC', prod: 'Customised PJ', 
             revenue: 3000, nonRevenue: 0, existProc: 1200, existPt: 300, cost: 1500, pt: 0, costUsd: 1500, ptUsd: 0, 
             glCode: '6000-ProfFee',
             orderCountry: 'Singapore', insertionNo: 'INS-2024-001', reportCtry: 'Singapore', edd: '2024-12-31'
           },
           { 
             projectId: 'p2', pjNo: 'SG-PR-002-b', client: 'Pfizer', bu: 'MIMS', prod: 'Webinar', 
             revenue: 5500, nonRevenue: 500, existProc: 0, existPt: 0, cost: 0, pt: 0, costUsd: 0, ptUsd: 0, 
             glCode: '7000-Hardware',
             orderCountry: 'Malaysia', insertionNo: 'INS-2024-099', reportCtry: 'Malaysia', edd: '2024-12-31'
           }
      ],
      // Other Procurement Data (Budget Allocation) - Detailed
      budgetLines: [
          { 
            id: 101, type: 'Budget', name: 'Marketing Q3', bu: 'Marketing', country: 'Singapore', team: 'Digital Marketing', category: 'Office Supplies', 
            cost25b: 625, existing: 2000, prior: 0, thisYear: 3000, future: 0, remaining: 1000, allocation: 625 
          },
          { 
            id: 102, type: 'Budget', name: 'IT Infra', bu: 'IT', country: 'Singapore', team: 'Infra', category: 'Hardware', 
            cost25b: 5000, existing: 12000, prior: 1000, thisYear: 50000, future: 10000, remaining: 38000, allocation: 625 
          }
      ],
  };

  const invoiceDetails = {
      invoiceNo: 'INV-2024-999',
      invoiceDate: '2024-07-25',
      linkedPO: 'PO-2024-10010',
      poTotal: 5000.00,
      prevInvoiced: 4000.00,
      currentInvoice: request.amount, 
      remaining: 5000.00 - 4000.00 - request.amount,
      lineItems: [
          { desc: 'Professional Fee - AstraZeneca', amount: 500.50, code: '6000-ProfFee' },
          { desc: 'Hardware - Pfizer', amount: 350.00, code: '7000-Hardware' }
      ]
  };

  const isOverBudget = invoiceDetails.remaining < 0;

  // Helpers for table styles (Matching ProcurementRequest.tsx)
  const headerClass = "px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 whitespace-nowrap";
  const cellClass = "px-4 py-3 text-sm border-b border-gray-100 whitespace-nowrap text-gray-700";
  const readOnlyInputClass = "w-full border-transparent bg-transparent rounded text-[10px] text-gray-700 font-medium px-1 py-1 truncate cursor-default";

  // Compact styles for detailed tables
  const compactHeaderClass = "px-2 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-100 whitespace-nowrap";
  const compactCellClass = "px-2 py-1 border-b border-gray-100 whitespace-nowrap text-xs text-gray-700";

  return (
    <>
    {/* Portal for Header Content */}
    {portalContainer && createPortal(
        <div className="flex items-center justify-between w-full h-full pl-0 md:pl-4">
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900 leading-none">
                            {isInvoice ? 'Invoice Approval' : 'Procurement Approval'}
                        </h1>
                        <StatusPill status={request.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Request ID: <span className="font-mono font-bold text-gray-700">{request.id}</span></p>
                </div>
            </div>

            {/* Timeline - Center */}
            <div className="hidden lg:flex flex-1 justify-center">
                <ul className="flex items-center gap-2 text-xs text-gray-500">
                    {steps.map((s, i) => (
                        <li key={s.label} className="flex items-center gap-2">
                            <div className={`flex items-center justify-center h-6 w-6 rounded-full border ${s.done ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {s.done ? <span className="material-symbols-outlined text-[14px] font-bold">check</span> : <span className="text-[10px] font-bold">{i + 1}</span>}
                            </div>
                            <span className={`font-medium ${s.done ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                            {i < steps.length - 1 && <div className={`w-8 h-[2px] rounded-full ${s.done ? 'bg-green-600' : 'bg-gray-200'}`}></div>}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions - Right */}
            <div className="flex items-center gap-3">
                {canApprove && (
                    <>
                        <button onClick={() => handleAction('Send Back')} className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Send Back</button>
                        <button onClick={() => handleAction('Reject')} className="px-4 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">Reject</button>
                        <button onClick={() => handleAction('Approve')} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check</span> Approve
                        </button>
                    </>
                )}
                <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
        </div>,
        portalContainer
    )}

    <div className="space-y-6 animate-fade-in pb-24">
       
       {/* TOP ROW: Request Info & Approval Chain */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
           {/* Request Info Card */}
           <div className="lg:col-span-2">
               <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                   <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary-600">info</span> Request Details
                   </h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                       <div><p className="text-gray-500 text-xs uppercase font-semibold">Applicant</p><p className="font-medium text-gray-900">{request.applicant}</p></div>
                       <div><p className="text-gray-500 text-xs uppercase font-semibold">Team/Dept</p><p className="font-medium text-gray-900">{request.team}</p></div>
                       <div><p className="text-gray-500 text-xs uppercase font-semibold">Date Submitted</p><p className="font-medium text-gray-900">{request.date}</p></div>
                       <div><p className="text-gray-500 text-xs uppercase font-semibold">Total Amount</p><p className="font-bold text-lg text-gray-900">${request.amount.toLocaleString()}</p></div>
                   </div>
                   {!isInvoice && (
                       <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                           <div><p className="text-gray-500 text-xs uppercase font-semibold">Vendor</p><p className="font-medium text-primary-600">{request.vendor}</p></div>
                           <div><p className="text-gray-500 text-xs uppercase font-semibold">Cost Category</p><p className="font-medium text-gray-900">Professional Fee</p></div>
                       </div>
                   )}
               </section>
           </div>

           {/* Approval Chain Card */}
           <div className="lg:col-span-1">
               <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                   <h2 className="text-lg font-bold text-gray-900 mb-4">Approval Chain</h2>
                   <div className="space-y-6 relative pl-2">
                       {/* Line */}
                       <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                       
                       <div className="flex items-center gap-3 relative z-10">
                           <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs border border-white shadow-sm">JS</div>
                           <div><p className="text-sm font-bold text-gray-900">{request.applicant}</p><p className="text-xs text-gray-500">Requestor • {request.date}</p></div>
                       </div>
                       <div className="flex items-center gap-3 relative z-10">
                           <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs border border-white shadow-sm">SM</div>
                           <div><p className="text-sm font-bold text-gray-900">Manager</p><p className="text-xs text-green-600 font-medium">Approved • Jul 21</p></div>
                       </div>
                       <div className="flex items-center gap-3 relative z-10">
                           <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm ${canApprove ? 'bg-white border-primary-500 text-primary-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                               {user?.initials || 'ME'}
                           </div>
                           <div>
                               <p className="text-sm font-bold text-gray-900">You ({user?.role})</p>
                               <p className={`text-xs font-bold ${canApprove ? 'text-primary-600' : 'text-gray-400'}`}>
                                   {canApprove ? 'Pending Action' : 'View Only'}
                               </p>
                           </div>
                       </div>
                   </div>
               </section>
           </div>
       </div>

       {/* BOTTOM ROW: Detailed Full Width Tables */}
       {isInvoice ? (
           // --- INVOICE APPROVAL VIEW ---
           <>
               {/* Reconciliation Card */}
               <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary-600">balance</span> 
                       Reconciliation & Budget Check
                   </h2>
                   
                   <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-semibold text-gray-700">Linked PO: {invoiceDetails.linkedPO}</span>
                           <a href="#" className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1">View PO <span className="material-symbols-outlined text-xs">open_in_new</span></a>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                           <div className="bg-white p-3 rounded border border-gray-100">
                               <p className="text-xs text-gray-500">PO Total</p>
                               <p className="font-bold text-gray-900">${invoiceDetails.poTotal.toLocaleString()}</p>
                           </div>
                           <div className="bg-white p-3 rounded border border-gray-100">
                               <p className="text-xs text-gray-500">Prev. Invoiced</p>
                               <p className="font-bold text-gray-900">${invoiceDetails.prevInvoiced.toLocaleString()}</p>
                           </div>
                           <div className="bg-blue-50 p-3 rounded border border-blue-100">
                               <p className="text-xs text-blue-600 font-bold">This Invoice</p>
                               <p className="font-bold text-blue-800">${invoiceDetails.currentInvoice.toLocaleString()}</p>
                           </div>
                           <div className={`p-3 rounded border ${isOverBudget ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                               <p className={`text-xs font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>Remaining</p>
                               <p className={`font-bold ${isOverBudget ? 'text-red-800' : 'text-green-800'}`}>${invoiceDetails.remaining.toLocaleString()}</p>
                           </div>
                       </div>

                       {isOverBudget && (
                           <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-100 px-3 py-2 rounded">
                               <span className="material-symbols-outlined text-sm">warning</span>
                               Alert: This invoice exceeds the remaining PO balance!
                           </div>
                       )}
                   </div>
               </section>

               {/* Invoice Details & Lines */}
               <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900 mb-4">Invoice Data & Allocation</h2>
                   <div className="grid grid-cols-2 gap-6 mb-6">
                       <div><span className="text-gray-500 text-xs block">Invoice Number</span><span className="font-bold text-gray-900">{invoiceDetails.invoiceNo}</span></div>
                       <div><span className="text-gray-500 text-xs block">Invoice Date</span><span className="font-bold text-gray-900">{invoiceDetails.invoiceDate}</span></div>
                   </div>
                   
                   <table className="w-full text-left text-sm border-t border-gray-100">
                       <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                           <tr>
                               <th className="py-2 px-3">Description</th>
                               {isFinanceUser && <th className="py-2 px-3">GL Code / Project</th>}
                               <th className="py-2 px-3 text-right">Amount</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {invoiceDetails.lineItems.map((line, idx) => (
                               <tr key={idx}>
                                   <td className="py-3 px-3">{line.desc}</td>
                                   {isFinanceUser && (
                                       <td className="py-3 px-3">
                                           <input 
                                               type="text" 
                                               defaultValue={line.code} 
                                               className="w-full border-gray-300 rounded text-xs px-2 py-1 font-mono focus:ring-primary-500"
                                           />
                                       </td>
                                   )}
                                   <td className="py-3 px-3 text-right font-medium">${line.amount.toFixed(2)}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                   {isFinanceUser && (
                       <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">edit</span>
                           GL Codes are editable for Finance team members only.
                       </div>
                   )}
               </section>
           </>
       ) : (
           // --- PROCUREMENT APPROVAL VIEW ---
           <>
               {/* 1. Vendor Comparison */}
               <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary-600">storefront</span>
                       Vendor Comparison
                   </h2>
                   <div className="overflow-x-auto rounded-lg border border-gray-200">
                       <table className="w-full text-left">
                           <thead>
                               <tr>
                                   <th className={headerClass + " text-center w-12"}>Selected</th>
                                   <th className={headerClass}>Vendor Name</th>
                                   <th className={headerClass}>Country</th>
                                   <th className={headerClass}>Grade</th>
                                   <th className={headerClass}>Currency</th>
                                   <th className={headerClass + " text-right"}>Est. Cost (USD)</th>
                                   <th className={headerClass}>Attachment</th>
                                   <th className={headerClass}>Note</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {procurementDetails.vendors.map(v => (
                                   <tr key={v.id} className={`${v.selected ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                                       <td className={cellClass + " text-center"}>
                                           {v.selected ? (
                                               <span className="material-symbols-outlined text-green-600 font-bold">check_circle</span>
                                           ) : (
                                               <span className="material-symbols-outlined text-gray-300">radio_button_unchecked</span>
                                           )}
                                       </td>
                                       <td className={`${cellClass} font-bold ${v.selected ? 'text-green-900' : ''}`}>{v.name}</td>
                                       <td className={cellClass}>{v.country}</td>
                                       <td className={cellClass}>{v.grade}</td>
                                       <td className={cellClass}>{v.currency}</td>
                                       <td className={cellClass + " text-right font-medium"}>
                                           {v.estCostUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                       </td>
                                       <td className={cellClass}>
                                           {v.attachment && (
                                               <a href="#" className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium">
                                                   <span className="material-symbols-outlined text-sm">attach_file</span> {v.attachment}
                                               </a>
                                           )}
                                       </td>
                                       <td className={cellClass + " text-xs text-gray-500 italic max-w-xs truncate"}>{v.note}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </section>

               {/* 2. Allocation Details (Direct vs Other) */}
               <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary-600">
                           {isDirectProcurement ? 'calculate' : 'pie_chart'}
                       </span>
                       {isDirectProcurement ? 'Cost & Margin Analysis' : 'Budget Allocation'}
                   </h2>
                   
                   <div className="overflow-x-auto rounded-lg border border-gray-200">
                       {isDirectProcurement ? (
                           // Direct Procurement Table (Detailed)
                           <table className="min-w-max text-left text-[11px] border-collapse">
                               <thead className="bg-gray-100">
                                   <tr>
                                       <th className={`${compactHeaderClass} sticky left-0 z-20 bg-gray-100 border-r`}>Client</th>
                                       <th className={compactHeaderClass}>Order Country</th>
                                       <th className={compactHeaderClass}>Insertion No.</th>
                                       <th className={compactHeaderClass}>PJ No. - Main</th>
                                       <th className={compactHeaderClass}>PJ No. - Sub</th>
                                       <th className={compactHeaderClass}>Report Ctry</th>
                                       <th className={compactHeaderClass}>BU</th>
                                       <th className={compactHeaderClass}>Prod</th>
                                       <th className={compactHeaderClass}>EDD</th>
                                       <th className={`${compactHeaderClass} text-right`}>Revenue</th>
                                       <th className={`${compactHeaderClass} text-right text-gray-500`}>Non-Revenue</th>
                                       <th className={`${compactHeaderClass} text-right text-gray-500`}>Exist. Proc.</th>
                                       <th className={`${compactHeaderClass} text-right text-gray-500`}>Exist. PT</th>
                                       <th className={`${compactHeaderClass} text-right w-24 bg-blue-50 text-blue-800`}>Cost</th>
                                       <th className={`${compactHeaderClass} text-right w-24 bg-blue-50 text-blue-800`}>Passthrough</th>
                                       <th className={`${compactHeaderClass} text-right bg-blue-50 text-blue-800`}>Cost (USD)</th>
                                       <th className={`${compactHeaderClass} text-right bg-blue-50 text-blue-800`}>PT (USD)</th>
                                       <th className={`${compactHeaderClass} text-right bg-gray-200 text-gray-800`}>Total Cost</th>
                                       <th className={`${compactHeaderClass} text-right bg-gray-200 text-gray-800`}>PT (Total)</th>
                                       <th className={`${compactHeaderClass} text-right bg-gray-200 text-gray-800`}>Total Cost (USD)</th>
                                       <th className={`${compactHeaderClass} text-right bg-gray-200 text-gray-800`}>PT (USD, Total)</th>
                                       <th className={`${compactHeaderClass} text-right bg-teal-50 text-teal-800`}>Margin %</th>
                                       {isFinanceUser && <th className={`${compactHeaderClass} w-32 border-l border-gray-300`}>GL Code</th>}
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-100">
                                   {procurementDetails.costLines.map((line, i) => {
                                       const totalCostLocal = (parseFloat(line.cost as any) || 0) + (parseFloat(line.existProc as any) || 0);
                                       const totalPtLocal = (parseFloat(line.pt as any) || 0) + (parseFloat(line.existPt as any) || 0);
                                       const totalCostUsd = line.costUsd + (parseFloat(line.existProc as any) || 0);
                                       const totalPtUsd = line.ptUsd + (parseFloat(line.existPt as any) || 0);
                                       const totalCostForMargin = totalCostUsd + totalPtUsd;
                                       const margin = line.revenue > 0 ? ((line.revenue - totalCostForMargin) / line.revenue) * 100 : 0;
                                       
                                       const pjParts = line.pjNo.split('-');
                                       const pjMain = pjParts.slice(0,3).join('-');
                                       const pjSub = pjParts[3] || 'a';

                                       return (
                                           <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                               <td className={`${compactCellClass} sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 font-bold text-gray-900`}>{line.client}</td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{line.orderCountry}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{line.insertionNo}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{pjMain}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{pjSub}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{line.reportCtry}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{line.bu}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{line.prod}</div></td>
                                               <td className={compactCellClass}><div className={readOnlyInputClass}>{line.edd}</div></td>
                                               <td className={compactCellClass}><div className={`${readOnlyInputClass} text-right font-semibold`}>{line.revenue.toLocaleString()}</div></td>
                                               <td className={compactCellClass}><div className={`${readOnlyInputClass} text-right text-gray-500`}>{line.nonRevenue.toLocaleString()}</div></td>
                                               <td className={compactCellClass}><div className={`${readOnlyInputClass} text-right text-gray-500`}>{line.existProc.toLocaleString()}</div></td>
                                               <td className={compactCellClass}><div className={`${readOnlyInputClass} text-right text-gray-500`}>{line.existPt.toLocaleString()}</div></td>
                                               <td className={`${compactCellClass} bg-blue-50/20`}>
                                                   <div className={readOnlyInputClass + " text-right"}>{line.cost}</div>
                                               </td>
                                               <td className={`${compactCellClass} bg-blue-50/20`}>
                                                   <div className={readOnlyInputClass + " text-right"}>{line.pt}</div>
                                               </td>
                                               <td className={`${compactCellClass} text-right bg-blue-50/30`}>
                                                   <div className={readOnlyInputClass}>{line.costUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                               </td>
                                               <td className={`${compactCellClass} text-right bg-blue-50/30`}>
                                                   <div className={readOnlyInputClass}>{line.ptUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                               </td>
                                               <td className={`${compactCellClass} text-right bg-gray-50 text-gray-700 font-medium`}>{totalCostLocal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                               <td className={`${compactCellClass} text-right bg-gray-50 text-gray-700 font-medium`}>{totalPtLocal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                               <td className={`${compactCellClass} text-right bg-gray-100 text-gray-900 font-bold`}>{totalCostUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                               <td className={`${compactCellClass} text-right bg-gray-100 text-gray-900 font-bold`}>{totalPtUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                               <td className={`${compactCellClass} text-right font-bold ${margin < 30 ? 'text-red-600 bg-red-50' : 'text-teal-600 bg-teal-50'}`}>
                                                   {margin.toFixed(1)}%
                                               </td>
                                               {isFinanceUser && (
                                                   <td className="px-2 py-1 border-b border-gray-100 border-l border-gray-300 bg-yellow-50/50">
                                                       <input 
                                                           type="text" 
                                                           defaultValue={line.glCode} 
                                                           className="w-full border-gray-300 rounded text-[10px] px-1 py-0.5 font-mono focus:ring-primary-500"
                                                       />
                                                   </td>
                                               )}
                                           </tr>
                                       );
                                   })}
                               </tbody>
                           </table>
                       ) : (
                           // Other Procurement Table (Budgets) - Detailed View
                           <table className="min-w-[1200px] w-full text-left text-[11px] whitespace-nowrap">
                               <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                                   <tr>
                                       <th className="px-2 py-2">Type</th>
                                       <th className="px-2 py-2">Case Name</th>
                                       <th className="px-2 py-2">BU</th>
                                       <th className="px-2 py-2">Ctry</th>
                                       <th className="px-2 py-2">Team</th>
                                       <th className="px-2 py-2 w-24 bg-primary-50 text-primary-800 font-bold border-l border-primary-100 text-right">Value</th>
                                       <th className="px-2 py-2 text-right text-gray-400">25B</th>
                                       <th className="px-2 py-2 text-right text-gray-400">Exist</th>
                                       <th className="px-2 py-2 w-12">Curr</th>
                                       <th className="px-2 py-2 text-right text-gray-400">Prior</th>
                                       <th className="px-2 py-2 text-right text-gray-400">This</th>
                                       <th className="px-2 py-2 text-right text-gray-400">Future</th>
                                       <th className="px-2 py-2 text-right font-semibold text-gray-700">Rem.</th>
                                       {isFinanceUser && <th className="px-2 py-2 w-32 border-l border-gray-300">GL Code</th>}
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-100">
                                   {procurementDetails.budgetLines.map((budget, i) => (
                                       <tr key={i} className="hover:bg-gray-50 transition-colors">
                                           <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.type}</div></td>
                                           <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.name}</div></td>
                                           <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.bu}</div></td>
                                           <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.country}</div></td>
                                           <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.team}</div></td>
                                           <td className="px-2 py-1 bg-primary-50/20 border-l border-primary-100 text-right font-bold text-primary-700">
                                               {budget.allocation.toLocaleString()}
                                           </td>
                                           <td className="px-2 py-1 text-right text-gray-500">{budget.cost25b.toLocaleString()}</td>
                                           <td className="px-2 py-1 text-right text-gray-500">{budget.existing.toLocaleString()}</td>
                                           <td className="px-2 py-1 text-center"><div className={readOnlyInputClass}>USD</div></td>
                                           <td className="px-2 py-1 text-right text-gray-500">{budget.prior.toLocaleString()}</td>
                                           <td className="px-2 py-1 text-right text-gray-500">{budget.thisYear.toLocaleString()}</td>
                                           <td className="px-2 py-1 text-right text-gray-500">{budget.future.toLocaleString()}</td>
                                           <td className="px-2 py-1 text-right font-medium text-gray-900 bg-gray-50">{budget.remaining.toLocaleString()}</td>
                                           {isFinanceUser && (
                                               <td className="px-2 py-1 border-b border-gray-100 border-l border-gray-300 bg-yellow-50/50">
                                                   <input type="text" className="w-full border-gray-300 rounded text-[10px] px-1 py-0.5 font-mono focus:ring-primary-500" />
                                               </td>
                                           )}
                                       </tr>
                                   ))}
                               </tbody>
                               <tfoot className="bg-gray-50 border-t border-gray-200 text-xs">
                                    <tr>
                                        <td colSpan={5} className="px-2 py-2 font-bold text-gray-900 text-right sticky left-0">Total Allocated:</td>
                                        <td className="px-2 py-2 text-right font-bold text-primary-700 border-l border-primary-200 bg-primary-50">
                                            {procurementDetails.budgetLines.reduce((acc, b) => acc + (b.allocation || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td colSpan={7}></td>
                                    </tr>
                                </tfoot>
                           </table>
                       )}
                   </div>
                   {isFinanceUser && (
                       <div className="mt-3 text-xs text-gray-500 text-right">
                           * Assign GL Codes before approving for PO Generation
                       </div>
                   )}
               </section>
           </>
       )}

       {/* Comment Modal */}
       {showActionModal && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95">
                   <div className="p-6">
                       <h3 className="text-lg font-bold text-gray-900 mb-4">{actionType} Request</h3>
                       <textarea className="w-full border-gray-300 rounded-lg p-3 text-sm h-32 focus:ring-primary-500" placeholder="Add a comment (optional)..."></textarea>
                       <div className="flex justify-end gap-3 mt-4">
                           <button onClick={() => setShowActionModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                           <button onClick={confirmAction} className={`px-4 py-2 text-white font-bold rounded-lg ${actionType === 'Reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}>Confirm</button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
    </>
  );
};

export default RequestDetail;
