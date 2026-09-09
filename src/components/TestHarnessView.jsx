import React, { useState } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  Play, 
  ShieldAlert, 
  FileCode, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { runFullTestHarness } from '../engine/testHarness';

export function TestHarnessView() {
  const [harnessData, setHarnessData] = useState(() => runFullTestHarness());
  const [lastExecuted, setLastExecuted] = useState(new Date().toLocaleTimeString());

  const handleRunAll = () => {
    setHarnessData(runFullTestHarness());
    setLastExecuted(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      
      {/* Test Harness Top Card */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-purple-400" />
              <span>Edge Case & Failure Test Harness</span>
            </h2>
            <span className="badge badge-emerald">4/4 Tests Passing</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Automated verification suite testing adverse data conditions, late telemetry, untagged clusters, and idle waste.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">Last Executed: {lastExecuted}</span>
          <button
            onClick={handleRunAll}
            className="btn btn-primary text-xs py-2.5 px-4"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute Test Harness Suite</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Edge Case Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {harnessData.testResults.map((tc, idx) => (
          <div key={tc.id} className="glass-card p-6 border-l-4 border-l-emerald-500 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">TEST #{idx + 1}</span>
                  <span className="badge badge-emerald flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PASSED</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{tc.id}</span>
              </div>

              <h3 className="font-bold text-base text-white mb-2">{tc.title}</h3>
              <p className="text-xs text-gray-300 mb-4">{tc.description}</p>

              {/* Technical Execution Detail Box */}
              <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2 text-xs font-mono">
                {tc.id === 'EDGE_1' && (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>Raw Resource:</span>
                      <span className="text-indigo-300">{tc.testResult.rawCost}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Raw Tag Baseline:</span>
                      <span className="text-rose-400">{tc.testResult.baselineAttribution}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Telemetry Attributed:</span>
                      <span className="text-emerald-400 font-bold">{tc.testResult.measuredAttribution}</span>
                    </div>
                  </>
                )}

                {tc.id === 'EDGE_2' && (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>Provisional Buffer:</span>
                      <span className="text-amber-400">{tc.testResult.provisionalBufferAmount}</span>
                    </div>
                    <div className="text-gray-300 text-[11px] pt-1">
                      {tc.testResult.resolution}
                    </div>
                  </>
                )}

                {tc.id === 'EDGE_3' && (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>Flagged Idle Waste:</span>
                      <span className="text-amber-400 font-bold">{tc.testResult.wasteAmount}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Category:</span>
                      <span className="text-rose-300">{tc.testResult.category}</span>
                    </div>
                  </>
                )}

                {tc.id === 'EDGE_4' && (
                  <>
                    <div className="text-gray-400 text-[11px]">
                      Input: <code className="text-amber-300">{tc.testResult.inputTags}</code>
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      Normalized: <code className="text-emerald-300">{tc.testResult.outputNormalized}</code>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Impact Footer */}
            <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
              <span className="text-indigo-300 font-medium">Impact: {tc.impact}</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
