import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  Sliders, 
  FlaskConical, 
  BarChart3, 
  BookOpen, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import { SEMESTERS, SYSTEM_FRESHNESS } from '../data/mockData';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  activeSemester, 
  setActiveSemester, 
  onResetRules 
}) {
  return (
    <header className="border-b border-gray-800 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">CloudLab FinOps</h1>
              <span className="badge badge-indigo text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Unit Economics Engine
              </span>
            </div>
            <p className="text-xs text-gray-400">University Cloud Spend Attribution & Course Economics</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('finops')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'finops' ? 'active' : ''}`}
          >
            <Building2 className="w-4 h-4" />
            <span>FinOps Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('professor')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'professor' ? 'active' : ''}`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Course Professor</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'rules' ? 'active' : ''}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Rules Config</span>
          </button>

          <button
            onClick={() => setActiveTab('harness')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'harness' ? 'active' : ''}`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Test Harness</span>
          </button>

          <button
            onClick={() => setActiveTab('experiment')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'experiment' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Experiment</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`tab-btn flex items-center gap-2 ${activeTab === 'docs' ? 'active' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Docs</span>
          </button>
        </nav>

        {/* Semester Selector & Data Freshness Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 font-medium">Semester:</span>
            <select
              value={activeSemester || 'All'}
              onChange={(e) => setActiveSemester(e.target.value === 'All' ? null : e.target.value)}
              className="bg-transparent text-sm text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-gray-900 text-white">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
              ))}
            </select>
          </div>

          {/* Freshness Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Fresh (Sync: 5m ago)</span>
          </div>

          <button
            onClick={onResetRules}
            title="Reset Default Attribution Rules"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
