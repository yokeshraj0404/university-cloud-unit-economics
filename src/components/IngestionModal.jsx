import React, { useState } from 'react';
import { X, Upload, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCURCsv, parseTelemetryJson, generateSampleCsvContent } from '../engine/ingestionService';

export function IngestionModal({ onClose, onImportData }) {
  const [csvText, setCsvText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const handleCsvFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCsvText(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleJsonFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setJsonText(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleLoadSampleCsv = () => {
    setCsvText(generateSampleCsvContent());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      let importedBilling = null;
      let importedTelemetry = null;

      if (csvText.trim()) {
        importedBilling = parseCURCsv(csvText);
      }
      if (jsonText.trim()) {
        importedTelemetry = parseTelemetryJson(jsonText);
      }

      if (!importedBilling && !importedTelemetry) {
        setStatusMessage({ type: 'error', text: 'Please upload or paste at least one CSV or JSON file.' });
        return;
      }

      onImportData({ importedBilling, importedTelemetry });
      setStatusMessage({ type: 'success', text: 'Data imported successfully! Attribution engine recalculated.' });
      setTimeout(onClose, 1200);
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Import Failed: ${err.message}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card max-w-2xl w-full p-6 space-y-5 border border-indigo-500/30">
        
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              <span>Import Real AWS/GCP CUR CSV or Telemetry JSON</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Upload custom billing exports or telemetry logs to verify dynamic decision logic on live dataset inputs.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CSV Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-200">1. AWS CUR Billing Export CSV</label>
              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <FileText className="w-3 h-3" />
                <span>Load Sample CUR CSV</span>
              </button>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileUpload}
              className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
            />
            <textarea
              rows="3"
              placeholder="Paste raw AWS CUR CSV content here..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* JSON Telemetry Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-200">2. Usage Telemetry JSON Logs (Zero-PII Encrypted)</label>
            <input
              type="file"
              accept=".json"
              onChange={handleJsonFileUpload}
              className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
            />
            <textarea
              rows="3"
              placeholder="Paste raw JSON telemetry session logs array here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              Process & Recalculate Attribution
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
