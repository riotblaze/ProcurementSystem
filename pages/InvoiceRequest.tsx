
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UnlinkedInvoice from './UnlinkedInvoice';

const budgetDatabase = [
  { id: 101, name: 'Marketing Q3', bu: 'Marketing', country: 'Singapore', team: 'Digital Marketing', category: 'Office Supplies', cost25b: 625, existing: 2000, prior: 0, thisYear: 3000, future: 0, remaining: 1000 },
  { id: 102, name: 'IT Infrastructure Upgrade', bu: 'IT', country: 'Singapore', team: 'Infra', category: 'Hardware', cost25b: 5000, existing: 12000, prior: 1000, thisYear: 50000, future: 10000, remaining: 38000 },
  { id: 103, name: 'Sales Kickoff 2024', bu: 'Sales', country: 'Malaysia', team: 'Events', category: 'Travel', cost25b: 0, existing: 500, prior: 0, thisYear: 15000, future: 0, remaining: 14500 },
  { id: 104, name: 'Q4 Recruitment', bu: 'HR', country: 'Singapore', team: 'Recruitment', category: 'Services', cost25b: 2000, existing: 1500, prior: 0, thisYear: 10000, future: 0, remaining: 8500 },
];

const InvoiceRequest = () => {
  const [mode, setMode] = useState<'Linked' | 'Unlinked'>('Linked');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(document.getElementById('header-portal'));
  }, []);
  
  // --- Linked State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [procurementData, setProcurementData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [simulateType, setSimulateType] = useState('Direct'); 
  const [isAdvancedPayment, setIsAdvancedPayment] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState(0);

  // Vendor Data State
  const [vendorData, setVendorData] = useState<any>(null);
  const [originalVendorName, setOriginalVendorName] = useState('');
  const [showVendorSearch, setShowVendorSearch] = useState(false);
  const [newVendorSearchTerm, setNewVendorSearchTerm] = useState('');

  // Project Selection & Search State (Direct)
  const [projectFilters, setProjectFilters] = useState({ no: '', client: '', country: '', bu: '' });
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Budget Filters State (Other)
  const [budgetFilters, setBudgetFilters] = useState({ name: '', country: '', bu: '', team: '' });
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<number[]>([]);

  // --- Handlers: Linked ---
  const handleSearch = () => {
      // Mock retrieval logic based on simulation toggle
      if (simulateType === 'Direct') {
          const items = [
              { 
                 projectId: 'p1', client: 'AstraZeneca', orderCountry: 'Singapore', insertionNo: 'INS-001', 
                 pjNoMain: 'SG-PR-001', pjNoSub: 'a', reportCtry: 'Singapore', bu: 'MC', prod: 'Customised PJ', edd: '2024-12-31',
                 orderNo: 'ORD-2024-001',
                 revenue: 3000, nonRevenue: 0, existingProc: 1200, existingPt: 300,
                 cost: 1500, passthrough: 0, // These are invoice amounts now
                 costUsd: 1110, ptUsd: 0 
              },
              { 
                 projectId: 'p2', client: 'Pfizer', orderCountry: 'Malaysia', insertionNo: 'INS-002', 
                 pjNoMain: 'SG-PR-002', pjNoSub: 'b', reportCtry: 'Malaysia', bu: 'MIMS', prod: 'Webinar', edd: '2024-12-31',
                 orderNo: 'ORD-2024-002',
                 revenue: 5500, nonRevenue: 500, existingProc: 0, existingPt: 0,
                 cost: 0, passthrough: 0, 
                 costUsd: 0, ptUsd: 0 
              }
          ];

          setProcurementData({
              type: 'Direct Procurement',
              orderNo: '10010',
              pjNo: 'SG-PFI-001a',
              client: 'Pfizer',
              bu: 'MC',
              vendor: 'Pfizer', // Original Vendor
              items: items, 
              invoiceNo: '', invoiceDate: '', 
              totalPrAmount: 5000.00,
              previouslyInvoiced: 2000.00
          });
          setInvoiceAmount(1500); // Default to item sum
          setSelectedProjectIds(['p1']); // Select first by default
          
          // Populate Vendor Data
          const vData = {
              name: 'Pfizer',
              country: 'Singapore',
              grade: 'Grade A',
              address: '88 Science Park Road, Singapore 118259',
              reg: '200012345K',
              payment: 'CITI 888-999-000',
              type: 'Corporate'
          };
          setVendorData(vData);
          setOriginalVendorName(vData.name);

      } else {
          setProcurementData({
              type: 'Other Procurement',
              orderNo: 'PO-OTH-555',
              pjNo: '-',
              client: 'Internal',
              bu: 'Marketing',
              vendor: 'Office Supplies Co.',
              // Rich Item Structure for Other
              items: [
                  { 
                      id: 101, name: 'Marketing Q3', bu: 'Marketing', country: 'Singapore', team: 'Digital Marketing', category: 'Office Supplies', 
                      cost25b: 625, existing: 2000, prior: 0, thisYear: 3000, future: 0, remaining: 1000,
                      allocation: 500.00, type: 'Budget'
                  }
              ], 
              invoiceNo: '', invoiceDate: '', 
              totalPrAmount: 12000.00,
              previouslyInvoiced: 11500.00
          });
          setInvoiceAmount(500);

          // Populate Vendor Data
          const vData = {
              name: 'Office Supplies Co.',
              country: 'Singapore',
              grade: 'Grade A',
              address: '123 Business Park, Singapore 123456',
              reg: '202101234A',
              payment: 'DBS 123-456-7890',
              type: 'Corporate'
          };
          setVendorData(vData);
          setOriginalVendorName(vData.name);
      }
  };

  const handleOCRScan = () => {
      if (!procurementData) return;
      setIsScanning(true);
      setTimeout(() => {
          const newData = { ...procurementData };
          newData.invoiceNo = 'INV-OCR-001';
          newData.invoiceDate = '2024-07-25';
          setIsScanning(false);
          setProcurementData(newData);
      }, 1000);
  };

  const handleDirectItemChange = (projectId: string, field: string, value: string) => {
      const newValue = parseFloat(value) || 0;
      
      setProcurementData((prev: any) => ({
          ...prev,
          items: prev.items.map((item: any) => {
              if (item.projectId === projectId) {
                  const updated = { ...item, [field]: newValue };
                  // Auto-calculate USD values assuming mock rate
                  const RATE = 0.74; 
                  if (field === 'cost') updated.costUsd = newValue * RATE;
                  if (field === 'passthrough') updated.ptUsd = newValue * RATE;
                  return updated;
              }
              return item;
          })
      }));
  };

  const toggleProject = (projectId: string) => {
      setSelectedProjectIds(prev => 
          prev.includes(projectId) 
              ? prev.filter(id => id !== projectId)
              : [...prev, projectId]
      );
  };

  const handleSwapVendor = (newName: string, isExisting: boolean = false) => {
      if (isExisting) {
           setVendorData({
              name: newName,
              country: 'Singapore', 
              grade: 'Grade A',
              address: '123 Existing Rd, Singapore', // Mock address for existing
              reg: '202055555X', // Mock reg
              payment: 'DBS 123-999-000', // Mock payment
              type: 'Corporate'
          });
      } else {
          setVendorData({
              name: newName,
              country: 'Singapore', // Mock default for new
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

  // --- Budget Handlers (Other Procurement) ---
  const toggleBudget = (budget: any) => {
      setProcurementData((prev: any) => {
          const exists = prev.items.find((i: any) => i.id === budget.id);
          let newItems;
          if (exists) {
              newItems = prev.items.filter((i: any) => i.id !== budget.id);
          } else {
              newItems = [...prev.items, { ...budget, allocation: 0, type: 'Budget' }];
          }
          
          const currentIds = newItems.map((i: any) => i.id);
          setSelectedBudgetIds(currentIds);
          
          return {
              ...prev,
              items: newItems
          };
      });
  };

  const updateBudgetLine = (id: number | string, field: string, value: string) => {
      setProcurementData((prev: any) => ({
          ...prev,
          items: prev.items.map((i: any) => i.id === id ? { ...i, [field]: (field === 'allocation' ? (parseFloat(value) || 0) : value) } : i)
      }));
  };

  const addManualBudget = () => {
       const newManual = {
        id: `manual_${Date.now()}`,
        type: 'Unbudget',
        name: 'New Item',
        bu: 'Marketing',
        country: 'Singapore',
        team: '-',
        category: 'Misc',
        cost25b: 0, existing: 0, prior: 0, thisYear: 0, future: 0, remaining: 0,
        allocation: 0
    };
    setProcurementData((prev: any) => ({
        ...prev,
        items: [...prev.items, newManual]
    }));
  };

  const allocateByRatio = () => {
    const targetAmount = invoiceAmount;
    if (targetAmount <= 0 || !procurementData) return;

    const validLines = procurementData.items.filter((l: any) => l.type === 'Budget' && (l.remaining || 0) > 0);
    const totalRemaining = validLines.reduce((acc: number, l: any) => acc + (l.remaining || 0), 0);

    if (totalRemaining === 0) return;

    setProcurementData((prev: any) => ({
        ...prev,
        items: prev.items.map((line: any) => {
            if (line.type === 'Budget' && (line.remaining || 0) > 0) {
                const ratio = line.remaining / totalRemaining;
                const allocatedAmount = targetAmount * ratio;
                return { ...line, allocation: parseFloat(allocatedAmount.toFixed(2)) };
            }
            return line;
        })
    }));
  };

  const removeBudgetLine = (id: string | number) => {
      setProcurementData((prev: any) => {
          const newItems = prev.items.filter((i: any) => i.id !== id);
          setSelectedBudgetIds(newItems.map((i: any) => i.id));
          return { ...prev, items: newItems };
      });
  };

  // --- Validation ---
  const remainingLimit = procurementData ? (procurementData.totalPrAmount - procurementData.previouslyInvoiced) : 0;
  const isOverLimit = invoiceAmount > remainingLimit;
  const isVendorChanged = vendorData && originalVendorName && vendorData.name !== originalVendorName;

  // --- Filtered Projects (Direct) ---
  const filteredProjects = procurementData?.type === 'Direct Procurement' 
      ? procurementData.items.filter((item: any) => 
            (!projectFilters.no || (item.pjNoMain + '-' + item.pjNoSub).toLowerCase().includes(projectFilters.no.toLowerCase())) &&
            (!projectFilters.client || item.client === projectFilters.client) &&
            (!projectFilters.country || item.orderCountry === projectFilters.country) &&
            (!projectFilters.bu || item.bu === projectFilters.bu)
        )
      : [];

  const selectedProjects = procurementData?.type === 'Direct Procurement'
      ? procurementData.items.filter((item: any) => selectedProjectIds.includes(item.projectId))
      : [];

  // --- Filtered Budgets (Other) ---
  const filteredBudgets = budgetDatabase.filter(b => {
      const matchName = !budgetFilters.name || b.name.toLowerCase().includes(budgetFilters.name.toLowerCase());
      const matchCountry = !budgetFilters.country || b.country.toLowerCase().includes(budgetFilters.country.toLowerCase());
      const matchBU = !budgetFilters.bu || b.bu.toLowerCase().includes(budgetFilters.bu.toLowerCase());
      const matchTeam = !budgetFilters.team || b.team.toLowerCase().includes(budgetFilters.team.toLowerCase());
      return matchName && matchCountry && matchBU && matchTeam;
  });

  const uniqueClients = procurementData?.type === 'Direct Procurement' 
      ? Array.from(new Set(procurementData.items.map((i:any) => i.client))) as string[] 
      : [];
  const uniqueCountries = procurementData?.type === 'Direct Procurement' 
      ? Array.from(new Set(procurementData.items.map((i:any) => i.orderCountry))) as string[]
      : [];
  const uniqueBUs = procurementData?.type === 'Direct Procurement' 
      ? Array.from(new Set(procurementData.items.map((i:any) => i.bu))) as string[]
      : [];

  // Budget Uniques
  const uniqueBudgetCountries = Array.from(new Set(budgetDatabase.map(b => b.country)));
  const uniqueBudgetBUs = Array.from(new Set(budgetDatabase.map(b => b.bu)));

  // --- Styles ---
  const headerClass = "px-2 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap";
  const cellClass = "px-2 py-1 border-b border-gray-100 whitespace-nowrap";
  const editableCellInputClass = "w-full bg-transparent border-none text-right text-xs focus:ring-2 focus:ring-primary-500 rounded px-1 py-1 font-semibold text-gray-900";
  const readOnlyCellInputClass = "w-full bg-transparent border-none text-right text-xs rounded px-1 py-1 font-medium text-gray-600 cursor-default focus:ring-0";
  const readOnlyInputClass = "w-full border-transparent bg-transparent rounded text-[10px] text-gray-700 font-medium px-1 py-1 truncate cursor-default";


  return (
    <>
      {/* Header Portal */}
      {portalContainer && createPortal(
          <div className="flex items-center justify-between w-full h-full pl-0 md:pl-4">
              <div className="flex items-center gap-6">
                  <h1 className="text-xl font-bold text-gray-900 hidden md:block">Invoice Request</h1>
                  <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-bold">
                    <button
                        onClick={() => setMode('Linked')}
                        className={`px-3 py-1.5 rounded-md transition-all ${mode === 'Linked' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Linked (With PO)
                    </button>
                    <button
                        onClick={() => setMode('Unlinked')}
                        className={`px-3 py-1.5 rounded-md transition-all ${mode === 'Unlinked' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Unlinked (No PO)
                    </button>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                   <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">Save Draft</button>
                   <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow-sm transition-colors">Submit Approval</button>
              </div>
          </div>,
          portalContainer
      )}

      <div className="space-y-6 animate-fade-in pb-20">
       {mode === 'Linked' ? (
           <div className="space-y-6">
               {/* Search Section */}
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                   <div className="flex gap-4 items-center text-sm border-b border-gray-100 pb-4 mb-2">
                       <span className="text-gray-500 font-semibold uppercase text-xs">Simulate Retrieval:</span>
                       <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="simType" checked={simulateType === 'Direct'} onChange={() => setSimulateType('Direct')} className="text-primary-600 focus:ring-primary-500" /> Direct Procurement
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="simType" checked={simulateType === 'Other'} onChange={() => setSimulateType('Other')} className="text-primary-600 focus:ring-primary-500" /> Other Procurement
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

               {procurementData && vendorData && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
                   {/* Main Content Area (Wider) */}
                   <div className="lg:col-span-3 space-y-6">
                        
                        {/* Vendor Details Section */}
                        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary-600">storefront</span>
                                    Vendor Details
                                </h2>
                                
                                {/* Vendor Search for switching */}
                                <div className="relative z-20">
                                    {showVendorSearch ? (
                                        <div className="flex flex-col animate-in fade-in slide-in-from-right-2">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    autoFocus
                                                    placeholder="Search or add new..."
                                                    value={newVendorSearchTerm}
                                                    onChange={(e) => setNewVendorSearchTerm(e.target.value)}
                                                    className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 w-64 h-9"
                                                />
                                                <button onClick={() => { setShowVendorSearch(false); setNewVendorSearchTerm(''); }} className="text-gray-400 hover:text-gray-600">
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                            
                                            {/* Dropdown */}
                                            {newVendorSearchTerm && (
                                                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                    {['Office Supplies Co.', 'Global Tech Inc.', 'Staples & More', 'Tech Solutions Ltd.', 'Pfizer', 'AstraZeneca']
                                                        .filter(v => v.toLowerCase().includes(newVendorSearchTerm.toLowerCase()))
                                                        .map(v => (
                                                            <div 
                                                                key={v}
                                                                onClick={() => handleSwapVendor(v, true)}
                                                                className="p-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm flex items-center gap-2 border-b border-gray-50"
                                                            >
                                                                <span className="material-symbols-outlined text-gray-400 text-base">domain</span>
                                                                {v}
                                                            </div>
                                                        ))
                                                    }
                                                    <div 
                                                        onClick={() => handleSwapVendor(newVendorSearchTerm, false)} 
                                                        className="p-2.5 hover:bg-blue-50 cursor-pointer text-primary-600 font-medium text-sm flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-base">add_business</span>
                                                        Create new '{newVendorSearchTerm}'
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowVendorSearch(true)}
                                            className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">sync_alt</span> Change Vendor
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Vendor Card */}
                            <div className="border border-gray-200 rounded-xl p-5 space-y-6 bg-white shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                         <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                                            <button 
                                                onClick={() => setVendorData({...vendorData, type: 'Corporate'})}
                                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendorData.type === 'Corporate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Corporate
                                            </button>
                                            <button 
                                                onClick={() => setVendorData({...vendorData, type: 'Individual'})}
                                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendorData.type === 'Individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Individual
                                            </button>
                                        </div>
                                    </div>
                                    {isVendorChanged && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            <span className="material-symbols-outlined text-sm">warning</span> Vendor Changed
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                     {/* Fields - Editable */}
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-gray-500">Vendor Name</label>
                                            <input 
                                                type="text" 
                                                value={vendorData.name} 
                                                onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                                                className="w-full border-gray-300 rounded text-xs text-gray-900 font-medium px-2 py-1.5 focus:ring-primary-500" 
                                            />
                                        </div>
                                         <div className="space-y-1">
                                            <label className="block text-xs font-medium text-gray-500">Country</label>
                                            <input 
                                                type="text" 
                                                value={vendorData.country} 
                                                onChange={(e) => setVendorData({...vendorData, country: e.target.value})}
                                                className="w-full border-gray-300 rounded text-xs text-gray-900 font-medium px-2 py-1.5 focus:ring-primary-500" 
                                            />
                                        </div>
                                     </div>
                                     
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-gray-500">Vendor Address</label>
                                            <input 
                                                type="text" 
                                                value={vendorData.address} 
                                                onChange={(e) => setVendorData({...vendorData, address: e.target.value})}
                                                className="w-full border-gray-300 rounded text-xs text-gray-900 font-medium px-2 py-1.5 focus:ring-primary-500" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-gray-500">Grade</label>
                                            <input 
                                                type="text" 
                                                value={vendorData.grade} 
                                                onChange={(e) => setVendorData({...vendorData, grade: e.target.value})}
                                                className="w-full border-gray-300 rounded text-xs text-gray-900 font-medium px-2 py-1.5 focus:ring-primary-500" 
                                            />
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-gray-500">Registration No.</label>
                                            <input 
                                                type="text" 
                                                value={vendorData.reg} 
                                                onChange={(e) => setVendorData({...vendorData, reg: e.target.value})}
                                                className="w-full border-gray-300 rounded text-xs text-gray-900 font-medium px-2 py-1.5 focus:ring-primary-500" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-medium text-gray-500">Payment Info</label>
                                            <input 
                                                type="text" 
                                                value={vendorData.payment} 
                                                onChange={(e) => setVendorData({...vendorData, payment: e.target.value})}
                                                className="w-full border-gray-300 rounded text-xs text-gray-900 font-medium px-2 py-1.5 focus:ring-primary-500" 
                                            />
                                        </div>
                                     </div>
                                </div>
                            </div>

                            {/* Justification Area */}
                            {isVendorChanged && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                        Justification for Vendor Change <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Please explain why the vendor is different from the original procurement request..."
                                        className="w-full border-yellow-300 bg-yellow-50 rounded-lg text-sm focus:ring-yellow-500 p-3 text-gray-800 placeholder:text-gray-400"
                                    ></textarea>
                                </div>
                            )}
                        </section>

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
                                {/* Vendor Field Removed as requested */}
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
                                     <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(parseFloat(e.target.value) || 0)}
                                        className={`w-full border rounded text-sm focus:ring-primary-500 px-3 py-2 ${isOverLimit ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                     />
                                     {isOverLimit && (
                                         <p className="text-xs text-red-600 mt-1 font-bold">Exceeds remaining limit!</p>
                                     )}
                                </div>
                                <div>
                                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax Amount</label>
                                     <input type="number" placeholder="0.00" className="w-full border-gray-300 rounded text-sm focus:ring-primary-500 px-3 py-2" />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="advPayment" 
                                        checked={isAdvancedPayment}
                                        onChange={(e) => setIsAdvancedPayment(e.target.checked)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="advPayment" className="text-sm text-gray-700 font-medium">Flag as Advanced Payment</label>
                                </div>
                            </div>
                        </div>

                        {/* Cost & Margin / Budget Allocation */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            {procurementData.type === 'Direct Procurement' ? (
                                <>
                                    {/* Project Details Section (Direct Only) */}
                                    <div className="mb-6 border-b border-gray-100 pb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary-600">folder_open</span>
                                                Project Details
                                            </h2>
                                        </div>

                                        {/* Project Filters */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Project No.</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search Project No..." 
                                                    value={projectFilters.no}
                                                    onChange={(e) => setProjectFilters(prev => ({...prev, no: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Client</label>
                                                <select 
                                                    value={projectFilters.client}
                                                    onChange={(e) => setProjectFilters(prev => ({...prev, client: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9 bg-white"
                                                >
                                                    <option value="">All Clients</option>
                                                    {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Order Country</label>
                                                <select 
                                                    value={projectFilters.country}
                                                    onChange={(e) => setProjectFilters(prev => ({...prev, country: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9 bg-white"
                                                >
                                                    <option value="">All Countries</option>
                                                    {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">BU</label>
                                                <select 
                                                    value={projectFilters.bu}
                                                    onChange={(e) => setProjectFilters(prev => ({...prev, bu: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9 bg-white"
                                                >
                                                    <option value="">All BUs</option>
                                                    {uniqueBUs.map(b => <option key={b} value={b}>{b}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[300px]">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs sticky top-0 z-10">
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
                                                    {filteredProjects.map((proj: any) => (
                                                        <tr key={proj.projectId} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedProjectIds.includes(proj.projectId)} 
                                                                    onChange={() => toggleProject(proj.projectId)}
                                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-gray-900">{proj.pjNoMain}-{proj.pjNoSub}</td>
                                                            <td className="px-4 py-3 text-gray-600">{proj.orderNo}</td>
                                                            <td className="px-4 py-3">{proj.client}</td>
                                                            <td className="px-4 py-3">{proj.orderCountry}</td>
                                                            <td className="px-4 py-3">{proj.bu}</td>
                                                            <td className="px-4 py-3">{proj.prod}</td>
                                                            <td className="px-4 py-3 text-right font-medium">{proj.revenue.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary-600">calculate</span> Cost & Margin Calculation
                                    </h2>
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
                                                {selectedProjects.map((line: any, idx: number) => {
                                                    const totalCostLocal = (parseFloat(line.cost) || 0) + (parseFloat(line.existingProc) || 0);
                                                    const totalPtLocal = (parseFloat(line.passthrough) || 0) + (parseFloat(line.existingPt) || 0);
                                                    const totalCostUsd = line.costUsd + (parseFloat(line.existingProc) || 0);
                                                    const totalPtUsd = line.ptUsd + (parseFloat(line.existingPt) || 0);
                                                    const totalCostForMargin = totalCostUsd + totalPtUsd;
                                                    const margin = line.revenue > 0 ? ((line.revenue - totalCostForMargin) / line.revenue) * 100 : 0;

                                                    return (
                                                        <tr key={line.projectId || idx} className="hover:bg-gray-50 transition-colors group">
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
                                                                <input 
                                                                    type="number" 
                                                                    value={line.cost} 
                                                                    onChange={(e) => handleDirectItemChange(line.projectId, 'cost', e.target.value)}
                                                                    className={editableCellInputClass}
                                                                />
                                                            </td>
                                                            <td className={`${cellClass} bg-blue-50/20`}>
                                                                <input 
                                                                    type="number" 
                                                                    value={line.passthrough} 
                                                                    onChange={(e) => handleDirectItemChange(line.projectId, 'passthrough', e.target.value)}
                                                                    className={editableCellInputClass}
                                                                />
                                                            </td>
                                                            <td className={`${cellClass} text-right bg-blue-50/30`}>
                                                                <input 
                                                                    type="number" 
                                                                    value={line.costUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                                                    readOnly
                                                                    className={readOnlyCellInputClass}
                                                                />
                                                            </td>
                                                            <td className={`${cellClass} text-right bg-blue-50/30`}>
                                                                <input 
                                                                    type="number" 
                                                                    value={line.ptUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                                                    readOnly
                                                                    className={readOnlyCellInputClass}
                                                                />
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
                                                {selectedProjects.length === 0 && <tr><td colSpan={22} className="p-4 text-center text-gray-400">Select a project above to see cost calculation</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Budget Details (Search & Select) */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary-600">search</span>
                                                Budget Details
                                            </h2>
                                        </div>
                                        
                                        {/* Separate Filter Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Case Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search Case Name..." 
                                                    value={budgetFilters.name}
                                                    onChange={(e) => setBudgetFilters(prev => ({...prev, name: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Country</label>
                                                <select 
                                                    value={budgetFilters.country}
                                                    onChange={(e) => setBudgetFilters(prev => ({...prev, country: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9 bg-white"
                                                >
                                                    <option value="">All Countries</option>
                                                    {uniqueBudgetCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">BU</label>
                                                <select 
                                                    value={budgetFilters.bu}
                                                    onChange={(e) => setBudgetFilters(prev => ({...prev, bu: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9 bg-white"
                                                >
                                                    <option value="">All BUs</option>
                                                    {uniqueBudgetBUs.map(b => <option key={b} value={b}>{b}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Team</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search Team..." 
                                                    value={budgetFilters.team}
                                                    onChange={(e) => setBudgetFilters(prev => ({...prev, team: e.target.value}))}
                                                    className="w-full border-gray-300 rounded-lg text-xs focus:ring-primary-500 h-9" 
                                                />
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[300px]">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-4 py-3 w-10"></th>
                                                        <th className="px-4 py-3">Case Name</th>
                                                        <th className="px-4 py-3">Country</th>
                                                        <th className="px-4 py-3">BU</th>
                                                        <th className="px-4 py-3">Team</th>
                                                        <th className="px-4 py-3 text-right">Remaining</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {filteredBudgets.map(budget => (
                                                        <tr key={budget.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedBudgetIds.includes(budget.id)} 
                                                                    onChange={() => toggleBudget(budget)}
                                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-gray-900">{budget.name}</td>
                                                            <td className="px-4 py-3">{budget.country}</td>
                                                            <td className="px-4 py-3">{budget.bu}</td>
                                                            <td className="px-4 py-3">{budget.team}</td>
                                                            <td className="px-4 py-3 text-right font-medium text-green-600">{budget.remaining.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Budget Allocation Table */}
                                    <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4 border-t border-gray-100 pt-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary-600">pie_chart</span> Budget Allocation
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">Allocate the total request amount to selected budgets.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={allocateByRatio} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors">
                                                <span className="material-symbols-outlined text-sm">pie_chart</span> Allocate by Budget Ratio
                                            </button>
                                            <button onClick={addManualBudget} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors">
                                                <span className="material-symbols-outlined text-sm">add</span> Add Unbudgeted Item
                                            </button>
                                        </div>
                                    </div>
                                    
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
                                                {procurementData.items.map((item: any, idx: number) => (
                                                    <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-2 py-1 sticky left-0 bg-white z-10 border-r border-gray-100 text-center">
                                                            <button onClick={() => removeBudgetLine(item.id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>
                                                        </td>
                                                        <td className="px-2 py-1"><div className={readOnlyInputClass}>{item.type}</div></td>
                                                        <td className="px-2 py-1">
                                                            {item.type === 'Unbudget' ? 
                                                                <input type="text" value={item.name} onChange={(e) => updateBudgetLine(item.id, 'name', e.target.value)} className={readOnlyInputClass + " border-b border-gray-300 bg-white"} /> : 
                                                                <div className={readOnlyInputClass}>{item.name}</div>
                                                            }
                                                        </td>
                                                        <td className="px-2 py-1"><div className={readOnlyInputClass}>{item.bu}</div></td>
                                                        <td className="px-2 py-1"><div className={readOnlyInputClass}>{item.country}</div></td>
                                                        <td className="px-2 py-1"><div className={readOnlyInputClass}>{item.team}</div></td>
                                                        <td className="px-2 py-1 bg-primary-50/20 border-l border-primary-100">
                                                            <input 
                                                                type="number" 
                                                                value={item.allocation} 
                                                                onChange={(e) => updateBudgetLine(item.id, 'allocation', e.target.value)} 
                                                                className="w-full border-primary-300 rounded text-xs font-bold text-right focus:ring-primary-500 text-primary-700 bg-white px-1 py-1"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1 text-right text-gray-500">{item.cost25b}</td>
                                                        <td className="px-2 py-1 text-right text-gray-500">{item.existing}</td>
                                                        <td className="px-2 py-1 text-center"><div className={readOnlyInputClass}>USD</div></td>
                                                        <td className="px-2 py-1 text-right text-gray-500">{item.prior}</td>
                                                        <td className="px-2 py-1 text-right text-gray-500">{item.thisYear}</td>
                                                        <td className="px-2 py-1 text-right text-gray-500">{item.future}</td>
                                                        <td className="px-2 py-1 text-right font-medium text-gray-900 bg-gray-50">{item.remaining}</td>
                                                    </tr>
                                                ))}
                                                {procurementData.items.length === 0 && <tr><td colSpan={14} className="p-4 text-center text-gray-400 italic">No budgets allocated. Select budgets from the details table above.</td></tr>}
                                            </tbody>
                                            <tfoot className="bg-gray-50 border-t border-gray-200 text-xs">
                                                <tr>
                                                    <td colSpan={6} className="px-2 py-2 font-bold text-gray-900 text-right sticky left-0">Total Allocated:</td>
                                                    <td className="px-2 py-2 text-right font-bold text-primary-700 border-l border-primary-200 bg-primary-50">
                                                        {procurementData.items.reduce((acc:number, i:any) => acc + (i.allocation || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                    </td>
                                                    <td colSpan={7}></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                   <div className="lg:col-span-1 space-y-6">
                        {/* Linked Procurement Info Side Panel */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                             <h2 className="text-lg font-bold text-gray-900 mb-4">Linked Procurement</h2>
                             <div className="text-sm space-y-3 text-gray-600">
                                 <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Order No:</span> <span className="font-medium text-gray-900">{procurementData.orderNo}</span></div>
                                 <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">PJ No:</span> <span className="font-medium text-gray-900">{procurementData.pjNo}</span></div>
                                 <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Client:</span> <span className="font-medium text-gray-900">{procurementData.client}</span></div>
                                 <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">BU:</span> <span className="font-medium text-gray-900">{procurementData.bu}</span></div>
                                 <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Original Vendor:</span> <span className="font-medium text-gray-900">{originalVendorName}</span></div>
                                 <div className="flex justify-between pt-2">
                                     <span className="text-gray-500">Total PR Amt:</span> 
                                     <span className="font-bold text-green-700">${procurementData.totalPrAmount.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-gray-500">Remaining:</span> 
                                     <span className="font-bold text-primary-700">${remainingLimit.toLocaleString()}</span>
                                 </div>
                             </div>
                             <a href="#" className="inline-flex items-center gap-1 mt-6 text-sm font-bold text-primary-600 hover:underline">
                                 View Full Record <span className="material-symbols-outlined text-base">open_in_new</span>
                             </a>
                        </div>
                   </div>
                </div>
               )}
           </div>
       ) : (
           <UnlinkedInvoice />
       )}
      </div>
    </>
  );
};

export default InvoiceRequest;
