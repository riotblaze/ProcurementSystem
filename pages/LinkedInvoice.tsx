
import React, { useState } from 'react';

const LinkedInvoice = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [procurementData, setProcurementData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Simulation Toggle for Demo purposes
  const [simulateType, setSimulateType] = useState('Direct'); 

  const handleSearch = () => {
      // Mock retrieval logic based on simulation toggle
      if (simulateType === 'Direct') {
          setProcurementData({
              type: 'Direct Procurement',
              orderNo: '10010',
              pjNo: 'SG-PFI-001a',
              client: 'Pfizer',
              bu: 'MC',
              vendor: 'Pfizer',
              items: [], // Cost Margin Items
              invoiceNo: '', invoiceDate: '', amount: 0
          });
      } else {
          setProcurementData({
              type: 'Other Procurement',
              orderNo: 'PO-OTH-555',
              pjNo: '-',
              client: 'Internal',
              bu: 'Marketing',
              vendor: 'Office Supplies Co.',
              items: [], // Budget Items
              invoiceNo: '', invoiceDate: '', amount: 0
          });
      }
  };

  const handleOCRScan = () => {
      if (!procurementData) return;
      setIsScanning(true);
      setTimeout(() => {
          const newData = { ...procurementData };
          newData.invoiceNo = 'INV-OCR-001';
          newData.invoiceDate = '2024-07-25';
          newData.amount = 2000.00;

          if (newData.type === 'Direct Procurement') {
              newData.items = [
                  { desc: 'SG-PFI-001a', costCat: 'Professional Fee', cost: 1500.00, pt: 0.00 },
                  { desc: 'SG-PFI-002b', costCat: 'Hardware', cost: 500.00, pt: 0.00 }
              ];
          } else {
              newData.items = [
                  { budget: 'Marketing Q3', bu: 'Marketing', category: 'Office Supplies', allocation: 1200.00 },
                  { budget: 'IT Infra', bu: 'IT', category: 'Hardware', allocation: 800.00 }
              ];
          }
          setProcurementData(newData);
          setIsScanning(false);
      }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
           <div>
               <h1 className="text-2xl font-bold text-gray-900">Linked Invoice Entry</h1>
               <p className="text-gray-500 mt-1">Create an invoice linked to an existing procurement record.</p>
           </div>
           <div className="flex items-center gap-2">
               <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
               <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Submit Approval</button>
           </div>
       </div>

       {/* Search Section */}
       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
           {/* Simulation Controls (For Demo) */}
           <div className="flex gap-4 items-center text-sm border-b border-gray-100 pb-4 mb-2">
               <span className="text-gray-500 font-semibold uppercase text-xs">Simulate Retrieval:</span>
               <label className="flex items-center gap-2 cursor-pointer">
                   <input type="radio" name="simType" checked={simulateType === 'Direct'} onChange={() => setSimulateType('Direct')} /> Direct Procurement
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                   <input type="radio" name="simType" checked={simulateType === 'Other'} onChange={() => setSimulateType('Other')} /> Other Procurement
               </label>
           </div>

           <div className="flex gap-4">
               <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Search Procurement Record</label>
                   <div className="relative">
                       <input 
                            type="text" 
                            placeholder="Enter PR Number (e.g., PR-2024-001)" 
                            className="w-full pl-10 border-gray-300 rounded-lg text-sm focus:ring-primary-500 h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                       />
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                   </div>
               </div>
               <div className="flex items-end">
                   <button onClick={handleSearch} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors h-10">Retrieve</button>
               </div>
           </div>
       </div>

       {procurementData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="lg:col-span-2 space-y-6">
                {/* Invoice Details */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    {isScanning && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-4xl text-primary-600 animate-spin">autorenew</span>
                            <p className="mt-2 font-bold text-primary-700">Scanning Invoice...</p>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-900">Invoice Details</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${procurementData.type === 'Direct Procurement' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                {procurementData.type}
                            </span>
                        </div>
                        <button onClick={handleOCRScan} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-sm bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-lg">document_scanner</span> Scan Invoice (OCR)
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Vendor</label>
                            <input type="text" readOnly value={procurementData.vendor} className="w-full bg-gray-100 border-transparent rounded text-sm text-gray-700 font-medium px-3 py-2" />
                        </div>
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice #</label>
                            <input type="text" placeholder="Enter invoice number" defaultValue={procurementData.invoiceNo} className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</label>
                            <input type="date" defaultValue={procurementData.invoiceDate} className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</label>
                            <input type="date" className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
                             <select className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2"><option>USD</option></select>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Amount</label>
                             <input type="number" placeholder="0.00" defaultValue={procurementData.amount} className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2" />
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax Amount</label>
                             <input type="number" placeholder="0.00" className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2" />
                        </div>
                    </div>
                </div>

                {/* Conditional Tables based on Type */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    {procurementData.type === 'Direct Procurement' ? (
                        <>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-600">calculate</span> Cost & Margin Calculation
                            </h2>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Client/Project</th>
                                            <th className="px-4 py-3 font-semibold">Cost Category</th>
                                            <th className="px-4 py-3 font-semibold text-right">Cost</th>
                                            <th className="px-4 py-3 font-semibold text-right">Passthrough</th>
                                            <th className="px-4 py-3 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {procurementData.items.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{item.desc}</td>
                                                <td className="px-4 py-2">
                                                    <input type="text" defaultValue={item.costCat} className="w-full border-gray-200 rounded text-sm py-1" />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <input type="number" defaultValue={item.cost} className="w-full border-gray-200 rounded text-sm text-right py-1" />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <input type="number" defaultValue={item.pt} className="w-full border-gray-200 rounded text-sm text-right py-1" />
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold text-gray-900">{(item.cost + item.pt).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {procurementData.items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400 italic">No lines available.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-600">pie_chart</span> Budget Allocation
                            </h2>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Budget Name</th>
                                            <th className="px-4 py-3 font-semibold">BU</th>
                                            <th className="px-4 py-3 font-semibold">Category</th>
                                            <th className="px-4 py-3 font-semibold text-right">Allocation Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {procurementData.items.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{item.budget}</td>
                                                <td className="px-4 py-2">{item.bu}</td>
                                                <td className="px-4 py-2">{item.category}</td>
                                                <td className="px-4 py-2 text-right bg-primary-50/30">
                                                    <input type="number" defaultValue={item.allocation} className="w-32 border-primary-200 rounded text-sm text-right py-1 font-bold text-primary-700" />
                                                </td>
                                            </tr>
                                        ))}
                                        {procurementData.items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400 italic">No budgets allocated.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
           </div>

           <div className="lg:col-span-1 space-y-6">
                {/* Linked Procurement Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <h2 className="text-lg font-bold text-gray-900 mb-4">Linked Procurement</h2>
                     <div className="text-sm space-y-3 text-gray-600">
                         <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Order No:</span> <span className="font-medium text-gray-900">{procurementData.orderNo}</span></div>
                         <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">PJ No:</span> <span className="font-medium text-gray-900">{procurementData.pjNo}</span></div>
                         <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Client:</span> <span className="font-medium text-gray-900">{procurementData.client}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">BU:</span> <span className="font-medium text-gray-900">{procurementData.bu}</span></div>
                     </div>
                     <a href="#" className="inline-flex items-center gap-1 mt-6 text-sm font-bold text-primary-600 hover:underline">
                         View Full Record <span className="material-symbols-outlined text-base">open_in_new</span>
                     </a>
                </div>
           </div>
        </div>
       )}
    </div>
  );
};

export default LinkedInvoice;