import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    { path: '/', icon: <HomeIcon className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/instances', icon: <DevicePhoneMobileIcon className="w-5 h-5" />, label: 'Instances' },
    { path: '/groups', icon: <UsersIcon className="w-5 h-5" />, label: 'Groups' },
    { path: '/chat', icon: <ChatBubbleLeftIcon className="w-5 h-5" />, label: 'Chat' },
    { path: '/schedule', icon: <CalendarIcon className="w-5 h-5" />, label: 'Schedule' },
    ...(user.role === 'admin' 
      ? [{ path: '/clients', icon: <UserGroupIcon className="w-5 h-5" />, label: 'Clients' }]
      : []
    ),
    { path: '/settings', icon: <Cog6ToothIcon className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b">
              <h1 className="text-xl font-bold text-gray-800">WhatsApp Manager</h1>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;