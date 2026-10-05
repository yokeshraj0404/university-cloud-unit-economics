import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Layers, 
  DollarSign,
  BarChart2
} from 'lucide-react';
import { COURSES } from '../data/mockData';

export function TrendsView({ engineResult }) {
  // Aggregate multi-semester metrics
  const fallSpend = 34900.00;
  const springSpend = 34250.00;
  const spendDiff = (springSpend - fallSpend).toFixed(2);
  const isSpendDown = springSpend < fallSpend;

  const fallStudents = 340;
  const springStudents = 370;
  const studentGrowth = (((springStudents - fallStudents) / fallStudents) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              <span>Multi-Semester Comparative Analysis & Time-Series Trends</span>
            </h2>
            <span className="badge badge-indigo">Semester Analytics</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tracking cloud spend trajectory, unit-economics efficiency, and enrollment growth across academic terms.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 px-3.5 py-2 rounded-xl border border-gray-800 text-xs text-gray-300">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Fall 2025 vs Spring 2026</span>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Fall 2025 Spend */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Fall 2025 Aggregate Spend</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">${fallSpend.toLocaleString()}</h3>
          <p className="text-xs text-indigo-400 mt-1">100% Attributed</p>
        </div>

        {/* Spring 2026 Spend */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Spring 2026 Aggregate Spend</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">${springSpend.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>${Math.abs(spendDiff)} (-1.9% Efficiency Gain)</span>
          </div>
        </div>

        {/* Student Headcount Growth */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Enrolled Students Growth</p>
          <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{springStudents} Students</h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-300 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{studentGrowth}% vs Fall 2025 ({fallStudents})</span>
          </div>
        </div>

        {/* Unit Economics Efficiency Trend */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase">Avg Cost / Student-Hour</p>
          <h3 className="text-2xl font-extrabold text-purple-400 mt-1">$16.80 / hr</h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-$1.60/hr reduction (Improved utilization)</span>
          </div>
        </div>

      </div>

      {/* Semester-over-Semester Course Efficiency Table */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-base text-white mb-1 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <span>Course-Level Semester-over-Semester Comparison</span>
        </h3>
        <p className="text-xs text-gray-400 mb-4">Attributed cloud cost, student headcount, and cost-per-student trend</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">Course Code & Name</th>
                <th className="p-3">Fall 2025 Spend</th>
                <th className="p-3">Spring 2026 Spend</th>
                <th className="p-3">Students (F / S)</th>
                <th className="p-3">Cost / Student (Fall)</th>
                <th className="p-3">Cost / Student (Spring)</th>
                <th className="p-3 text-right">Unit Efficiency Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              <tr className="hover:bg-gray-800/30">
                <td className="p-3 font-sans font-bold text-white">CS101 Intro to Cloud</td>
                <td className="p-3 text-gray-300">$4,250</td>
                <td className="p-3 text-emerald-400 font-bold">$4,600</td>
                <td className="p-3 text-indigo-300">180 / 195</td>
                <td className="p-3 text-gray-400">$23.61</td>
                <td className="p-3 text-emerald-300 font-bold">$23.59</td>
                <td className="p-3 text-right text-emerald-400 font-semibold font-sans">-0.1% Stable</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-3 font-sans font-bold text-white">CS450 Big Data Systems</td>
                <td className="p-3 text-gray-300">$8,400</td>
                <td className="p-3 text-emerald-400 font-bold">$9,100</td>
                <td className="p-3 text-indigo-300">65 / 70</td>
                <td className="p-3 text-gray-400">$129.23</td>
                <td className="p-3 text-emerald-300 font-bold">$130.00</td>
                <td className="p-3 text-right text-amber-400 font-semibold font-sans">+0.6% Slight Rise</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-3 font-sans font-bold text-white">AI602 Deep Learning GPU</td>
                <td className="p-3 text-gray-300">$11,500</td>
                <td className="p-3 text-emerald-400 font-bold">$12,800</td>
                <td className="p-3 text-indigo-300">40 / 45</td>
                <td className="p-3 text-gray-400">$287.50</td>
                <td className="p-3 text-emerald-300 font-bold">$284.44</td>
                <td className="p-3 text-right text-emerald-400 font-semibold font-sans">-1.1% Improved</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-3 font-sans font-bold text-white">BIO301 Bioinformatics</td>
                <td className="p-3 text-gray-300">$3,800</td>
                <td className="p-3 text-emerald-400 font-bold">$4,200</td>
                <td className="p-3 text-indigo-300">55 / 60</td>
                <td className="p-3 text-gray-400">$69.09</td>
                <td className="p-3 text-emerald-300 font-bold">$70.00</td>
                <td className="p-3 text-right text-amber-400 font-semibold font-sans">+1.3% Slight Rise</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Time-Series Spend Trajectory */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-base text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Monthly Time-Series Cloud Spend Trajectory</span>
        </h3>
        <p className="text-xs text-gray-400 mb-4">Monthly cloud lab expenditure across Fall 2025 & Spring 2026 academic calendar</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3 text-center">
          {[
            { month: 'Sept 2025', cost: '$8,200', pct: 60 },
            { month: 'Oct 2025', cost: '$9,800', pct: 75 },
            { month: 'Nov 2025', cost: '$11,400', pct: 90 },
            { month: 'Dec 2025', cost: '$5,500', pct: 40 },
            { month: 'Jan 2026', cost: '$2,120', pct: 20 }, // Includes Jan break waste
            { month: 'Feb 2026', cost: '$8,900', pct: 68 },
            { month: 'Mar 2026', cost: '$10,200', pct: 80 },
            { month: 'Apr 2026', cost: '$11,800', pct: 95 },
            { month: 'May 2026', cost: '$3,230', pct: 30 }
          ].map((m, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase">{m.month}</span>
              <div className="w-full bg-gray-800 h-16 rounded-lg my-2 relative flex items-end justify-center overflow-hidden">
                <div className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-b-lg" style={{ height: `${m.pct}%` }}></div>
              </div>
              <span className="text-xs font-extrabold text-white font-mono">{m.cost}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
