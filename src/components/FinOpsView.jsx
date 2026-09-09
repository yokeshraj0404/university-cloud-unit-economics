import React from 'react';
import { 
  DollarSign, 
  Target, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Server, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { COURSES } from '../data/mockData';

export function FinOpsView({ engineResult, onInspectRecord }) {
  const { 
    totalSpend, 
    totalAttributedSpend, 
    totalUnallocatedSpend, 
    percentageAllocated, 
    attributionResults, 
    courseSummaries 
  } = engineResult;

  // Calculate overall student hours
  let totalStudentHours = 0;
  Object.values(courseSummaries).forEach(c => {
    const totalLabHours = COURSES.find(cs => cs.id === c.courseId)?.labExercises.reduce((acc, ex) => acc + ex.targetHours, 0) || 10;
    totalStudentHours += totalLabHours * c.studentCount;
  });

  const avgCostPerStudentHour = totalStudentHours > 0 ? (totalAttributedSpend / totalStudentHours).toFixed(2) : '0.00';

  // Group spend by service
  const serviceSpendMap = {};
  attributionResults.forEach(r => {
    serviceSpendMap[r.service] = (serviceSpendMap[r.service] || 0) + r.attributedCost;
  });

  // Filter unallocated items
  const unallocatedItems = attributionResults.filter(r => r.status === 'UNALLOCATED');

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Cloud Spend Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Cloud Spend</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">${totalSpend.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400">AWS & GCP Billing Exports (Monthly)</p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl"></div>
        </div>

        {/* % Spend Allocated Gauge Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">% Spend Allocated</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-extrabold text-emerald-400">{percentageAllocated}%</h3>
                <span className="text-xs text-gray-400">Target: &gt;90%</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" 
              style={{ width: `${percentageAllocated}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>Baseline: 42.8%</span>
            <span>Measured: {percentageAllocated}%</span>
          </div>
        </div>

        {/* Cost per Active Student Hour */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cost / Student-Hour</p>
              <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">${avgCostPerStudentHour} / hr</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400">Unit Economics across lab workloads</p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Unallocated Spend & Alert Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unallocated Spend</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">${totalUnallocatedSpend.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-400/90 font-medium">
            {unallocatedItems.length} orphan/idle items flagged
          </p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl"></div>
        </div>

      </div>

      {/* Main Grid: Course Attribution Breakdown & Cloud Service Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Course Unit Economics Breakdown (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Course & Department Spend Attribution</span>
              </h3>
              <p className="text-xs text-gray-400">Unit economics attribution correlated with course enrollment</p>
            </div>
            <span className="badge badge-indigo">4 Accountable Units</span>
          </div>

          <div className="space-y-4">
            {Object.values(courseSummaries).map(c => {
              const pctOfTotal = totalSpend > 0 ? ((c.totalSpend / totalSpend) * 100).toFixed(1) : 0;
              const isOverBudget = c.totalSpend > c.budget;

              return (
                <div key={c.courseId} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-300 text-sm">{c.courseId}</span>
                        <span className="text-xs text-gray-300 font-medium">{c.courseName}</span>
                      </div>
                      <p className="text-xs text-gray-400">{c.department} &bull; {c.leadProfessor}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-white">${c.totalSpend.toLocaleString()}</span>
                      <p className="text-xs text-gray-400">{pctOfTotal}% of total spend</p>
                    </div>
                  </div>

                  {/* Progress bar vs Budget */}
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min((c.totalSpend / c.budget) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Unit Economics Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-800 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">ENROLLMENT</span>
                      <span className="font-semibold text-gray-200">{c.studentCount} Students</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">COST / STUDENT</span>
                      <span className="font-semibold text-emerald-400">${c.costPerStudent} / student</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">BUDGET VARIANCE</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isOverBudget ? `-$${Math.abs(c.budgetVariance)} (Over)` : `+$${c.budgetVariance} (Under)`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spend by Service Breakdown (1 col) */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white mb-1 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              <span>Spend by Cloud Service</span>
            </h3>
            <p className="text-xs text-gray-400 mb-5">Categorized across infrastructure components</p>

            <div className="space-y-4">
              {Object.entries(serviceSpendMap).map(([service, cost]) => {
                const pct = totalSpend > 0 ? ((cost / totalSpend) * 100).toFixed(1) : 0;
                return (
                  <div key={service} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300">{service}</span>
                      <span className="text-white font-semibold">${cost.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mt-6 text-xs text-purple-300">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>FinOps Insight</span>
            </div>
            <p className="text-purple-200/80">
              SageMaker GPU nodes represent 48.6% of overall infrastructure cost. Telemetry ratio rule ensures 100% fair allocation to AI602.
            </p>
          </div>
        </div>

      </div>

      {/* Untagged & Orphan Remediation Queue */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Unallocated Spend & Remediation Queue</span>
            </h3>
            <p className="text-xs text-gray-400">Items requiring tag policy enforcement, idle cleanup, or orphan disk deletion</p>
          </div>
          <span className="badge badge-amber">{unallocatedItems.length} Action Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">CUR ID</th>
                <th className="p-3">Resource ID</th>
                <th className="p-3">Service</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Unallocated Category</th>
                <th className="p-3">Actionable Remediation</th>
                <th className="p-3 text-right">Drill Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {unallocatedItems.map(item => (
                <tr key={item.curId} className="hover:bg-gray-800/40 transition">
                  <td className="p-3 font-mono text-indigo-300">{item.curId}</td>
                  <td className="p-3 font-mono text-gray-300">{item.resourceId}</td>
                  <td className="p-3">{item.service}</td>
                  <td className="p-3 font-bold text-amber-400">${item.rawCost.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="badge badge-rose">{item.unallocatedCategory}</span>
                  </td>
                  <td className="p-3 text-gray-300">{item.remediationAdvice}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onInspectRecord(item)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 inline-flex items-center gap-1 transition"
                    >
                      <span>Lineage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
