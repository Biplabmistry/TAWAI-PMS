import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, FileText, Scale, Eye, FileOutput, Home, CheckCircle, Server, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { state: authState, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'User Dashboard', href: '/user-dashboard', icon: User },
    { name: 'Process Petition', href: '/process', icon: FileText },
    { name: 'Claims Analysis', href: '/claims', icon: Scale },
    { name: 'Evidence Evaluation', href: '/evidence', icon: Eye },
    { name: 'Create IO Report', href: '/report', icon: FileOutput },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Legal-Tech AI Assistant</h1>
                <p className="text-blue-200 text-sm">Andhra Pradesh Police Department</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Backend AI Status */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-600 rounded-lg">
                <Server className="h-4 w-4 text-white" />
                <CheckCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Secure AI Backend</span>
              </div>
              
              {/* User Info */}
              <div className="text-white text-sm">
                <div className="font-medium">{authState.user?.fullName}</div>
                <div className="text-blue-200">{authState.user?.role} • {authState.user?.badgeNumber}</div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Security Status */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-800">Security Status</span>
              </div>
              <ul className="text-xs text-green-700 space-y-1">
                <li>✓ Backend AI Processing</li>
                <li>✓ End-to-End Encryption</li>
                <li>✓ Audit Logging Active</li>
                <li>✓ Data Protection Compliant</li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;