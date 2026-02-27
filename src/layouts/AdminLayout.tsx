import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  AlertCircle, 
  BarChart2, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  LogOut,
  Stethoscope,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { adminUser } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Users, label: 'Patients', path: '/admin/patients' },
    { icon: AlertCircle, label: 'Alerts', path: '/admin/alerts' },
    { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
    { icon: Sliders, label: 'Configuration', path: '/admin/configuration' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800/60 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="text-white font-bold text-xl tracking-tight">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">HealthGuard</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">
            Main Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("w-5 h-5 mr-3 transition-colors", ({ isActive }: { isActive: boolean }) => isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                {item.label}
              </div>
              {/* Active Indicator */}
              <ChevronRight className={cn("w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200", ({ isActive }: { isActive: boolean }) => isActive ? "opacity-100 translate-x-0" : "group-hover:opacity-50 group-hover:translate-x-0")} />
            </NavLink>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left">
                <img 
                  src={adminUser.avatar} 
                  alt={adminUser.name} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
                />
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{adminUser.name}</p>
                  <p className="text-xs text-slate-400 truncate">{adminUser.role}</p>
                </div>
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Top Navbar */}
        <header className="h-20 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 transition-all">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Breadcrumb / Context */}
            <div className="hidden md:flex flex-col ml-4">
              <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
              <div className="flex items-center text-xs text-slate-500">
                <span>{adminUser.hospital}</span>
                <span className="mx-2">•</span>
                <span className="text-emerald-600 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  System Operational
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-6">
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="h-10 w-64 lg:w-80 pl-10 pr-4 rounded-full bg-slate-100/80 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              />
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <button className="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
