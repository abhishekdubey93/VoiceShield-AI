import React from 'react';
import { Shield, Play, Menu, Bell } from 'lucide-react';
import { DemoScenario } from '../../types';
import { DEMO_SCENARIOS } from '../../data/demoScenarios';

interface NavbarProps {
  activeScenarioId: string;
  onOpenDemoControl: () => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScenarioId,
  onOpenDemoControl,
  onToggleMobileMenu,
}) => {
  const currentScenario: DemoScenario = DEMO_SCENARIOS[activeScenarioId] || DEMO_SCENARIOS.VOICE_CLONE_SCAM;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-cyber-border h-16 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden text-slate-400 hover:text-slate-200 p-1 rounded"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-100 tracking-tight">VOICESHIELD AI</h1>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                DEMO MVP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">Real-Time AI Voice Impersonation Defense</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Demo Scenario Badge */}
        <button
          onClick={onOpenDemoControl}
          className="flex items-center gap-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-mono transition-all group"
        >
          <Play className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform fill-current" />
          <span className="hidden sm:inline text-slate-400">Scenario:</span>
          <span className="font-bold text-slate-100 max-w-[140px] sm:max-w-[200px] truncate">
            {currentScenario.name}
          </span>
        </button>

        {/* Global System Protected Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">SYSTEM PROTECTED</span>
        </div>

        <button
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-cyber-card transition-colors relative"
          title="Security Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
};
