
import React, { useState, useEffect } from 'react';

// --- Shared Mock Data for Search ---
const budgetDatabase = [
  { id: 101, name: 'Marketing Q3', bu: 'Marketing', country: 'Singapore', team: 'Digital Marketing', category: 'Office Supplies', cost25b: 625, existing: 2000, prior: 0, thisYear: 3000, future: 0, remaining: 1000 },
  { id: 102, name: 'IT Infrastructure Upgrade', bu: 'IT', country: 'Singapore', team: 'Infra', category: 'Hardware', cost25b: 5000, existing: 12000, prior: 1000, thisYear: 50000, future: 10000, remaining: 38000 },
  { id: 103, name: 'Sales Kickoff 2024', bu: 'Sales', country: 'Malaysia', team: 'Events', category: 'Travel', cost25b: 0, existing: 500, prior: 0, thisYear: 15000, future: 0, remaining: 14500 },
  { id: 104, name: 'Q4 Recruitment', bu: 'HR', country: 'Singapore', team: 'Recruitment', category: 'Services', cost25b: 2000, existing: 1500, prior: 0, thisYear: 10000, future: 0, remaining: 8500 },
];

const availableProjects = [
    { projectId: 'p1', pjNoMain: 'SG-PR-001', pjNoSub: 'a', client: 'AstraZeneca', bu: 'MC', prod: 'Customised PJ', revenue: 3000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-001', insertionNo: 'INS-001', reportCtry: 'Singapore', edd: '2024-12-31' },
    { projectId: 'p2', pjNoMain: 'SG-PR-002', pjNoSub: 'b', client: 'Pfizer', bu: 'MIMS', prod: 'Webinar', revenue: 5500.00, orderCountry: 'Malaysia', orderNo: 'ORD-2024-002', insertionNo: 'INS-002', reportCtry: 'Malaysia', edd: '2024-12-31' },
    { projectId: 'p3', pjNoMain: 'SG-PR-003', pjNoSub: 'c', client: 'Novartis', bu: 'MPF', prod: 'Campaign', revenue: 12000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-003', insertionNo: 'INS-003', reportCtry: 'Singapore', edd: '2024-12-31' },
];

// --- Unlinked Invoice Component ---
const UnlinkedInvoice = () => {
  const [invoiceType, setInvoiceType] = useState('Direct Procurement');
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [isAdvancedPayment, setIsAdvancedPayment] = useState(false);

  // Vendor State
  const [vendorData, setVendorData] = useState<any>({ name: '', country: '', grade: '', address: '', reg: '', payment: '', type: 'Corporate' });
  const [showVendorSearch, setShowVendorSearch] = useState(false);
  const [newVendorSearchTerm, setNewVendorSearchTerm] = useState('');

  // Project State (Direct)
  const [projectFilters, setProjectFilters] = useState({ no: '', client: '', country: '', bu: '' });
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [costLines, setCostLines] = useState<any[]>([]); // Rows in Cost & Margin Table

  // Budget State (Other)
  const [budgetFilters, setBudgetFilters] = useState({ name: '', country: '', bu: '', team: '' });
  const [budgetLines, setBudgetLines] = useState<any[]>([]); // Rows in Budget Allocation Table

  // --- Handlers ---

  // Vendor
  const handleSwapVendor = (newName: string, isExisting: boolean = false) => {
      if (isExisting) {
           setVendorData({
              name: newName,
              country: 'Singapore', 
              grade: 'Grade A',
              address: '123 Existing Rd, Singapore',
              reg: '202055555X',
              payment: 'DBS 123-999-000',
              type: 'Corporate'
          });
      } else {
          setVendorData({
              name: newName,
              country: 'Singapore',
              grade: 'New',
              address: '',
              reg: '',
              payment: '',
              type: 'Corporate'
          });
      }
      setShowVendorSearch(false);
      setNewVendorSearchTerm('');
  };

  // Direct Procurement (Project Selection)
  const toggleProject = (projectId: string) => {
      setSelectedProjectIds(prev => 
          prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
      );
  };

  useEffect(() => {
      // Rebuild costLines based on selection, preserving existing inputs if possible
      const newLines = selectedProjectIds.map(pid => {
          const existing = costLines.find(l => l.projectId === pid);
          if (existing) return existing;
          const proj = availableProjects.find(p => p.projectId === pid);
          return {
              ...proj,
              nonRevenue: 0, existingProc: 0, existingPt: 0, // No existing data for unlinked
              cost: 0, passthrough: 0, costUsd: 0, ptUsd: 0
          };
      });
      setCostLines(newLines);
  }, [selectedProjectIds]);

  const handleCostChange = (projectId: string, field: string, val: string) => {
      const num = parseFloat(val) || 0;
      setCostLines(prev => prev.map(l => {
          if (l.projectId === projectId) {
              const updated = { ...l, [field]: num };
              if (field === 'cost') updated.costUsd = num * 0.74; // Mock rate
              if (field === 'passthrough') updated.ptUsd = num * 0.74;
              return updated;
          }
          return l;
      }));
  };

  // Other Procurement (Budget Allocation)
  const toggleBudget = (budget: any) => {
      setBudgetLines(prev => {
          if (prev.find(b => b.id === budget.id)) return prev.filter(b => b.id !== budget.id);
          return [...prev, { ...budget, allocation: 0, type: 'Budget' }];
      });
  };

  const addManualBudget = () => {
      const newManual = {
        id: `manual_${Date.now()}`, type: 'Unbudget', name: 'New Item', bu: 'Marketing', country: 'Singapore', team: '-', category: 'Misc',
        cost25b: 0, existing: 0, prior: 0, thisYear: 0, future: 0, remaining: 0, allocation: 0
      };
      setBudgetLines([...budgetLines, newManual]);
  };

  const updateBudgetLine = (id: string | number, field: string, val: string) => {
      setBudgetLines(prev => prev.map(l => l.id === id ? { ...l, [field]: field === 'allocation' ? (parseFloat(val) || 0) : val } : l));
  };

  const allocateByRatio = () => {
      if (invoiceAmount <= 0) return;
      const valid = budgetLines.filter(l => l.type === 'Budget' && l.remaining > 0);
      const totalRem = valid.reduce((sum, l) => sum + l.remaining, 0);
      if (totalRem === 0) return;
      setBudgetLines(prev => prev.map(l => {
          if (l.type === 'Budget' && l.remaining > 0) {
              return { ...l, allocation: parseFloat((invoiceAmount * (l.remaining / totalRem)).toFixed(2)) };
          }
          return l;
      }));
  };

  // --- Filter Logic ---
  const filteredProjects = availableProjects.filter(p => 
      (!projectFilters.no || (p.pjNoMain + '-' + p.pjNoSub).toLowerCase().includes(projectFilters.no.toLowerCase())) &&
      (!projectFilters.client || p.client === projectFilters.client) &&
      (!projectFilters.country || p.orderCountry === projectFilters.country) &&
      (!projectFilters.bu || p.bu === projectFilters.bu)
  );

  const filteredBudgets = budgetDatabase.filter(b => {
      return (!budgetFilters.name || b.name.toLowerCase().includes(budgetFilters.name.toLowerCase())) &&
             (!budgetFilters.country || b.country.toLowerCase().includes(budgetFilters.country.toLowerCase())) &&
             (!budgetFilters.bu || b.bu.toLowerCase().includes(budgetFilters.bu.toLowerCase())) &&
             (!budgetFilters.team || b.team.toLowerCase().includes(budgetFilters.team.toLowerCase()));
  });

  // Helpers
  const uniqueClients = Array.from(new Set(availableProjects.map(p => p.client)));
  const uniqueCountries = Array.from(new Set(availableProjects.map(p => p.orderCountry)));
  const uniqueBUs = Array.from(new Set(availableProjects.map(p => p.bu)));
  const uniqueBudgetCountries = Array.from(new Set(budgetDatabase.map(b => b.country)));
  const uniqueBudgetBUs = Array.from(new Set(budgetDatabase.map(b => b.bu)));

  // Styles
  const headerClass = "px-2 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap";
  const cellClass = "px-2 py-1 border-b border-gray-100 whitespace-nowrap";
  const editableCellInputClass = "w-full bg-transparent border-none text-right text-xs focus:ring-2 focus:ring-primary-500 rounded px-1 py-1 font-semibold text-gray-900";
  const readOnlyInputClass = "w-full border-transparent bg-transparent rounded text-[10px] text-gray-700 font-medium px-1 py-1 truncate cursor-default";

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Invoice Type Selection - Compact */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex gap-4">
               <label className={`flex-1 flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-all ${invoiceType === 'Direct Procurement' ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                   <input type="radio" name="type" value="Direct Procurement" checked={invoiceType === 'Direct Procurement'} onChange={(e) => setInvoiceType(e.target.value)} className="text-primary-600 focus:ring-primary-500" />
                   <span className="font-bold text-sm text-gray-900">Direct Procurement Invoice</span>
               </label>
               <label className={`flex-1 flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-all ${invoiceType === 'Other Procurement' ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                   <input type="radio" name="type" value="Other Procurement" checked={invoiceType === 'Other Procurement'} onChange={(e) => setInvoiceType(e.target.value)} className="text-primary-600 focus:ring-primary-500" />
                   <span className="font-bold text-sm text-gray-900">Other Procurement Invoice</span>
               </label>
          </div>
      </section>

      {/* Justification - Compact */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Justification for unlinked invoice <span className="text-red-500">*</span>
          </label>
          <textarea rows={2} className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 px-3 py-2" placeholder="Reason for direct invoice submission..."></textarea>
      </section>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
          {/* Vendor Details */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="flex justify-between items-start mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-600">storefront</span> Vendor Details
                    </h2>
                    <div className="relative z-20">
                        {showVendorSearch ? (
                            <div className="flex flex-col animate-in fade-in slide-in-from-right-2">
                                <div className="flex items-center gap-2">
                                    <input type="text" autoFocus placeholder="Search or add new..." value={newVendorSearchTerm} onChange={(e) => setNewVendorSearchTerm(e.target.value)} className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 w-64 h-9" />
                                    <button onClick={() => { setShowVendorSearch(false); setNewVendorSearchTerm(''); }} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                                </div>
                                {newVendorSearchTerm && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        <div onClick={() => handleSwapVendor(newVendorSearchTerm, false)} className="p-2.5 hover:bg-blue-50 cursor-pointer text-primary-600 font-medium text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">add_business</span> Create new '{newVendorSearchTerm}'</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => setShowVendorSearch(true)} className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"><span className="material-symbols-outlined text-base">search</span> Search Vendor</button>
                        )}
                    </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500 block">Vendor Name</label><input type="text" value={vendorData.name} onChange={(e) => setVendorData({...vendorData, name: e.target.value})} className="w-full border-gray-300 rounded text-xs px-2 py-1.5 font-bold text-gray-900" /></div>
                      <div><label className="text-xs text-gray-500 block">Country</label><input type="text" value={vendorData.country} onChange={(e) => setVendorData({...vendorData, country: e.target.value})} className="w-full border-gray-300 rounded text-xs px-2 py-1.5" /></div>
                      <div><label className="text-xs text-gray-500 block">Address</label><input type="text" value={vendorData.address} onChange={(e) => setVendorData({...vendorData, address: e.target.value})} className="w-full border-gray-300 rounded text-xs px-2 py-1.5" /></div>
                      <div><label className="text-xs text-gray-500 block">Registration No.</label><input type="text" value={vendorData.reg} onChange={(e) => setVendorData({...vendorData, reg: e.target.value})} className="w-full border-gray-300 rounded text-xs px-2 py-1.5" /></div>
                  </div>
              </div>
          </section>

          {/* Invoice Details */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice #</label><input type="text" className="w-full border-gray-300 rounded text-sm px-3 py-2" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</label><input type="date" className="w-full border-gray-300 rounded text-sm px-3 py-2" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label><select className="w-full border-gray-300 rounded text-sm px-3 py-2"><option>USD</option></select></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Amount</label><input type="number" value={invoiceAmount} onChange={(e) => setInvoiceAmount(parseFloat(e.target.value)||0)} className="w-full border-gray-300 rounded text-sm px-3 py-2" /></div>
                  <div className="md:col-span-2 flex items-center gap-2"><input type="checkbox" checked={isAdvancedPayment} onChange={(e) => setIsAdvancedPayment(e.target.checked)} className="rounded text-primary-600" /><label className="text-sm font-medium">Flag as Advanced Payment</label></div>
              </div>
          </section>

          {/* Dynamic Section: Direct vs Other */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              {invoiceType === 'Direct Procurement' ? (
                  <>
                      <div className="mb-6 border-b border-gray-100 pb-6">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-primary-600">folder_open</span> Project Details</h2>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                              <input type="text" placeholder="Project No" value={projectFilters.no} onChange={(e) => setProjectFilters({...projectFilters, no: e.target.value})} className="border-gray-300 rounded text-xs h-9" />
                              <select onChange={(e) => setProjectFilters({...projectFilters, client: e.target.value})} className="border-gray-300 rounded text-xs h-9"><option value="">All Clients</option>{uniqueClients.map(c => <option key={c}>{c}</option>)}</select>
                              <select onChange={(e) => setProjectFilters({...projectFilters, country: e.target.value})} className="border-gray-300 rounded text-xs h-9"><option value="">All Countries</option>{uniqueCountries.map(c => <option key={c}>{c}</option>)}</select>
                              <select onChange={(e) => setProjectFilters({...projectFilters, bu: e.target.value})} className="border-gray-300 rounded text-xs h-9"><option value="">All BUs</option>{uniqueBUs.map(c => <option key={c}>{c}</option>)}</select>
                          </div>
                          <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[200px]">
                              <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-50 border-b uppercase text-gray-500"><tr><th className="p-3 w-8"></th><th className="p-3">Project No</th><th className="p-3">Client</th><th className="p-3">Country</th><th className="p-3">Revenue</th></tr></thead>
                                  <tbody className="divide-y">
                                      {filteredProjects.map(p => (
                                          <tr key={p.projectId} className="hover:bg-gray-50">
                                              <td className="p-3"><input type="checkbox" checked={selectedProjectIds.includes(p.projectId)} onChange={() => toggleProject(p.projectId)} className="rounded text-primary-600" /></td>
                                              <td className="p-3 font-bold">{p.pjNoMain}-{p.pjNoSub}</td>
                                              <td className="p-3">{p.client}</td>
                                              <td className="p-3">{p.orderCountry}</td>
                                              <td className="p-3">{p.revenue.toLocaleString()}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary-600">calculate</span> Cost & Margin Calculation</h2>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-left text-[11px] whitespace-nowrap">
                              <thead className="bg-gray-100 uppercase text-gray-600 border-b">
                                  <tr><th className={headerClass}>Project</th><th className={headerClass}>Revenue</th><th className={`${headerClass} text-right bg-blue-50`}>Cost</th><th className={`${headerClass} text-right bg-blue-50`}>PT</th><th className={`${headerClass} text-right`}>Cost(USD)</th><th className={`${headerClass} text-right`}>PT(USD)</th></tr>
                              </thead>
                              <tbody className="divide-y">
                                  {costLines.map(l => (
                                      <tr key={l.projectId}>
                                          <td className={cellClass + " font-bold"}>{l.pjNoMain}</td>
                                          <td className={cellClass}>{l.revenue.toLocaleString()}</td>
                                          <td className={`${cellClass} bg-blue-50/20`}><input type="number" value={l.cost} onChange={(e) => handleCostChange(l.projectId, 'cost', e.target.value)} className={editableCellInputClass} /></td>
                                          <td className={`${cellClass} bg-blue-50/20`}><input type="number" value={l.passthrough} onChange={(e) => handleCostChange(l.projectId, 'passthrough', e.target.value)} className={editableCellInputClass} /></td>
                                          <td className={`${cellClass} text-right`}>{l.costUsd.toFixed(2)}</td>
                                          <td className={`${cellClass} text-right`}>{l.ptUsd.toFixed(2)}</td>
                                      </tr>
                                  ))}
                                  {costLines.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">Select projects above.</td></tr>}
                              </tbody>
                          </table>
                      </div>
                  </>
              ) : (
                  <>
                      <div className="mb-6">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-primary-600">search</span> Budget Details</h2>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                              <input type="text" placeholder="Case Name" value={budgetFilters.name} onChange={(e) => setBudgetFilters({...budgetFilters, name: e.target.value})} className="border-gray-300 rounded text-xs h-9" />
                              <select onChange={(e) => setBudgetFilters({...budgetFilters, country: e.target.value})} className="border-gray-300 rounded text-xs h-9"><option value="">All Countries</option>{uniqueBudgetCountries.map(c => <option key={c}>{c}</option>)}</select>
                              <select onChange={(e) => setBudgetFilters({...budgetFilters, bu: e.target.value})} className="border-gray-300 rounded text-xs h-9"><option value="">All BUs</option>{uniqueBudgetBUs.map(c => <option key={c}>{c}</option>)}</select>
                              <input type="text" placeholder="Team" value={budgetFilters.team} onChange={(e) => setBudgetFilters({...budgetFilters, team: e.target.value})} className="border-gray-300 rounded text-xs h-9" />
                          </div>
                          <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[200px]">
                              <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-50 border-b uppercase text-gray-500"><tr><th className="p-3 w-8"></th><th className="p-3">Case Name</th><th className="p-3">Country</th><th className="p-3">Remaining</th></tr></thead>
                                  <tbody className="divide-y">
                                      {filteredBudgets.map(b => (
                                          <tr key={b.id} className="hover:bg-gray-50">
                                              <td className="p-3"><input type="checkbox" checked={budgetLines.some(l => l.id === b.id)} onChange={() => toggleBudget(b)} className="rounded text-primary-600" /></td>
                                              <td className="p-3 font-bold">{b.name}</td>
                                              <td className="p-3">{b.country}</td>
                                              <td className="p-3 text-green-600 font-bold">{b.remaining.toLocaleString()}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      <div className="flex justify-between items-center mb-4 pt-4 border-t">
                          <h2 className="text-lg font-bold text-gray-900">Budget Allocation</h2>
                          <div className="flex gap-2">
                              <button onClick={allocateByRatio} className="px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 rounded text-xs font-bold">Allocate Ratio</button>
                              <button onClick={addManualBudget} className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-xs font-bold">Add Unbudgeted</button>
                          </div>
                      </div>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-left text-[11px] whitespace-nowrap">
                              <thead className="bg-gray-100 uppercase text-gray-600 border-b">
                                  <tr><th className="p-2 w-8"></th><th className="p-2">Type</th><th className="p-2">Name</th><th className="p-2 w-24 text-right bg-primary-50">Value</th><th className="p-2 text-right">Remaining</th></tr>
                              </thead>
                              <tbody className="divide-y">
                                  {budgetLines.map(l => (
                                      <tr key={l.id}>
                                          <td className="p-2 text-center"><button onClick={() => setBudgetLines(prev => prev.filter(x => x.id !== l.id))} className="text-red-400"><span className="material-symbols-outlined text-base">delete</span></button></td>
                                          <td className="p-2"><div className={readOnlyInputClass}>{l.type}</div></td>
                                          <td className="p-2">{l.type === 'Unbudget' ? <input type="text" value={l.name} onChange={(e) => updateBudgetLine(l.id, 'name', e.target.value)} className={readOnlyInputClass + " bg-white border-b border-gray-300"} /> : <div className={readOnlyInputClass}>{l.name}</div>}</td>
                                          <td className="p-2 bg-primary-50/20"><input type="number" value={l.allocation} onChange={(e) => updateBudgetLine(l.id, 'allocation', e.target.value)} className="w-full text-right font-bold text-primary-700 bg-transparent border-none focus:ring-0" /></td>
                                          <td className="p-2 text-right text-gray-500">{l.remaining}</td>
                                      </tr>
                                  ))}
                                  {budgetLines.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400 italic">No budgets allocated.</td></tr>}
                              </tbody>
                          </table>
                      </div>
                  </>
              )}
          </section>
      </div>
    </div>
  );
};

export default UnlinkedInvoice;
