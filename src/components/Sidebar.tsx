import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { useSidebar } from '../contexts/SidebarContext';

export const Sidebar = () => {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/fleet', label: 'Armada', icon: List },
    { path: '/map', label: 'Peta', icon: Map },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-[#1e293b] text-white z-50 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Transjakarta Logo" 
            className="w-12"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-white whitespace-nowrap">Transjakarta</h1>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">Fleet Management</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <p className={cn(
          'text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3',
          collapsed ? 'text-center' : 'px-3'
        )}>
          {collapsed ? '•••' : 'Menu'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-400')} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all w-full"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Hide</span>}
        </button>
      </div>
    </aside>
  );
};

