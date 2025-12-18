
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Link, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import RequestsList from '../pages/RequestsList';
import ProcurementRequest from '../pages/ProcurementRequest';
import InvoiceRequest from '../pages/InvoiceRequest';
import UserManagement from '../pages/UserManagement';
import MasterData from '../pages/MasterData';
import POGeneration from '../pages/POGeneration';
import VendorManagement from '../pages/VendorManagement';
import ContactManagement from '../pages/ContactManagement';
import ApproveRequests from '../pages/ApproveRequests';
import RequestDetail from '../pages/RequestDetail';
import { RequestsProvider } from './store/requests';
import { AuthProvider, useAuth, UserRole } from './store/auth';

// --- Icons Component Helper ---
const Icon = ({ name, className = "", filled = false }: { name: string; className?: string; filled?: boolean }) => (
  <span className={`material-symbols-outlined ${filled ? 'fill' : ''} ${className}`}>
    {name}
  </span>
);

// --- Layout Component ---
const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  // Pages that use the custom header portal instead of standard breadcrumbs
  const isPortalHeaderPage = ['/procurement', '/invoice'].includes(location.pathname) || location.pathname.startsWith('/request/');

  // Define Nav Items - Visible to ALL users regardless of role as requested
  const allNavItems = [
    {
      label: 'Requests & Tasks',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { name: 'Requests List', path: '/requests', icon: 'view_list' },
        { name: 'Approve Requests', path: '/approve-requests', icon: 'check_circle' },
      ],
    },
    {
      label: 'Procurement & Finance',
      items: [
        { name: 'Procurement Request', path: '/procurement', icon: 'shopping_cart' },
        { name: 'Invoice Request', path: '/invoice', icon: 'receipt' },
        { name: 'PO Generation', path: '/po-generation', icon: 'receipt_long' },
      ],
    },
    {
      label: 'Master Data',
      items: [
        { name: 'Vendor Management', path: '/vendors', icon: 'storefront' },
        { name: 'Contact Management', path: '/contacts', icon: 'perm_contact_calendar' },
        { name: 'User Management', path: '/users', icon: 'group' },
        { name: 'Master Data', path: '/master-data', icon: 'database' },
      ],
    },
  ];

  const navGroups = allNavItems;

  // Breadcrumb Mapping
  const pageMeta: Record<string, { title: string; breadcrumb: string }> = {
    '/dashboard': { title: 'Dashboard', breadcrumb: 'Home / Dashboard' },
    '/requests': { title: 'Requests & Approvals', breadcrumb: 'Requests / All' },
    '/approve-requests': { title: 'Approve Requests', breadcrumb: 'Requests / Pending My Action' },
    '/procurement': { title: 'Procurement Request', breadcrumb: 'Procurement / New Request' },
    '/invoice': { title: 'Invoice Request', breadcrumb: 'Finance / New Invoice' },
    '/po-generation': { title: 'PO Generation', breadcrumb: 'Procurement / Purchase Orders' },
    '/vendors': { title: 'Vendor Management', breadcrumb: 'Master Data / Vendors' },
    '/contacts': { title: 'Contact Management', breadcrumb: 'Master Data / Contacts' },
    '/users': { title: 'User Management', breadcrumb: 'Admin / Users' },
    '/master-data': { title: 'Master Data', breadcrumb: 'Admin / Master Data' },
  };

  const currentMeta = pageMeta[location.pathname] || { title: 'MIMS', breadcrumb: 'Home' };

  const handleLogout = () => {
      logout();
      navigate('/');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-display">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 flex flex-col shadow-sm
        transform transition-all duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className={`h-16 flex items-center border-b border-gray-100 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
           {/* MIMS LOGO */}
           <div className="flex items-center gap-2 overflow-hidden">
              {isCollapsed ? (
                 <div className="text-2xl font-black text-[#E30613] tracking-tighter">M</div>
              ) : (
                <div className="text-2xl font-black text-[#E30613] tracking-tighter">MIMS</div>
              )}
           </div>
           <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-gray-500">
             <Icon name="close" />
           </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6 no-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                  <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 transition-opacity duration-300">
                      {group.label}
                  </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    title={isCollapsed ? item.name : ''}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon name={item.icon} filled={isActive(item.path)} className={`text-[20px] flex-shrink-0 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}`} />
                    {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions / Toggle */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={`hidden md:flex w-full items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors`}
          >
             <Icon name={isCollapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"} className="text-[20px]" />
             {!isCollapsed && <span>Collapse</span>}
          </button>
          
          <button onClick={handleLogout} className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors`}>
            <Icon name="logout" className="text-[20px]" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6 flex-shrink-0 z-10 shadow-sm">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-gray-500 mr-4">
            <Icon name="menu" />
          </button>

          {isPortalHeaderPage ? (
            <div id="header-portal" className="flex-1 flex items-center justify-between w-full h-full"></div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{currentMeta.breadcrumb}</p>
                  <h2 className="text-lg font-bold text-gray-900 leading-none">
                    {currentMeta.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search Bar Removed */}
                
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <Icon name="notifications" />
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {user && (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 text-sm">
                      {user.initials}
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-semibold text-gray-700 leading-none">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.role} • {user.dept}</p>
                    </div>
                  </button>
                </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/requests" element={<RequestsList />} />
        <Route path="/approve-requests" element={<ApproveRequests />} />
        <Route path="/procurement" element={<ProcurementRequest />} />
        <Route path="/invoice" element={<InvoiceRequest />} />
        <Route path="/po-generation" element={<POGeneration />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/contacts" element={<ContactManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/request/:id" element={<RequestDetail />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RequestsProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </RequestsProvider>
    </AuthProvider>
  );
};

export default App;
