import React, { useState } from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  FlaskConical,
  BarChart,
  BookOpen
} from 'lucide-react';
import { COURSES } from '../data/mockData';

export function ProfessorView({ engineResult, onInspectRecord }) {
  const [selectedCourseId, setSelectedCourseId] = useState('AI602');

  const courseObj = COURSES.find(c => c.id === selectedCourseId) || COURSES[0];
  const summary = engineResult.courseSummaries[selectedCourseId] || {};

  // Filter attribution items for selected course
  const courseAttributions = engineResult.attributionResults.filter(
    r => r.courseId === selectedCourseId && r.status === 'ALLOCATED'
  );

  const isOverBudget = summary.totalSpend > summary.budget;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Course Selector */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{courseObj.name}</h2>
              <span className="badge badge-indigo">{courseObj.code}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Department: {courseObj.department} &bull; Lead: <span className="text-gray-200 font-semibold">{courseObj.leadProfessor}</span>
            </p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
          <span className="text-xs font-semibold text-gray-400">Select Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-transparent text-sm text-white font-bold focus:outline-none cursor-pointer"
          >
            {COURSES.map(c => (
              <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Unit Economics Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Total Spend */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Total Cloud Cost</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">${summary.totalSpend?.toLocaleString() || 0}</h3>
          <p className="text-[11px] text-indigo-400 mt-1">Attributed via Rule Engine</p>
        </div>

        {/* Cost per Student */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Cost / Enrolled Student</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">${summary.costPerStudent}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Based on {summary.studentCount} enrolled students</p>
        </div>

        {/* Cost per Student Lab Hour */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Cost / Student Lab Hour</p>
          <h3 className="text-2xl font-extrabold text-purple-400 mt-1">${summary.costPerStudentHour} / hr</h3>
          <p className="text-[11px] text-gray-400 mt-1">Runtime session efficiency</p>
        </div>

        {/* Semester Budget Variance */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Semester Budget</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">${summary.budget?.toLocaleString()}</h3>
          <p className={`text-[11px] font-semibold mt-1 ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isOverBudget ? `Over budget by $${Math.abs(summary.budgetVariance)}` : `Under budget by $${summary.budgetVariance}`}
          </p>
        </div>

      </div>

      {/* Per Lab Exercise Cost Attribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lab Exercise Breakdown Cards (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <span>Spend Attributed by Lab Exercise</span>
              </h3>
              <p className="text-xs text-gray-400">Unit economics split across specific lab assignments</p>
            </div>
            <span className="badge badge-emerald">{summary.labExerciseSpend?.length || 0} Exercises</span>
          </div>

          <div className="space-y-4">
            {summary.labExerciseSpend?.map(ex => {
              const pct = summary.totalSpend > 0 ? ((ex.cost / summary.totalSpend) * 100).toFixed(1) : 0;
              const costPerStudentForEx = summary.studentCount > 0 ? (ex.cost / summary.studentCount).toFixed(2) : 0;

              return (
                <div key={ex.id} className="p-4 rounded-xl bg-gray-900/70 border border-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">{ex.id}</span>
                        <h4 className="font-bold text-sm text-gray-100">{ex.name}</h4>
                      </div>
                      <p className="text-xs text-gray-400">Estimated Target Duration: {ex.targetHours} hours / student</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-300">${ex.cost.toLocaleString()}</span>
                      <p className="text-xs text-gray-400">{pct}% of course spend</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden my-2">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 pt-2">
                    <span>Cost per student for this lab: <strong className="text-white">${costPerStudentForEx}</strong></span>
                    <span className="badge badge-blue">Telemetry Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Telemetry & Privacy Insights (1 col) */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>Privacy & Telemetry Protocol</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Zero-PII Compliance & Telemetry Lineage</p>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Anonymization Method</span>
                <p className="font-mono text-indigo-300">SHA-256 Hashed Student IDs</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Tracked Workload Metrics</span>
                <p>GPU-hours, CPU-hours, RAM GB-hours, Egress GB</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Shared Infrastructure Rule</span>
                <p>EKS Cluster runtime split proportionately via Rule 2</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mt-6">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Professor Audit Guarantee</span>
            </div>
            <p className="text-indigo-200/80">
              Every dollar billed to {courseObj.code} can be traced directly to an exact AWS CUR line item or session telemetry log.
            </p>
          </div>
        </div>

      </div>

      {/* Attributed Billing Line Items for Course */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Attributed Billing Line Items for {courseObj.code}</span>
            </h3>
            <p className="text-xs text-gray-400">Detailed cloud infrastructure records allocated to this course</p>
          </div>
          <span className="badge badge-indigo">{courseAttributions.length} Items Allocated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">CUR ID</th>
                <th className="p-3">Resource ID</th>
                <th className="p-3">Service</th>
                <th className="p-3">Attributed Cost</th>
                <th className="p-3">Rule Applied</th>
                <th className="p-3">Confidence</th>
                <th className="p-3 text-right">Drill Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {courseAttributions.map(item => (
                <tr key={item.curId + item.courseId} className="hover:bg-gray-800/40 transition">
                  <td className="p-3 font-mono text-indigo-300">{item.curId}</td>
                  <td className="p-3 font-mono text-gray-300">{item.resourceId}</td>
                  <td className="p-3">{item.service}</td>
                  <td className="p-3 font-bold text-emerald-400">${item.attributedCost.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="badge badge-blue">{item.ruleName}</span>
                  </td>
                  <td className="p-3 font-semibold text-indigo-300">{item.confidenceScore}%</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onInspectRecord(item)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 inline-flex items-center gap-1 transition"
                    >
                      <span>Evidence</span>
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
