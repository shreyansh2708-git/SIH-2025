import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  BarChart3,
  MapPin,
  Ticket,
  TicketCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const citizenNavItems = [
    { to: '/citizen/report', icon: FileText, label: 'Report Issue' },
    { to: '/citizen/issues', icon: Ticket, label: 'My Issues' },
    { to: '/citizen/profile', icon: User, label: 'Profile' },
  ];

  const adminNavItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/tickets', icon: Ticket, label: 'All Tickets' },
    { to: '/admin/open-tickets', icon: TicketCheck, label: 'Open Tickets' },
    { to: '/admin/map', icon: MapPin, label: 'Map View' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNavItems : citizenNavItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`bg-sidebar border-r border-sidebar-border h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Samadhan</h2>
              <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role} Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Profile & Actions */}
      <div className="p-4 space-y-2">
        {!isCollapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="hover:bg-sidebar-accent/50 text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;