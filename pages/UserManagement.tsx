
import React from 'react';

const UserManagement = () => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-700">
           <span className="material-symbols-outlined text-lg">add</span>
           Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <div className="flex-grow">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                    <input type="text" placeholder="Search by name, email..." className="w-full pl-10 border-gray-300 rounded-lg text-sm h-12" />
                </div>
             </div>
             <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
                {['Status: All', 'Role: All', 'Entity: All'].map(filter => (
                    <button key={filter} className="h-12 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 whitespace-nowrap bg-white hover:bg-gray-50">
                        {filter}
                        <span className="material-symbols-outlined text-gray-500">expand_more</span>
                    </button>
                ))}
             </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                          <th className="p-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Entity</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Approval Limit</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {[
                          { name: 'Olivia Rhye', email: 'olivia@mims.com', role: 'Admin', entity: 'Alpha Corp', limit: '$50,000', status: 'Active', login: 'Jan 20, 2023' },
                          { name: 'Phoenix Baker', email: 'phoenix@mims.com', role: 'Approver', entity: 'Beta LLC', limit: '$10,000', status: 'Active', login: 'Jan 19, 2023' },
                          { name: 'Lana Steiner', email: 'lana@mims.com', role: 'Requester', entity: 'Gamma Inc', limit: 'N/A', status: 'Active', login: 'Jan 18, 2023' },
                          { name: 'Demi Wilkinson', email: 'demi@mims.com', role: 'Admin', entity: 'Alpha Corp', limit: '$50,000', status: 'Inactive', login: 'Dec 1, 2022' },
                          { name: 'Candice Wu', email: 'candice@mims.com', role: 'Approver', entity: 'Gamma Inc', limit: '$25,000', status: 'Active', login: 'Jan 20, 2023' },
                      ].map((user, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                              <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                              <td className="p-4">
                                  <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                                  <div className="text-gray-500 text-xs">{user.email}</div>
                              </td>
                              <td className="p-4 text-sm text-gray-500">{user.role}</td>
                              <td className="p-4 text-sm text-gray-500">{user.entity}</td>
                              <td className="p-4 text-sm text-gray-500">{user.limit}</td>
                              <td className="p-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {user.status}
                                  </span>
                              </td>
                              <td className="p-4 text-sm text-gray-500">{user.login}</td>
                              <td className="p-4">
                                  <button className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">more_horiz</span></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6">
               <span className="text-sm text-gray-600">Showing 1 to 5 of 20 results</span>
               <div className="flex gap-2">
                   <button className="p-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
                   <button className="h-8 w-8 flex items-center justify-center bg-primary-600 text-white rounded-lg text-sm">1</button>
                   <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-sm text-gray-600">2</button>
                   <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-sm text-gray-600">3</button>
                   <span className="h-8 w-8 flex items-center justify-center text-gray-400">...</span>
                   <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-sm text-gray-600">8</button>
                   <button className="p-1 border border-gray-200 rounded-lg hover:bg-gray-50"><span className="material-symbols-outlined">chevron_right</span></button>
               </div>
          </div>
      </div>
    </div>
  );
};

export default UserManagement;
