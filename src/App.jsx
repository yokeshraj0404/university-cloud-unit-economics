import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FinOpsView } from './components/FinOpsView';
import { ProfessorView } from './components/ProfessorView';
import { TrendsView } from './components/TrendsView';
import { RuleConfigurator } from './components/RuleConfigurator';
import { TestHarnessView } from './components/TestHarnessView';
import { ExperimentView } from './components/ExperimentView';
import { DocumentationView } from './components/DocumentationView';
import { DrillDownModal } from './components/DrillDownModal';
import { IngestionModal } from './components/IngestionModal';

import { RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES } from './data/mockData';
import { runAttributionEngine } from './engine/attributionEngine';
import { calculateDynamicFreshness } from './engine/freshnessEngine';

export function App() {
  const [activeTab, setActiveTab] = useState('finops');
  const [activeSemester, setActiveSemester] = useState(null);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [billingData, setBillingData] = useState(RAW_BILLING_EXPORTS);
  const [telemetryData, setTelemetryData] = useState(USAGE_TELEMETRY);
  const [inspectRecord, setInspectRecord] = useState(null);
  const [showIngestionModal, setShowIngestionModal] = useState(false);
  const [syncState, setSyncState] = useState({
    curSyncTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    telemSyncTime: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  });

  // Execute decision logic engine live on state change
  const engineResult = useMemo(() => {
    return runAttributionEngine(billingData, telemetryData, rules, activeSemester);
  }, [billingData, telemetryData, rules, activeSemester]);

  // Compute dynamic pipeline freshness & data health
  const freshnessData = useMemo(() => {
    return calculateDynamicFreshness(billingData, telemetryData, syncState);
  }, [billingData, telemetryData, syncState]);

  const handleResetRules = () => {
    setRules(INITIAL_RULES);
    setBillingData(RAW_BILLING_EXPORTS);
    setTelemetryData(USAGE_TELEMETRY);
    setSyncState({
      curSyncTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      telemSyncTime: new Date(Date.now() - 12 * 60 * 1000).toISOString()
    });
  };

  const handleImportData = ({ importedBilling, importedTelemetry }) => {
    if (importedBilling && importedBilling.length > 0) {
      setBillingData(importedBilling);
    }
    if (importedTelemetry && importedTelemetry.length > 0) {
      setTelemetryData(importedTelemetry);
    }
    setSyncState({
      curSyncTime: new Date().toISOString(),
      telemSyncTime: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      
      {/* Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSemester={activeSemester}
        setActiveSemester={setActiveSemester}
        onResetRules={handleResetRules}
        freshnessData={freshnessData}
        onOpenIngestionModal={() => setShowIngestionModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'finops' && (
          <FinOpsView
            engineResult={engineResult}
            freshnessData={freshnessData}
            onInspectRecord={(rec) => setInspectRecord(rec)}
            onOpenIngestionModal={() => setShowIngestionModal(true)}
          />
        )}

        {activeTab === 'professor' && (
          <ProfessorView
            engineResult={engineResult}
            onInspectRecord={(rec) => setInspectRecord(rec)}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsView
            engineResult={engineResult}
          />
        )}

        {activeTab === 'rules' && (
          <RuleConfigurator
            rules={rules}
            setRules={setRules}
            engineResult={engineResult}
          />
        )}

        {activeTab === 'harness' && (
          <TestHarnessView />
        )}

        {activeTab === 'experiment' && (
          <ExperimentView engineResult={engineResult} />
        )}

        {activeTab === 'docs' && (
          <DocumentationView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0b0f19] py-4 text-center text-xs text-gray-500">
        <p>University Cloud Spend Unit Economics Dashboard &bull; Privacy Preserving &bull; 97.7% Cost Attribution ($69,150 Aggregated Dataset)</p>
      </footer>

      {/* Lineage Audit Drill-Down Modal */}
      {inspectRecord && (
        <DrillDownModal
          record={inspectRecord}
          onClose={() => setInspectRecord(null)}
        />
      )}

      {/* Live Data Ingestion Modal */}
      {showIngestionModal && (
        <IngestionModal
          onClose={() => setShowIngestionModal(false)}
          onImportData={handleImportData}
        />
      )}

    </div>
  );
}

export default App;
