
import React, { useState } from 'react';

// Mock data for search results (Budgets)
const budgetDatabase = [
  { id: 101, name: 'Marketing Q3', bu: 'Marketing', country: 'Singapore', team: 'Digital Marketing', category: 'Office Supplies', cost25b: 625, existing: 2000, prior: 0, thisYear: 3000, future: 0, remaining: 1000 },
  { id: 102, name: 'IT Infrastructure Upgrade', bu: 'IT', country: 'Singapore', team: 'Infra', category: 'Hardware', cost25b: 5000, existing: 12000, prior: 1000, thisYear: 50000, future: 10000, remaining: 38000 },
  { id: 103, name: 'Sales Kickoff 2024', bu: 'Sales', country: 'Malaysia', team: 'Events', category: 'Travel', cost25b: 0, existing: 500, prior: 0, thisYear: 15000, future: 0, remaining: 14500 },
];

// Vendor Mock Data
const existingVendors = [
  { id: 1, name: 'Office Supplies Co.', country: 'Singapore', grade: 'Grade A', address: '123 Business Park', reg: '202101234A', payment: 'DBS 123-456' },
  { id: 2, name: 'Staples & More', country: 'Singapore', grade: 'Grade B', address: '456 Tech Park', reg: '202105678B', payment: 'UOB 987-654' },
];

const OtherProcurement = () => {
  // State for Vendors
  const [vendors, setVendors] = useState<any[]>([
    { ...existingVendors[0], type: 'Corporate', contacts: [{ name: '', pos: '', email: '', phone: '' }] }
  ]);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState<number | null>(0); 
  const [requestCostCategory, setRequestCostCategory] = useState('Office Supplies');

  // State for Budget Search (Top Bar)
  const [budgetType, setBudgetType] = useState('Budget');
  const [budgetSearchTerm, setBudgetSearchTerm] = useState('');
  const [showBudgetSearch, setShowBudgetSearch] = useState(false);

  // State for Selected Budgets (Matrix)
  const [budgets, setBudgets] = useState<any[]>([
    { ...budgetDatabase[0], allocation: 625, allocationUsd: 460, type: 'Budget' },
  ]);

  // Vendor Logic
  const addVendor = (vendor: any) => {
    if (vendors.length >= 5) return;
    setVendors([...vendors, { ...vendor, type: 'Corporate', contacts: [] }]);
  };

  const removeVendor = (index: number) => {
    setVendors(vendors.filter((_, i) => i !== index));
    if (selectedVendorIndex === index) setSelectedVendorIndex(null);
  };

  const addContact = (vendorIndex: number) => {
    const newVendors = [...vendors];
    newVendors[vendorIndex].contacts.push({ name: '', pos: '', email: '', phone: '' });
    setVendors(newVendors);
  };

  // Budget Logic
  const handleBudgetSearch = (term: string) => {
      setBudgetSearchTerm(term);
      setShowBudgetSearch(true);
  };

  const selectBudgetFromSearch = (budget: any) => {
      setBudgets([...budgets, { ...budget, type: budgetType, allocation: 0, allocationUsd: 0 }]);
      setBudgetSearchTerm('');
      setShowBudgetSearch(false);
  };

  const addManualBudget = () => {
      // Logic for "Unbudget" or manual entry if not found
      setBudgets([...budgets, { 
          id: Date.now(), 
          type: budgetType,
          name: budgetSearchTerm || 'New Budget Line', 
          bu: '', country: '', team: '', category: '', 
          cost25b: 0, existing: 0, prior: 0, thisYear: 0, future: 0, remaining: 0, 
          allocation: 0, allocationUsd: 0 
      }]);
      setBudgetSearchTerm('');
      setShowBudgetSearch(false);
  }

  const allocateProportionally = () => {
      if (selectedVendorIndex === null) return;
      const totalCost = selectedVendorIndex === 0 ? 1250 : 1320.50; 
      const count = budgets.length;
      if (count === 0) return;
      const split = totalCost / count;
      const newBudgets = budgets.map(b => ({
          ...b,
          allocation: split.toFixed(2),
          allocationUsd: (split * 0.74).toFixed(2) 
      }));
      setBudgets(newBudgets);
  };

  const removeBudgetLine = (index: number) => {
      setBudgets(budgets.filter((_, i) => i !== index));
  };

  const updateBudgetField = (index: number, field: string, value: any) => {
      const newBudgets = [...budgets];
      newBudgets[index][field] = value;
      setBudgets(newBudgets);
  };

  const getTotalAllocated = () => budgets.reduce((acc, curr) => acc + (parseFloat(curr.allocation) || 0), 0);
  const selectedVendorCost = selectedVendorIndex !== null ? (selectedVendorIndex === 0 ? 1250 : 1320.50) : 0;
  const isOverBudget = getTotalAllocated() > selectedVendorCost + 0.01;
  const hasUnbudgeted = budgets.some(b => b.type === 'Unbudget');

  // Styles
  const editableInputClass = "w-full border-gray-300 rounded text-xs px-2 py-1 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow";
  const readOnlyInputClass = "w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1 truncate";

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Other Procurement Request</h1>
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">Draft</span>
           </div>
           <p className="text-gray-500">Create new procurement requests for overhead and administrative purposes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">Save as Draft</button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">Submit for Approval</button>
        </div>
      </div>

      {/* Request Info */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">info</span>
            Request Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">User</label>
            <div className={readOnlyInputClass}>John Doe</div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</label>
            <div className={readOnlyInputClass}>MIMS PTE LTD</div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost Category</label>
            <select 
                value={requestCostCategory}
                onChange={(e) => setRequestCostCategory(e.target.value)}
                className={editableInputClass}
            >
                <option>Office Supplies</option>
                <option>IT Equipment</option>
                <option>Travel & Ent</option>
            </select>
          </div>
           <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsible Team</label>
            <div className={readOnlyInputClass}>Marketing Team</div>
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">CC Recipients</label>
            <input type="text" placeholder="Add emails, separated by commas" className={editableInputClass} />
          </div>
        </div>
      </section>

      {/* Vendor Details */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">storefront</span>
            Vendor Details & Comparison
        </h2>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {vendors.map((vendor, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5 space-y-6 bg-white shadow-sm hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Vendor {String.fromCharCode(65 + index)}</h3>
                            <div className="mt-2 inline-flex bg-gray-100 p-1 rounded-lg">
                                <button className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendor.type === 'Corporate' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Corporate</button>
                                <button className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendor.type === 'Individual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Individual</button>
                            </div>
                        </div>
                        <button onClick={() => removeVendor(index)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                    <div className="space-y-4 pb-4 border-b border-gray-100">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-500">Vendor Name</label>
                            <input type="text" value={vendor.name} readOnly className={readOnlyInputClass} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                 <label className="block text-xs font-medium text-gray-500">Vendor Country</label>
                                 <input type="text" value={vendor.country} readOnly className={readOnlyInputClass} />
                            </div>
                             <div className="space-y-1">
                                 <label className="block text-xs font-medium text-gray-500">Vendor Grade</label>
                                 <div className={readOnlyInputClass}>{vendor.grade}</div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-500">Vendor Address</label>
                            <div className={readOnlyInputClass}>{vendor.address}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-500">Registration No.</label>
                                <div className={readOnlyInputClass}>{vendor.reg}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-500">Payment Info</label>
                                <div className={readOnlyInputClass}>{vendor.payment}</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => addContact(index)} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-primary-600 text-sm font-medium hover:bg-primary-50 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">add</span> Add Contact
                    </button>
                </div>
            ))}
            {vendors.length < 5 && (
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl flex flex-col p-6 min-h-[300px] bg-gray-50/50 justify-center items-center cursor-pointer hover:border-primary-400 transition-colors" onClick={() => addVendor(existingVendors[1])}>
                   <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">add_business</span>
                   <p className="text-sm font-medium text-gray-500">Add another vendor</p>
                </div>
            )}
        </div>
      </section>

      {/* Vendor Estimations */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">attach_money</span>
            Vendor Estimations
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                          <th className="px-4 py-3 w-12 text-center">Select</th>
                          <th className="px-4 py-3">Vendor Name</th>
                          <th className="px-4 py-3">Currency</th>
                          <th className="px-4 py-3">Cost</th>
                          <th className="px-4 py-3">Cost (USD)</th>
                          <th className="px-4 py-3">Pass through cost (USD)</th>
                          <th className="px-4 py-3">Note</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {vendors.map((vendor, idx) => (
                          <tr key={idx} className={selectedVendorIndex === idx ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                              <td className="px-4 py-3 text-center">
                                  <input type="radio" name="vendorSelection" checked={selectedVendorIndex === idx} onChange={() => setSelectedVendorIndex(idx)} className="text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer" />
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900">{vendor.name}</td>
                              <td className="px-4 py-3"><select className={editableInputClass + " py-1.5"}><option>USD</option></select></td>
                              <td className="px-4 py-3"><input type="text" defaultValue={idx === 0 ? "1,250.00" : ""} className={editableInputClass + " py-1.5 text-right"} /></td>
                              <td className="px-4 py-3"><input type="text" defaultValue={idx === 0 ? "1,250.00" : ""} className={readOnlyInputClass + " text-right bg-transparent border-0"} readOnly /></td>
                              <td className="px-4 py-3"><input type="text" defaultValue="0.00" className={editableInputClass + " py-1.5 text-right"} /></td>
                              <td className="px-4 py-3"><input type="text" placeholder="Add note..." className={editableInputClass + " py-1.5"} /></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </section>

      {/* Budget Allocation */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
               <div>
                   <h2 className="text-lg font-bold text-gray-900">Budget Allocation</h2>
                   <p className="text-sm text-gray-500 mt-1">Allocate the total request amount to one or more budgets.</p>
               </div>
               <div className="flex gap-2">
                   <button onClick={allocateProportionally} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                       <span className="material-symbols-outlined text-lg">calculate</span> Allocate Proportionally
                   </button>
               </div>
           </div>

           {/* Add Budget Bar */}
           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 flex gap-2 items-center">
               <div className="w-40">
                   <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
                   <select 
                       value={budgetType}
                       onChange={(e) => setBudgetType(e.target.value)}
                       className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500"
                   >
                       <option>Budget</option>
                       <option>Unbudget</option>
                   </select>
               </div>
               <div className="flex-1 relative">
                   <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search Budget / Case Name</label>
                   <input 
                       type="text" 
                       placeholder="Start typing to search..." 
                       className="w-full border-gray-300 rounded-lg text-sm pl-10 focus:ring-primary-500"
                       value={budgetSearchTerm}
                       onChange={(e) => handleBudgetSearch(e.target.value)}
                   />
                   <span className="absolute left-3 top-[2.1rem] text-gray-400 material-symbols-outlined text-lg">search</span>
                   
                   {/* Search Dropdown */}
                   {showBudgetSearch && budgetSearchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                            {budgetDatabase.filter(b => b.name.toLowerCase().includes(budgetSearchTerm.toLowerCase())).map(b => (
                                <div key={b.id} onClick={() => selectBudgetFromSearch(b)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                                    <p className="font-bold text-sm text-gray-900">{b.name}</p>
                                    <p className="text-xs text-gray-500">{b.bu} • {b.team}</p>
                                </div>
                            ))}
                            <div onClick={addManualBudget} className="p-3 hover:bg-blue-50 cursor-pointer text-primary-600 font-medium text-sm border-t border-gray-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">add</span> Use '{budgetSearchTerm}' as manual entry
                            </div>
                        </div>
                   )}
               </div>
               <div className="self-end">
                   <button onClick={addManualBudget} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-sm h-[38px]">
                       Add
                   </button>
               </div>
           </div>

           {/* Table */}
           <div className="overflow-x-auto rounded-lg border border-gray-200 pb-1">
                <table className="min-w-[1200px] w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-2 py-2 sticky left-0 bg-gray-100 z-10 border-r border-gray-200 w-8"></th>
                            <th className="px-2 py-2">Type</th>
                            <th className="px-2 py-2">Case Name</th>
                            <th className="px-2 py-2">BU</th>
                            <th className="px-2 py-2">Ctry</th>
                            <th className="px-2 py-2">Team</th>
                            <th className="px-2 py-2">Cat.</th>
                            <th className="px-2 py-2 w-24 bg-primary-50 text-primary-800 font-bold border-l border-primary-100 text-right">Value</th>
                            <th className="px-2 py-2 text-right text-gray-400">25B</th>
                            <th className="px-2 py-2 text-right text-gray-400">Exist</th>
                            <th className="px-2 py-2 w-12">Curr</th>
                            <th className="px-2 py-2 text-right text-gray-400">Prior</th>
                            <th className="px-2 py-2 text-right text-gray-400">This</th>
                            <th className="px-2 py-2 text-right text-gray-400">Future</th>
                            <th className="px-2 py-2 text-right font-semibold text-gray-700">Rem.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {budgets.map((budget, idx) => (
                            <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-2 py-1 sticky left-0 bg-white z-10 border-r border-gray-100 text-center">
                                    <button onClick={() => removeBudgetLine(idx)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>
                                </td>
                                <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.type}</div></td>
                                <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.name || '-'}</div></td>
                                <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.bu || '-'}</div></td>
                                <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.country || '-'}</div></td>
                                <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.team || '-'}</div></td>
                                <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.category || '-'}</div></td>
                                <td className="px-2 py-1 bg-primary-50/20 border-l border-primary-100">
                                    <input 
                                        type="text" 
                                        value={budget.allocation} 
                                        onChange={(e) => updateBudgetField(idx, 'allocation', e.target.value)}
                                        className="w-full border-primary-300 rounded text-xs font-bold text-right focus:ring-primary-500 text-primary-700 bg-white px-1 py-1"
                                    />
                                </td>
                                <td className="px-2 py-1 text-right text-gray-500">{budget.cost25b}</td>
                                <td className="px-2 py-1 text-right text-gray-500">{budget.existing}</td>
                                <td className="px-2 py-1 text-center"><div className={readOnlyInputClass}>USD</div></td>
                                <td className="px-2 py-1 text-right text-gray-500">{budget.prior}</td>
                                <td className="px-2 py-1 text-right text-gray-500">{budget.thisYear}</td>
                                <td className="px-2 py-1 text-right text-gray-500">{budget.future}</td>
                                <td className="px-2 py-1 text-right font-medium text-gray-900 bg-gray-50">{budget.remaining}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200 text-xs">
                        <tr>
                            <td colSpan={7} className="px-2 py-2 font-bold text-gray-900 text-right sticky left-0">Total Allocated:</td>
                            <td className="px-2 py-2 text-right font-bold text-primary-700 border-l border-primary-200 bg-primary-50">
                                {getTotalAllocated().toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td colSpan={7}></td>
                        </tr>
                    </tfoot>
                </table>
           </div>

           <div className="flex justify-between items-center mt-4">
                {isOverBudget ? (
                    <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium">
                        <span className="material-symbols-outlined fill">warning</span>
                        Request exceeds remaining budget by ${(getTotalAllocated() - selectedVendorCost).toFixed(2)}
                    </div>
                ) : <div></div>}
                
                <div className="text-right">
                   <p className="text-xs uppercase font-bold text-gray-500">Unallocated Amount</p>
                   <p className={`text-xl font-bold ${Math.abs(selectedVendorCost - getTotalAllocated()) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                       ${(selectedVendorCost - getTotalAllocated()).toLocaleString(undefined, {minimumFractionDigits: 2})}
                   </p>
               </div>
           </div>
      </section>

      {/* Justification */}
      {(isOverBudget || hasUnbudgeted) && (
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-600">comment</span>
                Justification (Required)
              </h2>
              <textarea rows={4} className={editableInputClass + " p-3 resize-none text-sm"} placeholder="Provide a clear reason for this request..."></textarea>
          </section>
      )}
    </div>
  );
};

export default OtherProcurement;
