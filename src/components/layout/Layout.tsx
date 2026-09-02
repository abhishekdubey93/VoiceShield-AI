import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, PageId } from './Sidebar';
import { ToastContainer, ToastMessage } from '../common/Toast';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  activeScenarioId: string;
  onOpenDemoControl: () => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  onSelectPage,
  activeScenarioId,
  onOpenDemoControl,
  toasts,
  onDismissToast,
}) => {
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        activeScenarioId={activeScenarioId}
        onOpenDemoControl={onOpenDemoControl}
        onToggleMobileMenu={() => setIsOpenMobileMenu((prev) => !prev)}
      />

      <div className="flex flex-1 relative">
        <Sidebar
          activePage={activePage}
          onSelectPage={onSelectPage}
          isOpenMobile={isOpenMobileMenu}
          onCloseMobile={() => setIsOpenMobileMenu(false)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
};
