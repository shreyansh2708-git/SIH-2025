import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-4 w-4" />
                <span className="ml-2">Toggle Sidebar</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;