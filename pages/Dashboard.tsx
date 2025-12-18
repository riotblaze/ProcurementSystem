import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../src/store/auth';

const StatCard = ({ title, value, subtext, subtextColor }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
    <p className="text-gray-600 font-medium">{title}</p>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
    <p className={`text-sm font-medium ${subtextColor}`}>{subtext}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user ? user.name.split(' ')[0] : 'Guest';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
        <p className="text-gray-500">Here's a summary of your activity and tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Pending Actions" 
          value="5" 
          subtext="+2 from yesterday" 
          subtextColor="text-green-600"
        />
        <StatCard 
          title="Total Open Requests" 
          value="28" 
          subtext="+5 from last week" 
          subtextColor="text-green-600"
        />
        <StatCard 
          title="Approved This Month" 
          value="12" 
          subtext="-1 from last month" 
          subtextColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">Request ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">Item</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { id: '#P123', item: 'Office Supplies', date: '2 days ago', status: 'Approved', color: 'bg-green-100 text-green-800' },
                  { id: '#P122', item: 'New Laptops (x5)', date: '4 days ago', status: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
                  { id: '#P121', item: 'Marketing Campaign Assets', date: '1 week ago', status: 'Rejected', color: 'bg-red-100 text-red-800' },
                  { id: '#P120', item: 'Cloud Server Subscription', date: '2 weeks ago', status: 'Approved', color: 'bg-green-100 text-green-800' },
                  { id: '#P119', item: 'Ergonomic Chairs (x2)', date: '2 weeks ago', status: 'Approved', color: 'bg-green-100 text-green-800' },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.item}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <Link to="/procurement" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Create New Request
            </Link>
            
            {(user?.role === 'Admin' || user?.role === 'Finance') && (
                <Link to="/vendors" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors">
                <span className="material-symbols-outlined text-lg">storefront</span>
                Manage Vendors
                </Link>
            )}
            
            <Link to="/requests" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">description</span>
              View All Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
