
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- Shared Types & Mock Data ---
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
  // Estimation Data
  estCost: number;     // Local Currency
  estCostUsd: number;  // Calculated USD
  estPt: number;       // Local Currency Passthrough
  estPtUsd: number;    // Calculated USD Passthrough
  currency: string;
  note: string;
  attachment: string;
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
    estPt: 0,
    estPtUsd: 0.00,
    currency: 'USD',
    note: '',
    attachment: ''
  }
];

const availableProjects = [
    { id: 'p1', no: 'SG-PR-001a', client: 'AstraZeneca', bu: 'MC', prod: 'Customised PJ', revenue: 3000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-001' },
    { id: 'p2', no: 'SG-PR-002b', client: 'Pfizer', bu: 'MIMS', prod: 'Webinar', revenue: 5500.00, orderCountry: 'Malaysia', orderNo: 'ORD-2024-002' },
    { id: 'p3', no: 'SG-PR-003c', client: 'Novartis', bu: 'MPF', prod: 'Campaign', revenue: 12000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-003' },
    { id: 'p4', no: 'SG-PR-004d', client: 'GSK', bu: 'MC', prod: 'Event', revenue: 8000.00, orderCountry: 'Singapore', orderNo: 'ORD-2024-004' },
];

const budgetDatabase = [
  { id: 101, name: 'Marketing Q3', bu: 'Marketing', country: 'Singapore', team: 'Digital Marketing', category: 'Office Supplies', cost25b: 625, existing: 2000, prior: 0, thisYear: 3000, future: 0, remaining: 1000 },
  { id: 102, name: 'IT Infrastructure Upgrade', bu: 'IT', country: 'Singapore', team: 'Infra', category: 'Hardware', cost25b: 5000, existing: 12000, prior: 1000, thisYear: 50000, future: 10000, remaining: 38000 },
  { id: 103, name: 'Sales Kickoff 2024', bu: 'Sales', country: 'Malaysia', team: 'Events', category: 'Travel', cost25b: 0, existing: 500, prior: 0, thisYear: 15000, future: 0, remaining: 14500 },
  { id: 104, name: 'Q4 Recruitment', bu: 'HR', country: 'Singapore', team: 'Recruitment', category: 'Services', cost25b: 2000, existing: 1500, prior: 0, thisYear: 10000, future: 0, remaining: 8500 },
];

const ProcurementRequest = () => {
  // --- View State ---
  const [view, setView] = useState<'Direct' | 'Other'>('Direct');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(document.getElementById('header-portal'));
  }, []);

  // --- Shared State (Request Info & Vendors) ---
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendorId, setSelectedVendorId] = useState<number>(initialVendors[0].id);
  const [requestCostCategory, setRequestCostCategory] = useState('Professional Fee');
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [showVendorSearch, setShowVendorSearch] = useState(false);

  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeVendorForContact, setActiveVendorForContact] = useState<number | null>(null);
  const [newContact, setNewContact] = useState({ name: '', position: '', email: '', phone: '' });

  // --- Direct Procurement State ---
  const [projectFilters, setProjectFilters] = useState({ no: '', client: '', country: '', bu: '' });
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [costLines, setCostLines] = useState<any[]>([]);

  // --- Other Procurement State ---
  const [budgetLines, setBudgetLines] = useState<any[]>([]);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<number[]>([]);
  
  // New Separate Filters for Budget Search (in Details Section)
  const [budgetFilters, setBudgetFilters] = useState({
    name: '',
    country: '',
    bu: '',
    team: ''
  });

  // --- Derived Values ---
  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
  const totalVendorEstUsd = (selectedVendor.estCostUsd || 0) + (selectedVendor.estPtUsd || 0);

  // Filter projects (Direct)
  const filteredProjects = availableProjects.filter(p => 
      (!projectFilters.no || p.no.toLowerCase().includes(projectFilters.no.toLowerCase())) &&
      (!projectFilters.client || p.client === projectFilters.client) &&
      (!projectFilters.country || p.orderCountry === projectFilters.country) &&
      (!projectFilters.bu || p.bu === projectFilters.bu)
  );
  
  const uniqueClients = Array.from(new Set(availableProjects.map(p => p.client)));
  const uniqueCountriesProj = Array.from(new Set(availableProjects.map(p => p.orderCountry)));
  const uniqueBUsProj = Array.from(new Set(availableProjects.map(p => p.bu)));


  // Filter budgets (Other) - AND Condition
  const filteredBudgets = budgetDatabase.filter(b => {
      const matchName = !budgetFilters.name || b.name.toLowerCase().includes(budgetFilters.name.toLowerCase());
      const matchCountry = !budgetFilters.country || b.country.toLowerCase().includes(budgetFilters.country.toLowerCase());
      const matchBU = !budgetFilters.bu || b.bu.toLowerCase().includes(budgetFilters.bu.toLowerCase());
      const matchTeam = !budgetFilters.team || b.team.toLowerCase().includes(budgetFilters.team.toLowerCase());
      return matchName && matchCountry && matchBU && matchTeam;
  });

  const uniqueCountries = Array.from(new Set(budgetDatabase.map(b => b.country)));
  const uniqueBUs = Array.from(new Set(budgetDatabase.map(b => b.bu)));

  // --- Effects ---
  
  // Sync Cost Lines with Selected Projects
  useEffect(() => {
      const newCostLines = selectedProjectIds.map(pid => {
          const existingLine = costLines.find(l => l.projectId === pid);
          if (existingLine) return existingLine;

          const project = availableProjects.find(p => p.id === pid);
          const isAstra = project?.client === 'AstraZeneca';

          // Robust split for PJ No
          const pjNoParts = project?.no.split('-') || [];
          const pjNoMain = pjNoParts.length >= 3 ? pjNoParts.slice(0, 3).join('-') : project?.no;
          // Extract last char if letter, or sub number logic
          const pjNoSub = pjNoParts[2]?.replace(/\d+/g, '') || '001'; 

          return {
              projectId: pid,
              client: project?.client,
              orderCountry: project?.orderCountry,
              insertionNo: isAstra ? 'INS-2024-001' : 'INS-2024-099',
              pjNoMain: pjNoMain,
              pjNoSub: pjNoSub,
              reportCtry: project?.orderCountry,
              bu: project?.bu,
              prod: project?.prod,
              edd: '2024-12-31',
              revenue: project?.revenue || 0,
              nonRevenue: isAstra ? 0 : 500,
              existingProc: isAstra ? 1200 : 0,
              existingPt: isAstra ? 300 : 0,
              // Editable Fields
              cost: 0,
              passthrough: 0,
              costUsd: 0,
              ptUsd: 0
          };
      }).filter(Boolean);
      setCostLines(newCostLines);
  }, [selectedProjectIds]); // eslint-disable-line

  // Sync Budget Lines with Selected Budgets
  useEffect(() => {
    setBudgetLines(prev => {
        // 1. Keep manual lines (ids not in DB or string ids)
        const manualLines = prev.filter(l => typeof l.id === 'string' && l.id.startsWith('manual_'));
        
        // 2. Keep selected DB lines, updating data if needed or just keeping input
        const dbLines = prev.filter(l => typeof l.id === 'number');
        const preservedDbLines = dbLines.filter(l => selectedBudgetIds.includes(l.id));
        
        // 3. Add new DB lines
        const newDbIds = selectedBudgetIds.filter(id => !preservedDbLines.find(l => l.id === id));
        const newDbLines = newDbIds.map(id => {
            const b = budgetDatabase.find(x => x.id === id);
            return b ? { ...b, allocation: 0, type: 'Budget' } : null;
        }).filter(Boolean);
        
        return [...manualLines, ...preservedDbLines, ...newDbLines];
    });
  }, [selectedBudgetIds]);

  // --- Handlers ---

  // Vendor Handlers
  const handleAddVendor = (name: string) => {
      const newVendor: Vendor = {
          id: Date.now(),
          name: name,
          country: 'Singapore',
          grade: 'New',
          address: 'Pending',
          reg: 'Pending',
          payment: 'Pending',
          type: 'Corporate',
          contacts: [],
          estCost: 0,
          estCostUsd: 0,
          estPt: 0,
          estPtUsd: 0,
          currency: 'USD',
          note: '',
          attachment: ''
      };
      setVendors([...vendors, newVendor]);
      setVendorSearchTerm('');
      setShowVendorSearch(false);
  };

  const removeVendor = (id: number) => {
      const updated = vendors.filter(v => v.id !== id);
      setVendors(updated);
      if (selectedVendorId === id && updated.length > 0) setSelectedVendorId(updated[0].id);
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

  // Contact Handlers
  const openContactModal = (vendorId: number) => {
      setActiveVendorForContact(vendorId);
      setNewContact({ name: '', position: '', email: '', phone: '' });
      setShowContactModal(true);
  };

  const handleSaveContact = () => {
      if (!activeVendorForContact) return;
      setVendors(vendors.map(v => {
          if (v.id === activeVendorForContact) {
              return { ...v, contacts: [...v.contacts, { ...newContact, id: Date.now() }] };
          }
          return v;
      }));
      setShowContactModal(false);
  };

  // Direct Procurement Handlers
  const toggleProject = (id: string) => {
      if (selectedProjectIds.includes(id)) {
          setSelectedProjectIds(selectedProjectIds.filter(pid => pid !== id));
      } else {
          setSelectedProjectIds([...selectedProjectIds, id]);
      }
  };

  const updateCostLine = (projectId: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    // Determine exchange rate based on selected vendor
    // Mock rates: SGD=0.74, MYR=0.21, USD=1
    const currency = selectedVendor.currency || 'USD';
    const rate = currency === 'SGD' ? 0.74 : (currency === 'MYR' ? 0.21 : 1);

    setCostLines(prev => prev.map(line => {
        if (line.projectId === projectId) {
            const updated = { ...line, [field]: numValue };
            
            // Auto-calculate USD values
            if (field === 'cost') {
                updated.costUsd = numValue * rate;
            }
            if (field === 'passthrough') {
                updated.ptUsd = numValue * rate;
            }
            return updated;
        }
        return line;
    }));
  };

  // Other Procurement Handlers
  const toggleBudget = (id: number) => {
    if (selectedBudgetIds.includes(id)) {
        setSelectedBudgetIds(prev => prev.filter(pid => pid !== id));
    } else {
        setSelectedBudgetIds(prev => [...prev, id]);
    }
  };

  const addManualBudget = () => {
    const newManual = {
        id: `manual_${Date.now()}`,
        type: 'Unbudget',
        name: 'New Unbudgeted Item',
        bu: 'Marketing',
        country: 'Singapore',
        team: '-',
        category: 'Misc',
        cost25b: 0, existing: 0, prior: 0, thisYear: 0, future: 0, remaining: 0,
        allocation: 0
    };
    setBudgetLines([...budgetLines, newManual]);
  };

  const removeBudgetLine = (id: string | number) => {
    if (typeof id === 'number') {
        setSelectedBudgetIds(prev => prev.filter(pid => pid !== id));
    } else {
        setBudgetLines(prev => prev.filter(l => l.id !== id));
    }
  };

  const updateBudgetLine = (id: string | number, field: string, val: string) => {
      setBudgetLines(prev => prev.map(line => {
          if (line.id === id) {
             if (field === 'allocation') return { ...line, allocation: parseFloat(val) || 0 };
             // Allow editing manual line details
             return { ...line, [field]: val };
          }
          return line;
      }));
  };

  const allocateByRatio = () => {
    // Target amount is the Vendor Estimated Total in USD
    const targetAmount = totalVendorEstUsd;
    
    if (targetAmount <= 0) {
        // Fallback if no vendor est? Or just do nothing? 
        return; 
    }

    // Filter lines that are valid for ratio distribution (must be linked budgets with remaining > 0)
    const validLines = budgetLines.filter(l => l.type === 'Budget' && (l.remaining || 0) > 0);
    const totalRemaining = validLines.reduce((acc, l) => acc + (l.remaining || 0), 0);

    if (totalRemaining === 0) return; // Avoid divide by zero

    setBudgetLines(prev => prev.map(line => {
        // Only update lines that contributed to the ratio
        if (line.type === 'Budget' && (line.remaining || 0) > 0) {
            const ratio = line.remaining / totalRemaining;
            const allocatedAmount = targetAmount * ratio;
            return { ...line, allocation: parseFloat(allocatedAmount.toFixed(2)) };
        }
        return line;
    }));
  };

  // --- Calculations ---
  // Direct
  const currentTotalCostUsd = costLines.reduce((acc, l) => acc + l.costUsd, 0);
  const currentTotalPtUsd = costLines.reduce((acc, l) => acc + l.ptUsd, 0);
  const totalDirectOverallUsd = currentTotalCostUsd + currentTotalPtUsd;

  // Other
  const otherTotalAllocated = budgetLines.reduce((acc, b) => acc + (b.allocation || 0), 0);

  // Styles
  const readOnlyInputClass = "w-full border-transparent bg-transparent rounded text-[10px] text-gray-700 font-medium px-1 py-1 truncate cursor-default";
  const headerClass = "px-2 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap";
  const cellClass = "px-2 py-1 border-b border-gray-100 whitespace-nowrap";
  const editableCellInputClass = "w-full bg-transparent border-none text-right text-xs focus:ring-2 focus:ring-primary-500 rounded px-1 py-1 font-semibold text-gray-900";
  const readOnlyCellInputClass = "w-full bg-transparent border-none text-right text-xs rounded px-1 py-1 font-medium text-gray-600 cursor-default focus:ring-0";


  return (
    <>
      {/* Header Portal */}
      {portalContainer && createPortal(
          <div className="flex items-center justify-between w-full h-full pl-0 md:pl-4">
              <div className="flex items-center gap-6">
                  <h1 className="text-xl font-bold text-gray-900 hidden md:block">Procurement Request</h1>
                  <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-bold">
                     <button 
                       onClick={() => setView('Direct')}
                       className={`px-3 py-1.5 rounded-md transition-all ${view === 'Direct' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                       Direct Procurement
                     </button>
                     <button 
                       onClick={() => setView('Other')}
                       className={`px-3 py-1.5 rounded-md transition-all ${view === 'Other' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                       Other Procurement
                     </button>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                   <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">Draft</span>
                   <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">Save as Draft</button>
                   <button className="hidden md:block px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 shadow-sm transition-colors flex items-center gap-1">
                       <span className="material-symbols-outlined text-sm">assignment_ind</span> Send to FPA
                   </button>
                   <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow-sm transition-colors">Submit for Approval</button>
              </div>
          </div>,
          portalContainer
      )}

      <div className="space-y-6 animate-fade-in pb-20">
          
          {/* Request Information (Common) */}
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
                        className="w-full border-gray-300 rounded text-xs px-2 py-1 focus:ring-primary-500 bg-white"
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
                    <input type="text" defaultValue="Marketing Team" className="w-full border-gray-300 rounded text-xs px-2 py-1 focus:ring-primary-500 bg-white" />
                </div>
            </div>
          </section>

          {/* Vendor Details (Common) */}
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
                                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                                    <button 
                                        onClick={() => updateVendorEst(vendor.id, 'type', 'Corporate')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendor.type === 'Corporate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Corporate
                                    </button>
                                    <button 
                                        onClick={() => updateVendorEst(vendor.id, 'type', 'Individual')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${vendor.type === 'Individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Individual
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => removeVendor(vendor.id)} className="text-gray-400 hover:text-red-500 p-1"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                        <div className="space-y-4 border-b border-gray-100 pb-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-500">Vendor Name</label>
                                <input type="text" value={vendor.name} className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Country</label>
                                    <input type="text" value={vendor.country} className="w-full border-transparent bg-gray-50 rounded text-xs text-gray-700 font-medium px-2 py-1" readOnly />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Grade</label>
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
                            {vendor.contacts && vendor.contacts.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500">Contacts</label>
                                    {vendor.contacts.map((c: any) => (
                                        <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div className="space-y-0.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Name</label>
                                                    <div className="text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1">{c.name}</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Position</label>
                                                    <div className="text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1">{c.position}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-0.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Email</label>
                                                    <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-2 py-1 truncate" title={c.email}>{c.email}</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Phone</label>
                                                    <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-2 py-1">{c.phone}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => openContactModal(vendor.id)}
                            className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-primary-600 text-sm font-medium hover:bg-primary-50 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span> Add Contact
                        </button>
                    </div>
                ))}

                {/* Add Vendor Card */}
                {vendors.length < 5 && (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl flex flex-col p-6 min-h-[350px] bg-gray-50/50">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vendor Search</label>
                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                                <span className="pl-3 text-gray-400 material-symbols-outlined">search</span>
                                <input 
                                    type="text" 
                                    className="w-full border-none focus:ring-0 text-sm py-2.5 px-3" 
                                    placeholder="Search existing..."
                                    value={vendorSearchTerm}
                                    onChange={(e) => { setVendorSearchTerm(e.target.value); setShowVendorSearch(true); }}
                                    onFocus={() => setShowVendorSearch(true)}
                                />
                            </div>
                            {showVendorSearch && vendorSearchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                                    <div onClick={() => handleAddVendor(vendorSearchTerm)} className="p-3 hover:bg-blue-50 cursor-pointer text-primary-600 font-medium text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined">add</span>
                                        Add '{vendorSearchTerm}' as new vendor
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 mt-8">
                            <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">add_business</span>
                            <p className="text-sm font-medium">Add another vendor for comparison</p>
                        </div>
                    </div>
                )}
            </div>
          </section>

          {/* Vendor Estimations (Common) */}
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
                            <th className="px-4 py-3 text-right">Passthrough (USD)</th>
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
                                        readOnly
                                        className="w-full border-transparent bg-transparent rounded text-xs px-2 py-1 text-right font-medium" 
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
                                    <input type="text" placeholder="Note..." className="w-full border-gray-300 rounded text-xs px-2 py-1" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </section>

          {/* VIEW SPECIFIC SECTIONS */}
          
          {view === 'Direct' ? (
              <>
                  {/* Project Details */}
                  <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-600">folder_open</span>
                            Project Details
                        </h2>
                    </div>

                    {/* Project Filters Grid */}
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
                                {uniqueCountriesProj.map(c => <option key={c} value={c}>{c}</option>)}
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
                                {uniqueBUsProj.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[300px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 w-10"></th>
                                    <th className="px-4 py-3">Project No.</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Order Ctry</th>
                                    <th className="px-4 py-3">BU</th>
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
                                        <td className="px-4 py-3">{proj.client}</td>
                                        <td className="px-4 py-3">{proj.orderCountry}</td>
                                        <td className="px-4 py-3">{proj.bu}</td>
                                        <td className="px-4 py-3 text-right font-medium">{proj.revenue.toLocaleString()}</td>
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
                        {Math.abs(totalDirectOverallUsd - totalVendorEstUsd) > 1 && (
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
                                                <input 
                                                    type="number" 
                                                    value={line.cost} 
                                                    onChange={(e) => updateCostLine(line.projectId, 'cost', e.target.value)}
                                                    className={editableCellInputClass}
                                                />
                                            </td>
                                            <td className={`${cellClass} bg-blue-50/20`}>
                                                <input 
                                                    type="number" 
                                                    value={line.passthrough} 
                                                    onChange={(e) => updateCostLine(line.projectId, 'passthrough', e.target.value)}
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
              </>
          ) : (
              <>
                  {/* Budget Details (Search & Select) */}
                  <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
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
                                {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
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
                                {uniqueBUs.map(b => <option key={b} value={b}>{b}</option>)}
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
                                                onChange={() => toggleBudget(budget.id)}
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
                  </section>

                  {/* Budget Allocation (Other) */}
                  <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                       <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
                           <div>
                               <h2 className="text-lg font-bold text-gray-900">Budget Allocation</h2>
                               <p className="text-sm text-gray-500 mt-1">Allocate the total request amount to one or more budgets.</p>
                           </div>
                           <div className="flex gap-2">
                               <button onClick={() => addManualBudget()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                   <span className="material-symbols-outlined text-lg">add_circle</span> Add Unbudgeted Item
                               </button>
                               <button onClick={allocateByRatio} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                   <span className="material-symbols-outlined text-lg">calculate</span> Allocate Proportionally
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
                                    {budgetLines.map((budget, idx) => (
                                        <tr key={budget.id || idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-1 sticky left-0 bg-white z-10 border-r border-gray-100 text-center">
                                                <button onClick={() => removeBudgetLine(budget.id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>
                                            </td>
                                            <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.type}</div></td>
                                            <td className="px-2 py-1">
                                                {budget.type === 'Unbudget' ? 
                                                    <input type="text" value={budget.name} onChange={(e) => updateBudgetLine(budget.id, 'name', e.target.value)} className={readOnlyInputClass + " border-b border-gray-300 bg-white"} /> : 
                                                    <div className={readOnlyInputClass}>{budget.name}</div>
                                                }
                                            </td>
                                            <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.bu}</div></td>
                                            <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.country}</div></td>
                                            <td className="px-2 py-1"><div className={readOnlyInputClass}>{budget.team}</div></td>
                                            <td className="px-2 py-1 bg-primary-50/20 border-l border-primary-100">
                                                <input 
                                                    type="number" 
                                                    value={budget.allocation} 
                                                    onChange={(e) => updateBudgetLine(budget.id, 'allocation', e.target.value)}
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
                                    {budgetLines.length === 0 && <tr><td colSpan={14} className="p-4 text-center text-gray-400">No budgets allocated. Select budgets from the table above or add manually.</td></tr>}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200 text-xs">
                                    <tr>
                                        <td colSpan={6} className="px-2 py-2 font-bold text-gray-900 text-right sticky left-0">Total Allocated:</td>
                                        <td className="px-2 py-2 text-right font-bold text-primary-700 border-l border-primary-200 bg-primary-50">
                                            {otherTotalAllocated.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td colSpan={7}></td>
                                    </tr>
                                </tfoot>
                            </table>
                       </div>
                       
                       <div className="flex justify-end mt-4">
                           <div className="text-right">
                               <p className="text-xs uppercase font-bold text-gray-500">Unallocated Amount</p>
                               <p className={`text-xl font-bold ${Math.abs(totalVendorEstUsd - otherTotalAllocated) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                                   ${(totalVendorEstUsd - otherTotalAllocated).toLocaleString(undefined, {minimumFractionDigits: 2})}
                               </p>
                           </div>
                       </div>
                  </section>
              </>
          )}

      </div>

      {/* Add Contact Modal */}
      {showContactModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900">Add New Contact</h3>
                      <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="p-5 space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                          <input type="text" value={newContact.name} onChange={(e) => setNewContact({...newContact, name: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 p-2.5" placeholder="e.g. Alice Tan" />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Position</label>
                          <input type="text" value={newContact.position} onChange={(e) => setNewContact({...newContact, position: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 p-2.5" placeholder="e.g. Sales Manager" />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                          <input type="email" value={newContact.email} onChange={(e) => setNewContact({...newContact, email: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 p-2.5" placeholder="alice@company.com" />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                          <input type="text" value={newContact.phone} onChange={(e) => setNewContact({...newContact, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 p-2.5" placeholder="+65 9123 4567" />
                      </div>
                  </div>
                  <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button onClick={() => setShowContactModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white text-gray-700">Cancel</button>
                      <button onClick={handleSaveContact} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Save Contact</button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default ProcurementRequest;
