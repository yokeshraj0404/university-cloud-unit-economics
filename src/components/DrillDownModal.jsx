import React from 'react';
import { 
  X, 
  FileText, 
  Database, 
  Sliders, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { RAW_BILLING_EXPORTS, USAGE_TELEMETRY } from '../data/mockData';

export function DrillDownModal({ record, onClose }) {
  if (!record) return null;

  const rawCUR = RAW_BILLING_EXPORTS.find(c => c.id === record.curId) || {};
  const matchedTelemetry = USAGE_TELEMETRY.filter(t => t.courseId === record.courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-indigo-500/30">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <span>Drill-Down Evidence Audit Lineage</span>
              </h3>
              <span className={`badge ${record.status === 'ALLOCATED' ? 'badge-emerald' : 'badge-amber'}`}>
                {record.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              CUR ID: <code className="text-indigo-300 font-bold">{record.curId}</code> &bull; Resource ID: <code className="text-gray-300">{record.resourceId}</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Summary Box */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Raw CUR Cost</span>
            <span className="text-base font-extrabold text-white">${record.rawCost?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Attributed Amount</span>
            <span className="text-base font-extrabold text-emerald-400">${record.attributedCost?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Rule Confidence Score</span>
            <span className="text-base font-extrabold text-indigo-400">{record.confidenceScore}%</span>
          </div>
        </div>

        {/* Evidence Details */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-gray-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Decision Rule Evidence</span>
          </h4>
          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Rule Applied:</span>
              <span className="font-bold text-indigo-300">{record.ruleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target Accountable Unit:</span>
              <span className="font-bold text-emerald-300">{record.courseId} ({record.semester})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Split Percentage:</span>
              <span className="font-bold text-purple-300">{record.splitPercentage}%</span>
            </div>
            <div className="pt-2 border-t border-gray-800 text-gray-300">
              <strong className="text-gray-400 block text-[10px] uppercase mb-0.5">Audit Lineage Proof:</strong>
              <p className="font-mono text-emerald-300/90 text-[11px]">{record.evidence}</p>
            </div>
          </div>
        </div>

        {/* Raw Tags Inspection */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-gray-200 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-amber-400" />
            <span>Raw Cloud Provider Resource Tags</span>
          </h4>
          <div className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 font-mono text-xs text-amber-300">
            {rawCUR.tags && Object.keys(rawCUR.tags).length > 0 ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(rawCUR.tags, null, 2)}</pre>
            ) : (
              <span className="text-gray-500 italic">[No raw tags present on cloud provider resource - Telemetry ratio rule applied]</span>
            )}
          </div>
        </div>

        {/* Telemetry Log Correlation */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-gray-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Correlated Telemetry Logs ({matchedTelemetry.length} Session Logs Found)</span>
          </h4>
          <div className="max-h-36 overflow-y-auto space-y-2">
            {matchedTelemetry.map(t => (
              <div key={t.sessionId} className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 text-[11px] font-mono flex justify-between items-center">
                <span className="text-indigo-300">{t.sessionId}</span>
                <span className="text-gray-400">{t.studentHash}</span>
                <span className="text-emerald-400">{t.gpuHours} GPU-hrs / {t.cpuHours} CPU-hrs</span>
                <span className="text-gray-500">{t.labExerciseId}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn btn-secondary text-xs px-5">
            Close Lineage Evidence
          </button>
        </div>

      </div>
    </div>
  );
}

function TagIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}
