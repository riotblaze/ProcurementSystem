
import React, { useState } from 'react';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Alice Tan', email: 'alice.tan@supplies-co.com', phone: '+65 9123 4567', position: 'Sales Manager', vendor: 'Office Supplies Co.' },
    { id: 2, name: 'Bob Lim', email: 'bob.lim@globaltech.com', phone: '+65 9876 5432', position: 'Account Director', vendor: 'Global Tech Inc.' },
    { id: 3, name: 'Charlie Ng', email: 'charlie.ng@staples.com', phone: '+65 8123 8123', position: 'Sales Rep', vendor: 'Staples & More' },
  ]);

  const [filters, setFilters] = useState({
    name: '',
    vendor: '',
    position: '',
    email: '',
    phone: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);

  const vendors = ['Office Supplies Co.', 'Global Tech Inc.', 'Staples & More', 'Tech Solutions Ltd.'];

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    (filters.vendor === '' || c.vendor === filters.vendor) &&
    c.position.toLowerCase().includes(filters.position.toLowerCase()) &&
    c.email.toLowerCase().includes(filters.email.toLowerCase()) &&
    c.phone.toLowerCase().includes(filters.phone.toLowerCase())
  );

  const openModal = (contact: any = null) => {
    setCurrentContact(contact || { name: '', email: '', phone: '', position: '', vendor: vendors[0] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContact(null);
  };

  const handleSave = () => {
    if (currentContact.id) {
      setContacts(contacts.map(c => c.id === currentContact.id ? currentContact : c));
    } else {
      setContacts([...contacts, { ...currentContact, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const clearFilters = () => {
    setFilters({ name: '', vendor: '', position: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
           <p className="text-gray-500 mt-1">Manage contacts tagged to vendors.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-700 shadow-sm transition-colors">
           <span className="material-symbols-outlined text-lg">add</span>
           Add New Contact
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Contact Name" 
                  className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500"
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                />
             </div>
             <div className="relative">
                 <select 
                    className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500 bg-white"
                    value={filters.vendor}
                    onChange={(e) => setFilters({...filters, vendor: e.target.value})}
                 >
                    <option value="">All Vendors</option>
                    {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                 </select>
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Position" 
                  className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500"
                  value={filters.position}
                  onChange={(e) => setFilters({...filters, position: e.target.value})}
                />
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Email" 
                  className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500"
                  value={filters.email}
                  onChange={(e) => setFilters({...filters, email: e.target.value})}
                />
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Phone" 
                  className="w-full border-gray-300 rounded-lg text-sm h-10 focus:ring-primary-500"
                  value={filters.phone}
                  onChange={(e) => setFilters({...filters, phone: e.target.value})}
                />
             </div>
             <div className="flex items-center">
                <button 
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 h-10"
                >
                   <span className="material-symbols-outlined text-lg">filter_alt_off</span> Clear
                </button>
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Contact Name</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Position</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredContacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 font-medium text-gray-900">{contact.name}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                  {contact.vendor}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-gray-600">{contact.position}</td>
                              <td className="p-4 text-sm text-gray-600">{contact.email}</td>
                              <td className="p-4 text-sm text-gray-600">{contact.phone}</td>
                              <td className="p-4 text-right">
                                  <button onClick={() => openModal(contact)} className="text-gray-400 hover:text-primary-600 p-1"><span className="material-symbols-outlined text-lg">edit</span></button>
                                  <button onClick={() => handleDelete(contact.id)} className="text-gray-400 hover:text-red-600 p-1 ml-2"><span className="material-symbols-outlined text-lg">delete</span></button>
                              </td>
                          </tr>
                      ))}
                      {filteredContacts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">No contacts found matching your filters.</td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="text-lg font-bold text-gray-900">{currentContact.id ? 'Edit Contact' : 'Add New Contact'}</h3>
                 <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
             </div>
             <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={currentContact.name} 
                      onChange={(e) => setCurrentContact({...currentContact, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Tag</label>
                    <select 
                      value={currentContact.vendor} 
                      onChange={(e) => setCurrentContact({...currentContact, vendor: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                        {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input 
                      type="text" 
                      value={currentContact.position} 
                      onChange={(e) => setCurrentContact({...currentContact, position: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={currentContact.email} 
                      onChange={(e) => setCurrentContact({...currentContact, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={currentContact.phone} 
                      onChange={(e) => setCurrentContact({...currentContact, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg mt-1 p-2.5 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                 </div>
             </div>
             <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                 <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white text-gray-700">Cancel</button>
                 <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Save Contact</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
