import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { PageId } from './components/layout/Sidebar';
import { ToastMessage } from './components/common/Toast';
import { useRiskConfig } from './hooks/useRiskConfig';
import { useLiveCall } from './hooks/useLiveCall';
import { StorageService } from './services/storageService';
import { CallRecord } from './types';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import { Dashboard } from './pages/Dashboard';
import { LiveCallPage } from './pages/LiveCallPage';
import { VoiceVerificationPage } from './pages/VoiceVerificationPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { CallHistoryPage } from './pages/CallHistoryPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { SecurityActionsPage } from './pages/SecurityActionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PrivacySecurityPage } from './pages/PrivacySecurityPage';
import { AudioAnalysisPage } from './pages/AudioAnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoControlCenterPage } from './pages/DemoControlCenterPage';

export function AppContent() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedHistoryCall, setSelectedHistoryCall] = useState<CallRecord | null>(null);

  // Risk Engine Formula Weights Config
  const { weights, updateWeight, resetWeights, totalWeight } = useRiskConfig();

  // Live Ticking Scenario Engine with Automated LID Detection
  const {
    activeScenarioId,
    selectScenario,
    currentCall,
    isSimulating,
    toggleSimulation,
    updateSignals,
    updateTransaction,
    addSecurityAction,
  } = useLiveCall(weights);

  // Call History State
  const [callHistory, setCallHistory] = useState<CallRecord[]>(() => StorageService.getCallHistory());

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'danger' = 'info'
  ) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectHistoryCall = (call: CallRecord) => {
    setSelectedHistoryCall(call);
  };

  const handleResetDemoData = () => {
    StorageService.resetDemoData();
    setCallHistory(StorageService.getCallHistory());
    resetWeights();
    selectScenario('MULTILINGUAL_CODE_SWITCH');
    addToast('Demo Reset', 'All LocalStorage state reset to factory defaults.', 'warning');
  };

  return (
    <Layout
      activePage={activePage}
      onSelectPage={(page) => {
        setActivePage(page);
        if (page !== 'call-history') {
          setSelectedHistoryCall(null);
        }
      }}
      activeScenarioId={activeScenarioId}
      onOpenDemoControl={() => setActivePage('demo-control')}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      {activePage === 'dashboard' && (
        <Dashboard
          currentCall={currentCall}
          callHistory={callHistory}
          onNavigate={(page) => setActivePage(page as PageId)}
          onOpenScenarioModal={() => setActivePage('demo-control')}
        />
      )}

      {activePage === 'live-call' && (
        <LiveCallPage
          currentCall={currentCall}
          isSimulating={isSimulating}
          onToggleSimulating={toggleSimulation}
          onUpdateSignals={updateSignals}
          onUpdateTransaction={updateTransaction}
          onAddAction={(act) => {
            addSecurityAction(act);
            setCallHistory(StorageService.getCallHistory());
          }}
          onAddToast={addToast}
        />
      )}

      {activePage === 'demo-control' && (
        <DemoControlCenterPage
          activeScenarioId={activeScenarioId}
          onSelectScenario={(id) => {
            selectScenario(id);
            addToast('Scenario Loaded', `Switched to demo scenario: ${id}`, 'info');
          }}
          onNavigate={(page) => setActivePage(page as PageId)}
        />
      )}

      {activePage === 'voice-verification' && <VoiceVerificationPage />}

      {activePage === 'risk-analysis' && (
        <RiskAnalysisPage
          currentCall={currentCall}
          weights={weights}
          onUpdateWeight={updateWeight}
          onResetWeights={resetWeights}
          totalWeight={totalWeight}
        />
      )}

      {activePage === 'call-history' && (
        selectedHistoryCall ? (
          <IncidentDetailPage
            call={selectedHistoryCall}
            onBack={() => setSelectedHistoryCall(null)}
          />
        ) : (
          <CallHistoryPage
            callHistory={callHistory}
            onSelectCall={handleSelectHistoryCall}
          />
        )
      )}

      {activePage === 'security-actions' && <SecurityActionsPage />}

      {activePage === 'analytics' && <AnalyticsPage callHistory={callHistory} />}

      {activePage === 'privacy-security' && <PrivacySecurityPage />}

      {activePage === 'audio-analysis' && <AudioAnalysisPage />}

      {activePage === 'settings' && (
        <SettingsPage
          weights={weights}
          onUpdateWeight={updateWeight}
          onResetWeights={resetWeights}
          totalWeight={totalWeight}
          onResetDemoData={handleResetDemoData}
        />
      )}
    </Layout>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
