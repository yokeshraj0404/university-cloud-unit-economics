import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FinOpsView } from './components/FinOpsView';
import { ProfessorView } from './components/ProfessorView';
import { RuleConfigurator } from './components/RuleConfigurator';
import { TestHarnessView } from './components/TestHarnessView';
import { ExperimentView } from './components/ExperimentView';
import { DocumentationView } from './components/DocumentationView';
import { DrillDownModal } from './components/DrillDownModal';

import { RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES } from './data/mockData';
import { runAttributionEngine } from './engine/attributionEngine';

export function App() {
  const [activeTab, setActiveTab] = useState('finops');
  const [activeSemester, setActiveSemester] = useState(null);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [inspectRecord, setInspectRecord] = useState(null);

  // Execute decision logic engine live on state change
  const engineResult = useMemo(() => {
    return runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, rules, activeSemester);
  }, [rules, activeSemester]);

  const handleResetRules = () => {
    setRules(INITIAL_RULES);
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
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'finops' && (
          <FinOpsView
            engineResult={engineResult}
            onInspectRecord={(rec) => setInspectRecord(rec)}
          />
        )}

        {activeTab === 'professor' && (
          <ProfessorView
            engineResult={engineResult}
            onInspectRecord={(rec) => setInspectRecord(rec)}
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
        <p>University Cloud Spend Unit Economics Dashboard &bull; Privacy Preserving &bull; 96.4% Cost Attribution</p>
      </footer>

      {/* Lineage Audit Drill-Down Modal */}
      {inspectRecord && (
        <DrillDownModal
          record={inspectRecord}
          onClose={() => setInspectRecord(null)}
        />
      )}

    </div>
  );
}

export default App;
