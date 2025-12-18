
import React, { useState } from 'react';

const VendorManagement = () => {
  const [filters, setFilters] = useState({
    name: '',
    country: '',
    reg: '',
    status: ''
  });
  
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  
  // Vendor Modal State
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<any>(null);

  // Contacts Modal State
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [activeVendorForContacts, setActiveVendorForContacts] = useState<any>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);

  const [vendors, setVendors] = useState([
    { id: 1, name: 'Office Supplies Co.', type: 'Corporate', country: 'Singapore', grade: 'Grade A', address: '123 Business Park, #01-01', reg: '202101234A', payment: 'DBS 123-456-7890', status: 'Active' },
    { id: 2, name: 'Office Supplies Inc.', type: 'Corporate', country: 'Singapore', grade: '-', address: '123 Business Park, #01-01', reg: '202101234A', payment: 'DBS 123-456-7890', status: 'Duplicate' },
    { id: 3, name: 'Global Tech Inc.', type: 'Corporate', country: 'USA', grade: 'Grade A', address: '456 Valley Road, CA 90210', reg: 'US-998877', payment: 'Chase 987-654-321', status: 'Active' },
    { id: 4, name: 'Staples & More', type: 'Corporate', country: 'Singapore', grade: 'Grade B', address: '789 Industrial Ave, #05-12', reg: '202105678B', payment: 'UOB 111-222-333', status: 'Active' },
    { id: 5, name: 'Tech Solutions Ltd.', type: 'Individual', country: 'Malaysia', grade: 'Grade B', address: '88 KL Tower, Jalan P Ramlee', reg: 'MY-112233', payment: 'Maybank 444-555-666', status: 'Inactive' },
  ]);

  // Mock Contacts Data linked to Vendor Name
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Alice Tan', email: 'alice@supplies-co.com', phone: '+65 9123 4567', position: 'Manager', vendor: 'Office Supplies Co.' },
    { id: 2, name: 'Bob Lim', email: 'bob@supplies-co.com', phone: '+65 9876 5432', position: 'Sales', vendor: 'Office Supplies Co.' },
  ]);

  const filteredVendors = vendors.filter(v => 
    (!filters.name || v.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (!filters.country || v.country === filters.country || filters.country === '') &&
    (!filters.reg || v.reg.toLowerCase().includes(filters.reg.toLowerCase())) &&
    (!filters.status || v.status === filters.status || filters.status === '')
  );

  const uniqueCountries = Array.from(new Set(vendors.map(v => v.country)));

  // Identify duplicates based on Registration Number for this example
  const duplicateRegNos = vendors
    .map(v => v.reg)
    .filter((reg, index, self) => self.indexOf(reg) !== index && reg !== 'Pending');
  
  const potentialDuplicates = vendors.filter(v => duplicateRegNos.includes(v.reg));

  // --- Vendor Actions ---
  const toggleSelection = (id: number) => {
    if (selectedVendors.includes(id)) {
      setSelectedVendors(selectedVendors.filter(vId => vId !== id));
    } else {
      setSelectedVendors([...selectedVendors, id]);
    }
  };

  const handleMerge = () => {
      alert('Vendors merged successfully using selected fields!');
      setShowMergeModal(false);
      setSelectedVendors([]);
  };

  const initiateDuplicateMerge = () => {
      setSelectedVendors(potentialDuplicates.map(v => v.id));
      setShowMergeModal(true);
  };

  const getSelectedVendorObjects = () => vendors.filter(v => selectedVendors.includes(v.id));
  
  const [mergeState, setMergeState] = useState({ name: 0, country: 0, reg: 0 });

  // --- Vendor CRUD ---
  const openVendorModal = (vendor: any = null) => {
      if (vendor) {
          setCurrentVendor({ ...vendor });
      } else {
          setCurrentVendor({
              id: 0, // New
              name: '',
              type: 'Corporate',
              country: 'Singapore',
              grade: 'New',
              address: '',
              reg: '',
              payment: '',
              status: 'Active'
          });
      }
      setShowVendorModal(true);
  };

  const handleSaveVendor = () => {
      if (!currentVendor.name) {
          alert("Vendor Name is required");
          return;
      }

      if (currentVendor.id === 0) {
          const newId = Math.max(...vendors.map(v => v.id), 0) + 1;
          setVendors([...vendors, { ...currentVendor, id: newId }]);
      } else {
          setVendors(vendors.map(v => v.id === currentVendor.id ? currentVendor : v));
      }
      setShowVendorModal(false);
  };

  const handleDeleteVendor = (id: number) => {
      if (window.confirm('Are you sure you want to delete this vendor record? This action cannot be undone.')) {
          setVendors(vendors.filter(v => v.id !== id));
          // Clean up related contacts if relying on name match (in real app would use ID)
          const vendorName = vendors.find(v => v.id === id)?.name;
          if(vendorName) {
             setContacts(contacts.filter(c => c.vendor !== vendorName));
          }
      }
  };

  // --- Contact Actions ---
  const openContactsModal = (vendor: any) => {
      setActiveVendorForContacts(vendor);
      setIsEditingContact(false); // Reset to list view
      setShowContactsModal(true);
  };

  const getContactsForActiveVendor = () => contacts.filter(c => c.vendor === activeVendorForContacts?.name);

  const openContactForm = (contact: any = null) => {
      if (contact) {
          setCurrentContact({ ...contact });
      } else {
          setCurrentContact({
              id: 0,
              name: '',
              position: '',
              email: '',
              phone: '',
              vendor: activeVendorForContacts?.name // Bind to current vendor
          });
      }
      setIsEditingContact(true);
  };

  const handleSaveContact = () => {
      if (!currentContact.name) return;

      if (currentContact.id === 0) {
          const newId = Math.max(...contacts.map(c => c.id), 0) + 1;
          setContacts([...contacts, { ...currentContact, id: newId }]);
      } else {
          setContacts(contacts.map(c => c.id === currentContact.id ? currentContact : c));
      }
      setIsEditingContact(false);
  };

  const handleDeleteContact = (id: number) => {
      if (window.confirm('Delete this contact?')) {
          setContacts(contacts.filter(c => c.id !== id));
      }
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
           <p className="text-gray-500 mt-1">Consolidate and manage existing vendor records.</p>
        </div>
        <button 
            onClick={() => openVendorModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-700 shadow-sm transition-colors"
        >
           <span className="material-symbols-outlined text-lg">add</span>
           Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Duplicate Detection Alert */}
          {potentialDuplicates.length > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-600">warning</span>
                      <div>
                          <p className="font-bold text-amber-900 text-sm">Potential Duplicates Detected</p>
                          <p className="text-amber-700 text-xs mt-0.5">
                              Found {potentialDuplicates.length} vendors sharing Registration No: <strong>{duplicateRegNos.join(', ')}</strong>
                              <span className="opacity-75"> ({potentialDuplicates.map(v => v.name).join(', ')})</span>
                          </p>
                      </div>
                  </div>
                  <button 
                    onClick={initiateDuplicateMerge}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-100 shadow-sm flex items-center gap-2 transition-colors h-10"
                  >
                      <span className="material-symbols-outlined text-sm">merge_type</span>
                      Review & Merge
                  </button>
              </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Vendor Name</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder="Search Name..." 
                        className="w-full pl-9 border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500" 
                        value={filters.name}
                        onChange={(e) => setFilters({...filters, name: e.target.value})}
                    />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Country</label>
                <select 
                    className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500 bg-white"
                    value={filters.country}
                    onChange={(e) => setFilters({...filters, country: e.target.value})}
                >
                    <option value="">All Countries</option>
                    {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Registration No.</label>
                <input 
                    type="text" 
                    placeholder="Search Reg No..." 
                    className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500" 
                    value={filters.reg}
                    onChange={(e) => setFilters({...filters, reg: e.target.value})}
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <select 
                    className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500 bg-white"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Duplicate">Duplicate</option>
                </select>
             </div>
          </div>

          <div className="flex justify-end gap-2 mb-6">
                 <button 
                    onClick={() => setFilters({name:'', country:'', reg:'', status:''})}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 h-10"
                 >
                    <span className="material-symbols-outlined">filter_alt_off</span> Clear Filters
                 </button>
                 <button 
                    disabled={selectedVendors.length < 2}
                    onClick={() => setShowMergeModal(true)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-10"
                 >
                    <span className="material-symbols-outlined">merge</span> Merge Selected ({selectedVendors.length})
                 </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                          <th className="p-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Vendor Name</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Country</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Grade</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Vendor Address</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Registration No.</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Payment Info</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredVendors.map((vendor) => {
                          const isDuplicate = potentialDuplicates.some(p => p.id === vendor.id);
                          return (
                          <tr key={vendor.id} className={`transition-colors border-l-4 ${isDuplicate ? 'bg-amber-50/50 border-l-amber-400 hover:bg-amber-100/50' : 'border-l-transparent hover:bg-gray-50'} ${selectedVendors.includes(vendor.id) ? 'bg-primary-50' : ''}`}>
                              <td className="p-4 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedVendors.includes(vendor.id)}
                                    onChange={() => toggleSelection(vendor.id)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                                  />
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${vendor.type === 'Corporate' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                      {vendor.type}
                                  </span>
                              </td>
                              <td className="p-4">
                                  <a href="#" className="font-medium text-primary-600 hover:text-primary-800 hover:underline">{vendor.name}</a>
                                  {isDuplicate && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Duplicate?</span>}
                              </td>
                              <td className="p-4 text-sm text-gray-500">{vendor.country}</td>
                              <td className="p-4 text-sm text-gray-500">{vendor.grade}</td>
                              <td className="p-4 text-sm text-gray-500 truncate max-w-xs" title={vendor.address}>{vendor.address}</td>
                              <td className="p-4 text-sm text-gray-500 font-mono">{vendor.reg}</td>
                              <td className="p-4 text-sm text-gray-500 font-mono">{vendor.payment}</td>
                              <td className="p-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                    vendor.status === 'Duplicate' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                      {vendor.status}
                                  </span>
                              </td>
                              <td className="p-4 flex gap-2">
                                  <button onClick={() => openContactsModal(vendor)} className="text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-gray-100" title="Manage Contacts">
                                      <span className="material-symbols-outlined text-lg">perm_contact_calendar</span>
                                  </button>
                                  <button onClick={() => openVendorModal(vendor)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100" title="Edit Vendor">
                                      <span className="material-symbols-outlined text-lg">edit</span>
                                  </button>
                                  <button onClick={() => handleDeleteVendor(vendor.id)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Delete Vendor">
                                      <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                              </td>
                          </tr>
                      )})}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Advanced Merge Modal */}
      {showMergeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900">Merge Vendors</h2>
                          <p className="text-sm text-gray-500">Select the correct value for each field to create the master record.</p>
                      </div>
                      <button onClick={() => setShowMergeModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  
                  <div className="p-6">
                      <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">info</span>
                          Merging <strong>{getSelectedVendorObjects().length}</strong> records. Contacts from all selected vendors will be moved to the final master record.
                      </div>
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr>
                                  <th className="p-3 border-b border-gray-200 text-sm font-semibold text-gray-500 w-1/4">Field</th>
                                  {getSelectedVendorObjects().map((v, i) => (
                                      <th key={v.id} className="p-3 border-b border-gray-200 text-sm font-bold text-gray-900">
                                          Source {i + 1} ({v.id})
                                      </th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {/* Name Row */}
                              <tr className="hover:bg-gray-50">
                                  <td className="p-3 border-b border-gray-100 font-medium text-gray-700">Vendor Name</td>
                                  {getSelectedVendorObjects().map((v, i) => (
                                      <td key={v.id} className={`p-3 border-b border-gray-100 cursor-pointer ${mergeState.name === i ? 'bg-blue-50 ring-1 ring-blue-500' : ''}`} onClick={() => setMergeState({...mergeState, name: i})}>
                                          <div className="flex items-center gap-2">
                                              <input type="radio" checked={mergeState.name === i} readOnly className="text-primary-600 focus:ring-primary-500" />
                                              {v.name}
                                          </div>
                                      </td>
                                  ))}
                              </tr>
                              {/* Country Row */}
                              <tr className="hover:bg-gray-50">
                                  <td className="p-3 border-b border-gray-100 font-medium text-gray-700">Country</td>
                                  {getSelectedVendorObjects().map((v, i) => (
                                      <td key={v.id} className={`p-3 border-b border-gray-100 cursor-pointer ${mergeState.country === i ? 'bg-blue-50 ring-1 ring-blue-500' : ''}`} onClick={() => setMergeState({...mergeState, country: i})}>
                                          <div className="flex items-center gap-2">
                                              <input type="radio" checked={mergeState.country === i} readOnly className="text-primary-600 focus:ring-primary-500" />
                                              {v.country}
                                          </div>
                                      </td>
                                  ))}
                              </tr>
                              {/* Reg Row */}
                              <tr className="hover:bg-gray-50">
                                  <td className="p-3 border-b border-gray-100 font-medium text-gray-700">Registration No.</td>
                                  {getSelectedVendorObjects().map((v, i) => (
                                      <td key={v.id} className={`p-3 border-b border-gray-100 cursor-pointer ${mergeState.reg === i ? 'bg-blue-50 ring-1 ring-blue-500' : ''}`} onClick={() => setMergeState({...mergeState, reg: i})}>
                                          <div className="flex items-center gap-2">
                                              <input type="radio" checked={mergeState.reg === i} readOnly className="text-primary-600 focus:ring-primary-500" />
                                              {v.reg}
                                          </div>
                                      </td>
                                  ))}
                              </tr>
                          </tbody>
                      </table>

                      <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-lg">
                          <h3 className="text-sm font-bold text-green-800 mb-2">Preview Master Record</h3>
                          <div className="text-sm text-green-700 grid grid-cols-3 gap-4">
                              <div><span className="block text-xs uppercase text-green-600">Name</span> {getSelectedVendorObjects()[mergeState.name]?.name}</div>
                              <div><span className="block text-xs uppercase text-green-600">Country</span> {getSelectedVendorObjects()[mergeState.country]?.country}</div>
                              <div><span className="block text-xs uppercase text-green-600">Reg No</span> {getSelectedVendorObjects()[mergeState.reg]?.reg}</div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                      <button onClick={() => setShowMergeModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white text-gray-700 h-10">Cancel</button>
                      <button onClick={handleMerge} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm h-10">Confirm Merge</button>
                  </div>
              </div>
          </div>
      )}

      {/* Add/Edit Vendor Modal */}
      {showVendorModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900">{currentVendor.id ? 'Edit Vendor' : 'Add New Vendor'}</h3>
                      <button onClick={() => setShowVendorModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Vendor Name <span className="text-red-500">*</span></label>
                              <input type="text" value={currentVendor.name} onChange={(e) => setCurrentVendor({...currentVendor, name: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                              <select value={currentVendor.type} onChange={(e) => setCurrentVendor({...currentVendor, type: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500">
                                  <option>Corporate</option>
                                  <option>Individual</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                              <input type="text" value={currentVendor.country} onChange={(e) => setCurrentVendor({...currentVendor, country: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Grade</label>
                              <input type="text" value={currentVendor.grade} onChange={(e) => setCurrentVendor({...currentVendor, grade: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500" />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                              <input type="text" value={currentVendor.address} onChange={(e) => setCurrentVendor({...currentVendor, address: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Registration No.</label>
                              <input type="text" value={currentVendor.reg} onChange={(e) => setCurrentVendor({...currentVendor, reg: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Info</label>
                              <input type="text" value={currentVendor.payment} onChange={(e) => setCurrentVendor({...currentVendor, payment: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500" />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                              <select value={currentVendor.status} onChange={(e) => setCurrentVendor({...currentVendor, status: e.target.value})} className="w-full border border-gray-300 rounded-lg text-sm p-2.5 focus:ring-primary-500">
                                  <option>Active</option>
                                  <option>Inactive</option>
                                  <option>Duplicate</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button onClick={() => setShowVendorModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white text-gray-700">Cancel</button>
                      <button onClick={handleSaveVendor} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Save Vendor</button>
                  </div>
              </div>
          </div>
      )}

      {/* Manage Contacts Modal */}
      {showContactsModal && activeVendorForContacts && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900">{isEditingContact ? (currentContact.id ? 'Edit Contact' : 'Add Contact') : 'Manage Contacts'}</h2>
                          <p className="text-sm text-gray-500">For {activeVendorForContacts.name}</p>
                      </div>
                      <button onClick={() => setShowContactsModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  
                  <div className="p-6">
                      {!isEditingContact ? (
                          <>
                              <div className="flex justify-end mb-4">
                                  <button 
                                    onClick={() => openContactForm()}
                                    className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                                  >
                                      <span className="material-symbols-outlined text-lg">add_circle</span> Add Contact
                                  </button>
                              </div>
                              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-gray-50 border-b border-gray-200">
                                          <tr>
                                              <th className="p-3 font-semibold text-gray-600">Name</th>
                                              <th className="p-3 font-semibold text-gray-600">Position</th>
                                              <th className="p-3 font-semibold text-gray-600">Email</th>
                                              <th className="p-3 font-semibold text-gray-600">Phone</th>
                                              <th className="p-3 font-semibold text-gray-600 text-right">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {getContactsForActiveVendor().map((contact) => (
                                              <tr key={contact.id} className="hover:bg-gray-50">
                                                  <td className="p-3 font-medium text-gray-900">{contact.name}</td>
                                                  <td className="p-3 text-gray-600">{contact.position}</td>
                                                  <td className="p-3 text-gray-600">{contact.email}</td>
                                                  <td className="p-3 text-gray-600">{contact.phone}</td>
                                                  <td className="p-3 text-right">
                                                      <button onClick={() => openContactForm(contact)} className="text-gray-400 hover:text-primary-600 mr-2"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                      <button onClick={() => handleDeleteContact(contact.id)} className="text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                  </td>
                                              </tr>
                                          ))}
                                          {getContactsForActiveVendor().length === 0 && (
                                              <tr><td colSpan={5} className="p-6 text-center text-gray-400 italic">No contacts found for this vendor.</td></tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </>
                      ) : (
                          <div className="space-y-4 animate-in fade-in">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" value={currentContact.name} onChange={(e) => setCurrentContact({...currentContact, name: e.target.value})} className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                <input type="text" value={currentContact.position} onChange={(e) => setCurrentContact({...currentContact, position: e.target.value})} className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" value={currentContact.email} onChange={(e) => setCurrentContact({...currentContact, email: e.target.value})} className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" value={currentContact.phone} onChange={(e) => setCurrentContact({...currentContact, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500" />
                              </div>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                      {isEditingContact ? (
                          <>
                              <button onClick={() => setIsEditingContact(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white text-gray-700">Back</button>
                              <button onClick={handleSaveContact} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Save Contact</button>
                          </>
                      ) : (
                          <button onClick={() => setShowContactsModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 h-10">Close</button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default VendorManagement;
