import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  Database, 
  Layers, 
  HelpCircle, 
  Github,
  CheckCircle2
} from 'lucide-react';

export function DocumentationView() {
  const [docTab, setDocTab] = useState('assumptions');

  return (
    <div className="space-y-6">
      
      {/* Documentation Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>Supporting Documentation & Repository Reference</span>
            </h2>
            <span className="badge badge-indigo">System Specs</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Architecture design, data schemas, stakeholder assumptions, risk register, and deployment guide.
          </p>
        </div>

        {/* Documentation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setDocTab('assumptions')}
            className={`tab-btn text-xs ${docTab === 'assumptions' ? 'active' : ''}`}
          >
            Assumptions
          </button>
          <button
            onClick={() => setDocTab('architecture')}
            className={`tab-btn text-xs ${docTab === 'architecture' ? 'active' : ''}`}
          >
            Architecture
          </button>
          <button
            onClick={() => setDocTab('schemas')}
            className={`tab-btn text-xs ${docTab === 'schemas' ? 'active' : ''}`}
          >
            Data Schemas
          </button>
          <button
            onClick={() => setDocTab('risks')}
            className={`tab-btn text-xs ${docTab === 'risks' ? 'active' : ''}`}
          >
            Risk Register
          </button>
          <button
            onClick={() => setDocTab('guide')}
            className={`tab-btn text-xs ${docTab === 'guide' ? 'active' : ''}`}
          >
            User Guide
          </button>
        </div>
      </div>

      {/* TAB 1: Stakeholder Assumptions */}
      {docTab === 'assumptions' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Key Stakeholder Assumptions</span>
          </h3>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="font-bold text-indigo-300">1. Data Privacy & Zero-PII Compliance</span>
              <p className="text-gray-400">
                Student identities are never transmitted to the FinOps engine in cleartext. All usage telemetry uses SHA-256 session tokens (`STUDENT_HASH_7A12`).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="font-bold text-indigo-300">2. Shared Resource Telemetry Availability</span>
              <p className="text-gray-400">
                Shared Kubernetes (EKS) clusters emit pod execution logs containing namespace and course references, enabling precise telemetry-ratio split.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="font-bold text-indigo-300">3. Semester Lifecycle Boundaries</span>
              <p className="text-gray-400">
                Academic terms follow distinct date ranges (Fall: Sept-Dec, Spring: Jan-May). Infrastructure running during break without active student sessions is categorized as Idle Break Waste.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Architecture */}
      {docTab === 'architecture' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Attribution System Architecture Diagram</span>
          </h3>

          <div className="p-4 rounded-xl bg-gray-950 font-mono text-xs text-indigo-300 overflow-x-auto">
            <pre>{`
+-----------------------+     +------------------------+     +-------------------------+
| Cloud Billing CUR     |     | Usage Telemetry Logs   |     | Product Volume Stats    |
| (EC2, EKS, SageMaker) |     | (GPU-hrs, Session IDs) |     | (Enrollment Headcount)  |
+-----------+-----------+     +-----------+------------+     +------------+------------+
            |                             |                               |
            v                             v                               v
+--------------------------------------------------------------------------------------+
|                           ATTRIBUTION & DECISION LOGIC ENGINE                        |
|                                                                                      |
|  [Priority 1] EXACT_TAG_MATCH Heuristic  (CourseID, Semester)                        |
|  [Priority 2] TELEMETRY_RUNTIME_RATIO    (GPU/CPU Session Ratio for EKS & NAT)       |
|  [Priority 3] ACTIVITY_VOLUME_WEIGHT    (Enrollment Headcount Fallback)              |
|  [Priority 4] UNALLOCATED_OVERHEAD       (Orphan storage & Break Waste Routing)      |
+-----------------------------------------+--------------------------------------------+
                                          |
                                          v
+--------------------------------------------------------------------------------------+
|                           UNIT-ECONOMICS PRESENTATION LAYER                          |
|                                                                                      |
|  - % Spend Allocated Gauge (Baseline: 42.8% -> Measured: 96.4%)                      |
|  - Role-Based Perspectives: FinOps Admin & Course Professor                          |
|  - Lineage Audit Drill-Down & Edge-Case Failure Test Harness                         |
+--------------------------------------------------------------------------------------+
            `}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: Data Schemas */}
      {docTab === 'schemas' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>System Data Schemas</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
              <span className="font-bold text-indigo-300 font-sans">Cloud Billing Export (CUR) Schema</span>
              <pre className="text-gray-300 text-[11px]">{`{
  curId: "CUR-1001",
  resourceId: "i-0a8f9c123456789a",
  service: "Amazon EC2",
  cost: 4250.00,
  tags: { CourseID: "CS101", Semester: "Fall 2025" },
  usagePeriod: { start: "2025-09-01", end: "2025-12-15" }
}`}</pre>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
              <span className="font-bold text-emerald-300 font-sans">Usage Telemetry Schema</span>
              <pre className="text-gray-300 text-[11px]">{`{
  sessionId: "SESS-8012",
  studentHash: "STUDENT_HASH_7A12",
  courseId: "CS101",
  labExerciseId: "LAB_EX_1",
  cpuHours: 4.5,
  gpuHours: 0.0,
  clusterRef: "eks-cluster-shared-lab-01"
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Risk Register */}
      {docTab === 'risks' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Risk Register & Mitigation Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3">Risk ID</th>
                  <th className="p-3">Risk Description</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                <tr>
                  <td className="p-3 font-mono text-indigo-300">RSK-01</td>
                  <td className="p-3">Untagged shared resources created by temporary lab teaching assistants</td>
                  <td className="p-3"><span className="badge badge-amber font-bold">MEDIUM</span></td>
                  <td className="p-3">Telemetry ratio split rule (Rule 2) correlates session logs automatically.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-indigo-300">RSK-02</td>
                  <td className="p-3">Late-arriving telemetry logs causing initial month-end allocation mismatch</td>
                  <td className="p-3"><span className="badge badge-amber font-bold">MEDIUM</span></td>
                  <td className="p-3">Provisional Reconciliation Buffer holds unassigned spend for 48 hours.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-indigo-300">RSK-03</td>
                  <td className="p-3">Accidental PII leak in lab execution session log metadata</td>
                  <td className="p-3"><span className="badge badge-rose font-bold">HIGH</span></td>
                  <td className="p-3">In-line telemetry collector hashes all student identifiers at source.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: User Guide */}
      {docTab === 'guide' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <span>User & Deployment Guide</span>
          </h3>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="font-bold text-white">How to Run locally:</span>
              <p className="font-mono text-indigo-300 mt-1">
                cd /Users/yokzz/.gemini/antigravity/scratch/university_cloud_unit_economics<br />
                npm run dev
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="font-bold text-white">How to Run Unit Tests:</span>
              <p className="font-mono text-emerald-300 mt-1">
                npm run test
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
