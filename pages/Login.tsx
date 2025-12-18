
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../src/store/auth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPicker, setShowPicker] = useState(false);

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  const accounts: { role: UserRole; name: string; email: string; initial: string; color: string }[] = [
      { role: 'Admin', name: 'Alex Admin', email: 'alex@mims.com', initial: 'AA', color: 'bg-purple-600' },
      { role: 'Requester', name: 'John Requester', email: 'john@mims.com', initial: 'JR', color: 'bg-blue-600' },
      { role: 'Approver', name: 'Sarah Manager', email: 'sarah@mims.com', initial: 'SM', color: 'bg-green-600' },
      { role: 'Finance', name: 'Mike Finance', email: 'mike@mims.com', initial: 'MF', color: 'bg-orange-600' },
      { role: 'FPA', name: 'Fiona FPA', email: 'fiona@mims.com', initial: 'FF', color: 'bg-teal-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Brand / Info */}
        <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="text-3xl font-black text-[#E30613] tracking-tighter bg-white px-2 py-1 rounded">MIMS</div>
                </div>
                <h1 className="text-5xl font-bold mb-6 leading-tight">Procurement<br/>Management<br/>System</h1>
                <p className="text-lg text-slate-300 max-w-md">Streamline your purchasing workflows, manage vendors, and track approvals in one centralized platform.</p>
            </div>
            <div className="relative z-10 text-sm text-slate-500">
                &copy; 2024 MIMS Pte Ltd. All rights reserved.
            </div>
        </div>

        {/* Right Side - SSO Login */}
        <div className="md:w-1/2 bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!showPicker ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500 mb-8">Please sign in with your corporate account to continue.</p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => setShowPicker(true)}
                                className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-black text-white p-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                                    <path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/>
                                </svg>
                                Sign in with Microsoft SSO
                            </button>
                            
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Internal Access Only</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <p className="text-xs text-gray-400 text-center">
                                By signing in, you agree to our <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowPicker(false)} className="mb-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Select a Demo Account</h3>
                        <div className="space-y-2">
                            {accounts.map((acc) => (
                                <div 
                                    key={acc.role}
                                    onClick={() => handleLogin(acc.role)}
                                    className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors border border-transparent hover:border-gray-200 group"
                                >
                                    <div className={`h-10 w-10 rounded-full ${acc.color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                                        {acc.initial}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gray-900 font-medium text-sm">{acc.name}</div>
                                        <div className="text-gray-500 text-xs">{acc.email}</div>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm">{acc.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Login;
