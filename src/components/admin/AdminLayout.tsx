import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { storageService } from '../../lib/storageService';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    storageService.seedInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7f8] flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Toggle Button (will be in Topbar, but Layout needs to provide context or Topbar needs to handle it) */}
        {/* I'll pass setIsSidebarOpen to the Topbar via context or just update Topbar to use a custom event or similar. 
            Actually, I'll just add the toggle to the Topbar and pass the prop. 
            Wait, Outlet is here. I'll pass the toggle function to the Topbar inside the pages or just make Topbar a component that accepts it.
        */}
        <Outlet context={{ setIsSidebarOpen }} />
      </div>
    </div>
  );
}
