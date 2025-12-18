
import React, { useState } from 'react';

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('GL Code Mappings');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null); // If null, it's an add action

  const tabs = ['GL Code Mappings', 'Approval Matrices', 'Tax Codes', 'Currency Exchange Rates'];

  // Mock Data
  const [glData, setGlData] = useState([
      { id: 1, country: 'Singapore', cat: 'Software Licenses', code: '6150-Software', desc: 'Annual subscription for design software', mod: '2023-10-26' },
      { id: 2, country: 'Malaysia', cat: 'Office Supplies', code: '7200-Supplies', desc: 'General office supply expenses', mod: '2023-10-25' },
  ]);

  const [approvalData, setApprovalData] = useState([
      { id: 1, team: 'Marketing', limit: 5000, approver: 'sarah.manager@mims.com' },
      { id: 2, team: 'Marketing', limit: 10000, approver: 'director.marketing@mims.com' },
      { id: 3, team: 'IT', limit: 2000, approver: 'alex.admin@mims.com' },
  ]);

  const [taxData, setTaxData] = useState([
      { id: 1, entity: 'MIMS Pte Ltd', year: '2024', code: 'GST-9', rate: 9, desc: 'Singapore GST 2024' },
      { id: 2, entity: 'MIMS Sdn Bhd', year: '2024', code: 'SST-6', rate: 6, desc: 'Malaysia SST' },
  ]);

  const [currencyData, setCurrencyData] = useState([
      { id: 1, currency: 'USD', year: '2024', rate: 1.3450, effectiveDate: '2024-01-01' },
      { id: 2, currency: 'MYR', year: '2024', rate: 0.2850, effectiveDate: '2024-01-01' },
  ]);

  // Open Modal Helper
  const openModal = (item: any = null) => {
      setEditItem(item);
      setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
      setShowModal(false);
      setEditItem(null);
  };

  const renderContent = () => {
      switch (activeTab) {
          case 'GL Code Mappings':
              return (
                  <table className="w-full text-left">
                   <thead className="bg-gray-50 border-y border-gray-200">
                       <tr>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Country</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Expense Category</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">GL Code</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Description</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {glData.map((row, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.country}</td>
                               <td className="px-6 py-4 text-sm text-gray-900">{row.cat}</td>
                               <td className="px-6 py-4 text-sm text-gray-500 font-mono">{row.code}</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{row.desc}</td>
                               <td className="px-6 py-4"><button onClick={() => openModal(row)} className="p-2 text-gray-400 hover:text-primary-600"><span className="material-symbols-outlined">edit</span></button></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
              );
        case 'Approval Matrices':
            return (
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-y border-gray-200">
                       <tr>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Responsible Team</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900 text-right">Approval Limit</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Assigned Approver</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {approvalData.map((row, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm text-gray-900">{row.team}</td>
                               <td className="px-6 py-4 text-sm text-gray-900 font-mono text-right">{row.limit.toLocaleString()}</td>
                               <td className="px-6 py-4 text-sm text-blue-600 font-medium">{row.approver}</td>
                               <td className="px-6 py-4"><button onClick={() => openModal(row)} className="p-2 text-gray-400 hover:text-primary-600"><span className="material-symbols-outlined">edit</span></button></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            );
        case 'Tax Codes':
            return (
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-y border-gray-200">
                       <tr>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Entity</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Year</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Tax Code</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900 text-right">Rate (%)</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Description</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {taxData.map((row, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm text-gray-900">{row.entity}</td>
                               <td className="px-6 py-4 text-sm text-gray-600">{row.year}</td>
                               <td className="px-6 py-4 text-sm font-mono text-gray-900">{row.code}</td>
                               <td className="px-6 py-4 text-sm text-gray-900 font-bold text-right">{row.rate}%</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{row.desc}</td>
                               <td className="px-6 py-4"><button onClick={() => openModal(row)} className="p-2 text-gray-400 hover:text-primary-600"><span className="material-symbols-outlined">edit</span></button></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            );
        case 'Currency Exchange Rates':
            return (
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-y border-gray-200">
                       <tr>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Currency</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Year</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900 text-right">Exchange Rate (to Local)</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Effective Date</th>
                           <th className="px-6 py-3 text-sm font-medium text-gray-900">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {currencyData.map((row, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                               <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.currency}</td>
                               <td className="px-6 py-4 text-sm text-gray-600">{row.year}</td>
                               <td className="px-6 py-4 text-sm font-mono text-right">{row.rate.toFixed(4)}</td>
                               <td className="px-6 py-4 text-sm text-gray-600">{row.effectiveDate}</td>
                               <td className="px-6 py-4"><button onClick={() => openModal(row)} className="p-2 text-gray-400 hover:text-primary-600"><span className="material-symbols-outlined">edit</span></button></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            );
        default: return <div className="p-4 text-gray-500">Table content placeholder</div>;
      }
  }

  // Generic Form Modal Content based on Active Tab
  const renderModalForm = () => {
      if (activeTab === 'GL Code Mappings') {
          return (
              <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span></label><input type="text" defaultValue={editItem?.country} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Expense Category</label><input type="text" defaultValue={editItem?.cat} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">GL Code</label><input type="text" defaultValue={editItem?.code} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Description</label><input type="text" defaultValue={editItem?.desc} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
              </div>
          );
      } else if (activeTab === 'Approval Matrices') {
          return (
              <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700">Responsible Team</label><input type="text" defaultValue={editItem?.team} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Approval Limit Amount</label><input type="number" defaultValue={editItem?.limit} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Assigned Approver (Email)</label><input type="email" defaultValue={editItem?.approver} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" placeholder="user@mims.com" /></div>
              </div>
          );
      } else if (activeTab === 'Tax Codes') {
          return (
              <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700">Entity</label><input type="text" defaultValue={editItem?.entity} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Year</label><input type="text" defaultValue={editItem?.year} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Tax Code</label><input type="text" defaultValue={editItem?.code} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label><input type="number" defaultValue={editItem?.rate} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Description</label><input type="text" defaultValue={editItem?.desc} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
              </div>
          );
      } else if (activeTab === 'Currency Exchange Rates') {
          return (
              <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700">Currency</label><input type="text" defaultValue={editItem?.currency} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Year</label><input type="text" defaultValue={editItem?.year} className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Exchange Rate</label><input type="number" defaultValue={editItem?.rate} step="0.0001" className="w-full border-gray-300 rounded-lg mt-1 text-sm p-2" /></div>
              </div>
          );
      }
      return <div className="text-gray-500">Form for {activeTab}</div>;
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
       <div>
         <h1 className="text-3xl font-black text-gray-900 tracking-tight">Master Data Management</h1>
         <p className="text-gray-500 mt-2">Manage core system configurations and master data for automated accounting.</p>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
           {/* Tabs */}
           <div className="flex border-b border-gray-200 px-4 gap-8 overflow-x-auto no-scrollbar">
               {tabs.map((tab) => (
                   <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                   >
                       {tab}
                   </button>
               ))}
           </div>

           {/* Toolbar */}
           <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
               <div className="relative w-full sm:w-64">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                    <input type="text" placeholder="Search..." className="w-full pl-10 border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500" />
               </div>
               <button onClick={() => openModal()} className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-700 shadow-sm transition-colors">
                   <span className="material-symbols-outlined">add</span>
                   Add New {activeTab === 'Currency Exchange Rates' ? 'Rate' : activeTab.slice(0, -1)}
               </button>
           </div>

           {/* Content */}
           <div className="overflow-x-auto min-h-[300px]">
               {renderContent()}
           </div>
       </div>

       {/* Generic Modal */}
       {showModal && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95">
                   <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="text-lg font-bold text-gray-900">{editItem ? 'Edit' : 'Add'} {activeTab === 'Currency Exchange Rates' ? 'Rate' : activeTab.slice(0, -1)}</h3>
                       <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                   </div>
                   <div className="p-6">
                       {renderModalForm()}
                   </div>
                   <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                       <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white text-gray-700">Cancel</button>
                       <button onClick={closeModal} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Save Changes</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default MasterData;
