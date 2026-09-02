import React from 'react';
import {
  LayoutDashboard,
  PhoneCall,
  UserCheck,
  Gauge,
  History,
  ShieldCheck,
  BarChart3,
  Lock,
  Settings,
  SlidersHorizontal,
  UploadCloud,
  X,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'live-call'
  | 'voice-verification'
  | 'risk-analysis'
  | 'call-history'
  | 'security-actions'
  | 'analytics'
  | 'privacy-security'
  | 'settings'
  | 'demo-control'
  | 'audio-analysis';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-call', label: 'Live Call Monitor', icon: PhoneCall, badge: 'LIVE' },
    { id: 'demo-control', label: 'Demo Control Center', icon: SlidersHorizontal, badge: 'HACK' },
    { id: 'voice-verification', label: 'Voice Verification', icon: UserCheck },
    { id: 'risk-analysis', label: 'Risk Engine Analysis', icon: Gauge },
    { id: 'call-history', label: 'Call Threat History', icon: History },
    { id: 'security-actions', label: 'Security Actions', icon: ShieldCheck },
    { id: 'audio-analysis', label: 'Audio File Analysis', icon: UploadCloud },
    { id: 'analytics', label: 'Analytics & Latency', icon: BarChart3 },
    { id: 'privacy-security', label: 'Privacy & Security', icon: Lock },
    { id: 'settings', label: 'Settings & Weights', icon: Settings },
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B0F17] border-r border-cyber-border w-64 p-4">
      <div className="flex items-center justify-between md:hidden pb-4 border-b border-cyber-border mb-4">
        <span className="text-sm font-bold text-slate-200">VOICESHIELD NAVIGATION</span>
        <button onClick={onCloseMobile} className="text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.badge === 'LIVE'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-cyber-border mt-auto">
        <div className="bg-cyber-card border border-cyber-border p-3 rounded-lg text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Deployment Mode</span>
          <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">EDGE-READY DEMO</span>
          <span className="text-[9px] text-slate-500 block mt-1">Hackathon Architecture v1.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:block flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-xs">{navContent}</div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 border-t border-cyber-border flex items-center justify-around py-2 px-1 backdrop-blur-md">
        <button
          onClick={() => onSelectPage('dashboard')}
          className={`flex flex-col items-center gap-1 ${activePage === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px]">Dashboard</span>
        </button>

        <button
          onClick={() => onSelectPage('live-call')}
          className={`flex flex-col items-center gap-1 relative ${activePage === 'live-call' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[9px]">Live Call</span>
          <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
        </button>

        <button
          onClick={() => onSelectPage('demo-control')}
          className={`flex flex-col items-center gap-1 ${activePage === 'demo-control' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[9px]">Scenarios</span>
        </button>

        <button
          onClick={() => onSelectPage('call-history')}
          className={`flex flex-col items-center gap-1 ${activePage === 'call-history' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[9px]">History</span>
        </button>

        <button
          onClick={() => onSelectPage('settings')}
          className={`flex flex-col items-center gap-1 ${activePage === 'settings' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px]">Settings</span>
        </button>
      </nav>
    </>
  );
};
