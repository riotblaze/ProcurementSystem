
import React, { useState, useEffect } from 'react';

// Shared Types
interface Vendor {
  id: number;
  name: string;
  country: string;
  grade: string;
  address: string;
  reg: string;
  payment: string;
  type: 'Corporate' | 'Individual';
  contacts: any[];
  estCost: number;
  estCostUsd: number;
  estPtUsd: number;
  currency: string;
  note: string;
}

const initialVendors: Vendor[] = [
  { 
    id: 1, 
    name: 'Office Supplies Co.', 
    country: 'Singapore', 
    grade: 'Grade A', 
    address: '123 Business Park, Singapore 123456', 
    reg: '202101234A', 
    payment: 'DBS 123-456-7890',
    type: 'Corporate',
    contacts: [],
    estCost: 1250.00,
    estCostUsd: 1250.00,
    estPtUsd: 0.00,
    currency: 'USD',
    note: ''
  }
];

const availableProjects = [
    { id: 'p1', no: 'SG-PR-001a', client: 'AstraZeneca', bu: 'MC', prod: 'Customised PJ', revenue: 3000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-001' },
    { id: 'p2', no: 'SG-PR-002b', client: 'Pfizer', bu: 'MIMS', prod: 'Webinar', revenue: 5500.00, orderCountry: 'Malaysia', orderNo: 'ORD-2024-002' },
    { id: 'p3', no: 'SG-PR-003c', client: 'Novartis', bu: 'MPF', prod: 'Campaign', revenue: 12000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-003' },
];

const DirectProcurement = () => {
  // --- State ---
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendorId, setSelectedVendorId] = useState<number>(initialVendors[0].id);
  const [requestCostCategory, setRequestCostCategory] = useState('Professional Fee');
  
  // Vendor Search
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [showVendorSearch, setShowVendorSearch] = useState(false);

  // Project & Cost Lines
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(['p1', 'p2']);
  const [costLines, setCostLines] = useState<any[]>([]);

  // --- Derived Values ---
  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
  const totalVendorEstUsd = (selectedVendor.estCostUsd || 0) + (selectedVendor.estPtUsd || 0);

  // Filter projects
  const filteredProjects = availableProjects.filter(p => 
      p.no.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      p.bu.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      p.orderCountry.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      p.orderNo.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  // --- Effects ---
  useEffect(() => {
      const newCostLines = selectedProjectIds.map(pid => {
          const existingLine = costLines.find(l => l.projectId === pid);
          if (existingLine) return existingLine;

          const project = availableProjects.find(p => p.id === pid);
          const isAstra = project?.client === 'AstraZeneca';
          
          return {
              projectId: pid,
              // Data retrieved from SMS System (Read-Only)
              client: project?.client,
              orderCountry: project?.orderCountry,
              insertionNo: isAstra ? 'INS-2024-001' : 'INS-2024-099',
              pjNoMain: project?.no?.split('-')[0] + '-' + project?.no?.split('-')[1],
              pjNoSub: project?.no?.split('-')[2] || '001',
              reportCtry: project?.orderCountry, 
              bu: project?.bu,
              prod: project?.prod,
              edd: '2024-12-31',
              revenue: project?.revenue,
              nonRevenue: isAstra ? 0 : 500,
              existingProc: isAstra ? 1200 : 0,
              existingPt: isAstra ? 300 : 0,
              // Editable Fields
              cost: 0,
              passthrough: 0,
              costUsd: 0,
              ptUsd: 0
          };
      });
      setCostLines(newCostLines);
  }, [selectedProjectIds]); // eslint-disable-line

  // --- Handlers ---
  const handleAddVendor = (name: string) => {
      const newVendor: Vendor = {
          id: Date.now(),
          name: name,
          country: 'Singapore',
          grade: 'New',
          address: 'Address Pending',
          reg: 'Pending',
          payment: 'Pending',
          type: 'Corporate',
          contacts: [],
          estCost: 0,
          estCostUsd: 0,
          estPtUsd: 0,
          currency: 'USD',
          note: ''
      };
      setVendors([...vendors, newVendor]);
      setVendorSearchTerm('');
      setShowVendorSearch(false);
  };

  const removeVendor = (id: number) => {
      const updated = vendors.filter(v => v.id !== id);
      setVendors(updated);
      if (selectedVendorId === id && updated.length > 0) {
          setSelectedVendorId(updated[0].id);
      }
  };

  const updateVendorEst = (id: number, field: keyof Vendor, value: any) => {
      setVendors(vendors.map(v => {
          if (v.id === id) {
              const updated = { ...v, [field]: value };
              if (field === 'estCost') updated.estCostUsd = parseFloat(value) || 0;
              return updated;
          }
          return v;
      }));
  };

  const toggleProject = (id: string) => {
      if (selectedProjectIds.includes(id)) {
          setSelectedProjectIds(selectedProjectIds.filter(pid => pid !== id));
      } else {
          setSelectedProjectIds([...selectedProjectIds, id]);
      }
  };

  // Calculations
  const currentTotalCostUsd = costLines.reduce((acc, l) => acc + l.costUsd, 0);
  const currentTotalPtUsd = costLines.reduce((acc, l) => acc + l.ptUsd, 0);
  const totalDirectOverallUsd = currentTotalCostUsd + currentTotalPtUsd;
  const isDirectTally = Math.abs(totalDirectOverallUsd - totalVendorEstUsd) < 1.0;

  // Styles
  const readOnlyInputClass = "w-full border-transparent bg-transparent rounded text-[10px] text-gray-700 font-medium px-1 py-1 truncate cursor-default";
  const headerClass = "px-2 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap";
  const cellClass = "px-2 py-1 border-b border-gray-100 whitespace-nowrap";

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-30">
         <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Direct Procurement Request</h1>
         </div>
         <div className="flex items-center gap-3">
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">Draft</span>
             <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white transition-colors">Save as Draft</button>
             <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">Submit for Approval</button>
         </div>
      </div>

      <div className="space-y-6">
          
          {/* Request Information */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-600">info</span>
                Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">User</label>
                    <div className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1">John Doe</div>
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</label>
                    <div className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1">MIMS PTE LTD</div>
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost Category</label>
                    <select 
                        value={requestCostCategory} 
                        onChange={(e) => setRequestCostCategory(e.target.value)}
                        className="w-full border-gray-300 rounded text-xs px-2 py-1 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow"
                    >
                        <option>Professional Fee</option>
                        <option>Hardware</option>
                        <option>Subscription</option>
                        <option>Office Supplies</option>
                        <option>Travel & Ent</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsible Team</label>
                    <input type="text" defaultValue="Marketing Team" className="w-full border-gray-300 rounded text-xs px-2 py-1 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow" />
                </div>
                <div className="md:col-span-4 space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">CC Recipients</label>
                    <input type="text" placeholder="Add emails, separated by commas" className="w-full border-gray-300 rounded text-xs px-2 py-1 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow" />
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
                    <div key={vendor.id} className="border border-gray-200 rounded-xl p-5 space-y-6 relative hover:border-primary-200 transition-colors bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Vendor {String.fromCharCode(65 + index)}</h3>
                                <div className="mt-2 inline-flex bg-gray-100 p-1 rounded-lg">
                                    <button className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendor.type === 'Corporate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Corporate</button>
                                    <button className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendor.type === 'Individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Individual</button>
                                </div>
                            </div>
                            <button onClick={() => removeVendor(vendor.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>

                        <div className="space-y-4 border-b border-gray-100 pb-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-500">Vendor Name</label>
                                <input type="text" value={vendor.name} className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Vendor Country</label>
                                    <input type="text" value={vendor.country} className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1" readOnly />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Vendor Grade</label>
                                    <div className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1">{vendor.grade}</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-500">Vendor Address</label>
                                <div className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1">{vendor.address}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Registration No.</label>
                                    <div className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1">{vendor.reg}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Payment Info</label>
                                    <div className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1">{vendor.payment}</div>
                                </div>
                            </div>
                        </div>
                        
                        <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-primary-600 text-sm font-medium hover:bg-primary-50 hover:border-primary-300 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">add</span> Add Contact
                        </button>
                    </div>
                ))}

                {/* Add Vendor Card */}
                {vendors.length < 5 && (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl flex flex-col p-6 min-h-[400px] bg-gray-50/50">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vendor <span className="text-gray-400 font-normal material-symbols-outlined text-sm align-middle">info</span></label>
                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all shadow-sm">
                                <span className="pl-3 text-gray-400 material-symbols-outlined">domain</span>
                                <input 
                                    type="text" 
                                    className="w-full border-none focus:ring-0 text-sm py-2.5 px-3" 
                                    placeholder="Search existing or add new..."
                                    value={vendorSearchTerm}
                                    onChange={(e) => { setVendorSearchTerm(e.target.value); setShowVendorSearch(true); }}
                                    onFocus={() => setShowVendorSearch(true)}
                                />
                            </div>
                            
                            {showVendorSearch && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                                    {vendorSearchTerm && (
                                        <div onClick={() => handleAddVendor(vendorSearchTerm)} className="p-3 hover:bg-blue-50 cursor-pointer text-primary-600 font-medium text-sm flex items-center gap-2 border-t border-gray-100">
                                            <span className="material-symbols-outlined">add</span>
                                            Add '{vendorSearchTerm}' as new vendor
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 mt-8">
                            <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">add_business</span>
                            <p className="text-sm font-medium">Search to add another vendor for comparison</p>
                        </div>
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
                            <th className="px-4 py-3 text-right">Cost</th>
                            <th className="px-4 py-3 text-right">Cost (USD)</th>
                            <th className="px-4 py-3 text-right">Pass through (USD)</th>
                            <th className="px-4 py-3">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor) => (
                            <tr key={vendor.id} className={`hover:bg-gray-50 transition-colors ${selectedVendorId === vendor.id ? 'bg-primary-50' : ''}`}>
                                <td className="px-4 py-3 text-center">
                                    <input 
                                        type="radio" 
                                        checked={selectedVendorId === vendor.id} 
                                        onChange={() => setSelectedVendorId(vendor.id)} 
                                        className="text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer" 
                                    />
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-900">{vendor.name}</td>
                                <td className="px-4 py-3">
                                    <select 
                                        value={vendor.currency} 
                                        onChange={(e) => updateVendorEst(vendor.id, 'currency', e.target.value)}
                                        className="w-full border-gray-300 rounded text-xs px-2 py-1 bg-white"
                                    >
                                        <option>USD</option>
                                        <option>SGD</option>
                                        <option>MYR</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input 
                                        type="number" 
                                        value={vendor.estCost} 
                                        onChange={(e) => updateVendorEst(vendor.id, 'estCost', e.target.value)} 
                                        className="w-full border-gray-300 rounded text-xs px-2 py-1 text-right focus:ring-primary-500" 
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input 
                                        type="number" 
                                        value={vendor.estCostUsd} 
                                        onChange={(e) => updateVendorEst(vendor.id, 'estCostUsd', e.target.value)} 
                                        className="w-full border-transparent bg-transparent rounded text-xs px-2 py-1 text-right font-medium" 
                                        readOnly 
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input 
                                        type="number" 
                                        value={vendor.estPtUsd} 
                                        onChange={(e) => updateVendorEst(vendor.id, 'estPtUsd', e.target.value)} 
                                        className="w-full border-gray-300 rounded text-xs px-2 py-1 text-right focus:ring-primary-500" 
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input 
                                        type="text" 
                                        value={vendor.note} 
                                        onChange={(e) => updateVendorEst(vendor.id, 'note', e.target.value)} 
                                        placeholder="Add note..." 
                                        className="w-full border-gray-300 rounded text-xs px-2 py-1" 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </section>

          {/* Project Details */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-600">folder_open</span>
                    Project Details
                </h2>
                <div className="relative w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">search</span>
                <input 
                    type="text" 
                    placeholder="Search by Order Ctry, BU, Main PJ No, Order No..." 
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-10" 
                />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 w-10"></th>
                        <th className="px-4 py-3">Project No.</th>
                        <th className="px-4 py-3">Order No.</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Order Ctry</th>
                        <th className="px-4 py-3">BU</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredProjects.map(proj => (
                        <tr key={proj.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <input 
                                    type="checkbox" 
                                    checked={selectedProjectIds.includes(proj.id)} 
                                    onChange={() => toggleProject(proj.id)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{proj.no}</td>
                            <td className="px-4 py-3 text-gray-600">{proj.orderNo}</td>
                            <td className="px-4 py-3">{proj.client}</td>
                            <td className="px-4 py-3">{proj.orderCountry}</td>
                            <td className="px-4 py-3">{proj.bu}</td>
                            <td className="px-4 py-3">{proj.prod}</td>
                            <td className="px-4 py-3 text-right font-medium">{proj.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </section>

          {/* Cost & Margin Calculation */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-600">calculate</span>
                    Cost & Margin Calculation
                </h2>
                {!isDirectTally && (
                    <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded border border-red-100 animate-pulse">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Total Request Amount does not match Vendor Estimation ({totalDirectOverallUsd.toFixed(2)} vs {totalVendorEstUsd.toFixed(2)})
                    </div>
                )}
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200 pb-2">
                <table className="min-w-max text-left text-[11px] border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className={`${headerClass} sticky left-0 z-20 bg-gray-100 border-r`}>Client</th>
                            <th className={headerClass}>Order Country</th>
                            <th className={headerClass}>Insertion No.</th>
                            <th className={headerClass}>PJ No. - Main</th>
                            <th className={headerClass}>PJ No. - Sub</th>
                            <th className={headerClass}>Report Ctry</th>
                            <th className={headerClass}>BU</th>
                            <th className={headerClass}>Prod</th>
                            <th className={headerClass}>EDD</th>
                            <th className={`${headerClass} text-right`}>Revenue</th>
                            <th className={`${headerClass} text-right text-gray-500`}>Non-Revenue</th>
                            <th className={`${headerClass} text-right text-gray-500`}>Exist. Proc.</th>
                            <th className={`${headerClass} text-right text-gray-500`}>Exist. PT</th>
                            <th className={`${headerClass} text-right w-24 bg-blue-50 text-blue-800`}>Cost</th>
                            <th className={`${headerClass} text-right w-24 bg-blue-50 text-blue-800`}>Passthrough</th>
                            <th className={`${headerClass} text-right bg-blue-50 text-blue-800`}>Cost (USD)</th>
                            <th className={`${headerClass} text-right bg-blue-50 text-blue-800`}>PT (USD)</th>
                            <th className={`${headerClass} text-right bg-gray-200 text-gray-800`}>Total Cost</th>
                            <th className={`${headerClass} text-right bg-gray-200 text-gray-800`}>PT (Total)</th>
                            <th className={`${headerClass} text-right bg-gray-200 text-gray-800`}>Total Cost (USD)</th>
                            <th className={`${headerClass} text-right bg-gray-200 text-gray-800`}>PT (USD, Total)</th>
                            <th className={`${headerClass} text-right bg-teal-50 text-teal-800`}>Margin %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {costLines.map((line) => {
                            const totalCostLocal = (parseFloat(line.cost) || 0) + (parseFloat(line.existingProc) || 0);
                            const totalPtLocal = (parseFloat(line.passthrough) || 0) + (parseFloat(line.existingPt) || 0);
                            const totalCostUsd = line.costUsd + (parseFloat(line.existingProc) || 0);
                            const totalPtUsd = line.ptUsd + (parseFloat(line.existingPt) || 0);
                            const totalCostForMargin = totalCostUsd + totalPtUsd;
                            const margin = line.revenue > 0 ? ((line.revenue - totalCostForMargin) / line.revenue) * 100 : 0;

                            return (
                                <tr key={line.projectId} className="hover:bg-gray-50 transition-colors group">
                                    <td className={`${cellClass} sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 font-bold text-gray-900`}>{line.client}</td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.orderCountry}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.insertionNo}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.pjNoMain}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.pjNoSub}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.reportCtry}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.bu}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.prod}</div></td>
                                    <td className={cellClass}><div className={readOnlyInputClass}>{line.edd}</div></td>
                                    <td className={cellClass}><div className={`${readOnlyInputClass} text-right font-semibold`}>{line.revenue.toLocaleString()}</div></td>
                                    <td className={cellClass}><div className={`${readOnlyInputClass} text-right text-gray-500`}>{line.nonRevenue.toLocaleString()}</div></td>
                                    <td className={cellClass}><div className={`${readOnlyInputClass} text-right text-gray-500`}>{line.existingProc.toLocaleString()}</div></td>
                                    <td className={cellClass}><div className={`${readOnlyInputClass} text-right text-gray-500`}>{line.existingPt.toLocaleString()}</div></td>
                                    <td className={`${cellClass} bg-blue-50/20`}>
                                        <div className={readOnlyInputClass + " text-right"}>{line.cost}</div>
                                    </td>
                                    <td className={`${cellClass} bg-blue-50/20`}>
                                        <div className={readOnlyInputClass + " text-right"}>{line.passthrough}</div>
                                    </td>
                                    <td className={`${cellClass} text-right bg-blue-50/30`}>
                                        <div className={readOnlyInputClass}>{line.costUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                    </td>
                                    <td className={`${cellClass} text-right bg-blue-50/30`}>
                                        <div className={readOnlyInputClass}>{line.ptUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                    </td>
                                    <td className={`${cellClass} text-right bg-gray-50 text-gray-700 font-medium`}>{totalCostLocal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className={`${cellClass} text-right bg-gray-50 text-gray-700 font-medium`}>{totalPtLocal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className={`${cellClass} text-right bg-gray-100 text-gray-900 font-bold`}>{totalCostUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className={`${cellClass} text-right bg-gray-100 text-gray-900 font-bold`}>{totalPtUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className={`${cellClass} text-right font-bold ${margin < 30 ? 'text-red-600 bg-red-50' : 'text-teal-600 bg-teal-50'}`}>
                                        {margin.toFixed(1)}%
                                    </td>
                                </tr>
                            );
                        })}
                        {costLines.length === 0 && <tr><td colSpan={22} className="p-4 text-center text-gray-400">Select a project to see cost calculation</td></tr>}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t border-gray-200 text-[10px] font-bold text-gray-900 sticky bottom-0 shadow-[0_-2px_5px_-2px_rgba(0,0,0,0.1)]">
                        <tr>
                            <td className="px-2 py-2 sticky left-0 bg-gray-100 border-r border-gray-200 z-20">Total</td>
                            <td colSpan={8}></td>
                            <td className="px-2 py-2 text-right">{costLines.reduce((acc, l) => acc + l.revenue, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-gray-500">{costLines.reduce((acc, l) => acc + (l.nonRevenue || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-gray-500">{costLines.reduce((acc, l) => acc + (l.existingProc || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-gray-500">{costLines.reduce((acc, l) => acc + (l.existingPt || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-blue-800 bg-blue-50">{costLines.reduce((acc, l) => acc + (parseFloat(l.cost)||0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-blue-800 bg-blue-50">{costLines.reduce((acc, l) => acc + (parseFloat(l.passthrough)||0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-blue-800 bg-blue-50">{currentTotalCostUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-blue-800 bg-blue-50">{currentTotalPtUsd.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td colSpan={5} className="bg-gray-100"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
          </section>

          {/* Justification/Attachments */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-600">attachment</span>
                Attachments & Justification
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Upload Quote/Proposal</label>
                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                         <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                         <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                         <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Justification / Notes</label>
                     <textarea rows={5} className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 p-3" placeholder="Add any additional notes for the approver..."></textarea>
                 </div>
             </div>
          </section>

      </div>
    </div>
  );
};

export default DirectProcurement;
