import React, { useState } from 'react';
import { 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function RuleConfigurator({ rules, setRules, engineResult }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState('EXACT_TAG_MATCH');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const movePriority = (id, direction) => {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    const index = sorted.findIndex(r => r.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = sorted[index].priority;
      sorted[index].priority = sorted[index - 1].priority;
      sorted[index - 1].priority = temp;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const temp = sorted[index].priority;
      sorted[index].priority = sorted[index + 1].priority;
      sorted[index + 1].priority = temp;
    }

    setRules(sorted);
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule = {
      id: `RULE_CUSTOM_${Date.now()}`,
      name: newRuleName,
      description: newRuleDesc || 'Custom allocation rule configured by FinOps admin.',
      type: newRuleType,
      enabled: true,
      priority: rules.length + 1,
      confidence: newRuleType === 'EXACT_TAG_MATCH' ? 95 : 85,
      targetServices: ['*']
    };

    setRules([...rules, newRule]);
    setNewRuleName('');
    setNewRuleDesc('');
    setShowAddModal(false);
  };

  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Configurator Header & Live Calculation Impact */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-6 h-6 text-indigo-400" />
              <span>Configurable Decision Rule Engine</span>
            </h2>
            <span className="badge badge-indigo">Dynamic Decision Logic</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Re-order priority, toggle heuristics, or define custom allocation policies. Decisions re-evaluate live in browser.
          </p>
        </div>

        {/* Live Re-calculation Indicator */}
        <div className="flex items-center gap-4 bg-gray-900/90 p-3 rounded-xl border border-gray-800">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Live Allocated %</span>
            <span className="text-xl font-extrabold text-emerald-400">{engineResult.percentageAllocated}%</span>
          </div>
          <div className="h-8 w-px bg-gray-800"></div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Attributed Spend</span>
            <span className="text-base font-bold text-white">${engineResult.totalAttributedSpend.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary ml-2 text-xs py-2 px-3"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Rules List (Ordered by Priority) */}
      <div className="space-y-4">
        {[...rules].sort((a, b) => a.priority - b.priority).map((rule, idx) => (
          <div 
            key={rule.id} 
            className={`glass-card p-5 transition-all ${rule.enabled ? 'border-gray-700' : 'opacity-60 border-gray-800 bg-gray-950/40'}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Left: Priority Badge & Rule Title */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900 border border-gray-800 min-w-[56px]">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Priority</span>
                  <span className="text-lg font-black text-indigo-400">#{rule.priority}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{rule.name}</h3>
                    <span className={`badge ${rule.enabled ? 'badge-emerald' : 'badge-amber'}`}>
                      {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                    <span className="badge badge-purple">{rule.type}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{rule.description}</p>
                  
                  {/* Targets / Fields info */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span>Confidence Score: <strong className="text-indigo-300">{rule.confidence}%</strong></span>
                    {rule.fields && <span>Fields: <code className="text-gray-300">{rule.fields.join(', ')}</code></span>}
                    {rule.targetServices && <span>Services: <code className="text-gray-300">{rule.targetServices.join(', ')}</code></span>}
                  </div>
                </div>
              </div>

              {/* Right: Controls (Move Up/Down, Toggle, Delete) */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => movePriority(rule.id, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 transition"
                  title="Move Priority Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => movePriority(rule.id, 'down')}
                  disabled={idx === rules.length - 1}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 transition"
                  title="Move Priority Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`p-2 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold ${
                    rule.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {rule.enabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                </button>
                
                {rule.id.startsWith('RULE_CUSTOM') && (
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                    title="Delete Custom Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Define Custom Attribution Rule</span>
            </h3>
            
            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SageMaker Notebook Custom Tag Split"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Rule Heuristic Type</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="EXACT_TAG_MATCH">Exact Tag Match Heuristic</option>
                  <option value="TELEMETRY_RUNTIME_RATIO">Telemetry Session Ratio Split</option>
                  <option value="ACTIVITY_VOLUME_WEIGHT">Enrollment Headcount Fallback</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe the logic and scope for this rule..."
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
