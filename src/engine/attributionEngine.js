// Attribution & Decision Logic Engine for University Cloud Unit Economics

import { COURSES } from '../data/mockData';

/**
 * Normalizes resource tags into canonical courseId and semester fields.
 */
export function normalizeTags(rawTags = {}) {
  const normalized = { ...rawTags };
  
  // Case-insensitive key lookup for CourseID
  const courseKey = Object.keys(rawTags).find(k => 
    ['courseid', 'course_id', 'course', 'courseref', 'subject'].includes(k.toLowerCase())
  );
  if (courseKey) {
    normalized.courseId = rawTags[courseKey].toUpperCase();
  }

  // Case-insensitive key lookup for Semester
  const semKey = Object.keys(rawTags).find(k => 
    ['semester', 'sem', 'term', 'academic_term'].includes(k.toLowerCase())
  );
  if (semKey) {
    normalized.semester = rawTags[semKey];
  }

  return normalized;
}

/**
 * Calculates telemetry runtime weighting ratios for shared infrastructure resources.
 */
export function calculateTelemetryRatios(telemetryLogs = [], targetClusterRef = null, semester = null) {
  let filteredLogs = telemetryLogs;
  if (targetClusterRef) {
    filteredLogs = filteredLogs.filter(log => log.clusterRef === targetClusterRef);
  }
  if (semester) {
    filteredLogs = filteredLogs.filter(log => log.semester === semester);
  }

  if (filteredLogs.length === 0) return {};

  const courseWeightSums = {};
  let totalSystemWeight = 0;

  filteredLogs.forEach(log => {
    // GPU hours weighted 10x heavier than CPU hours
    const weight = (log.gpuHours || 0) * 10 + (log.cpuHours || 0) * 1;
    courseWeightSums[log.courseId] = (courseWeightSums[log.courseId] || 0) + weight;
    totalSystemWeight += weight;
  });

  if (totalSystemWeight === 0) return {};

  const ratios = {};
  Object.keys(courseWeightSums).forEach(cId => {
    ratios[cId] = courseWeightSums[cId] / totalSystemWeight;
  });

  return ratios;
}

/**
 * Calculates enrollment volume ratios across courses for fallback rules.
 */
export function calculateEnrollmentRatios(semester = 'Fall 2025') {
  let totalStudents = 0;
  const enrollmentMap = {};

  COURSES.forEach(c => {
    const count = c.enrollment[semester] || 0;
    enrollmentMap[c.id] = count;
    totalStudents += count;
  });

  if (totalStudents === 0) return {};

  const ratios = {};
  Object.keys(enrollmentMap).forEach(cId => {
    ratios[cId] = enrollmentMap[cId] / totalStudents;
  });

  return ratios;
}

/**
 * Executes full spend attribution over raw billing exports given a rule configuration.
 */
export function runAttributionEngine(billingExports, telemetryLogs, rulesConfig, activeSemester = null) {
  const enabledRules = rulesConfig
    .filter(r => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  const attributionResults = [];
  let totalSpend = 0;
  let totalAttributedSpend = 0;

  // Filter billing exports by active semester if specified
  const filteredExports = activeSemester
    ? billingExports.filter(item => {
        const norm = normalizeTags(item.tags);
        if (norm.semester) return norm.semester === activeSemester;
        // If untagged, include in semester view based on usagePeriod date
        if (activeSemester === 'Fall 2025' && item.usagePeriod.start.startsWith('2025')) return true;
        if (activeSemester === 'Spring 2026' && item.usagePeriod.start.startsWith('2026')) return true;
        return false;
      })
    : billingExports;

  filteredExports.forEach(item => {
    totalSpend += item.cost;
    const normTags = normalizeTags(item.tags);
    let itemAttributed = false;

    for (const rule of enabledRules) {
      if (itemAttributed) break;

      // RULE 1: Direct Resource Tag Match
      if (rule.type === 'EXACT_TAG_MATCH') {
        if (normTags.courseId) {
          const matchedSemester = normTags.semester || activeSemester || 'Fall 2025';
          attributionResults.push({
            curId: item.id,
            resourceId: item.resourceId,
            service: item.service,
            rawCost: item.cost,
            attributedCost: item.cost,
            courseId: normTags.courseId,
            semester: matchedSemester,
            ruleId: rule.id,
            ruleName: rule.name,
            confidenceScore: rule.confidence,
            splitPercentage: 100,
            status: 'ALLOCATED',
            evidence: `Exact tag match found: CourseID="${normTags.courseId}", Semester="${matchedSemester}"`
          });
          totalAttributedSpend += item.cost;
          itemAttributed = true;
        }
      }

      // RULE 2: Shared Infrastructure Telemetry Split
      else if (rule.type === 'TELEMETRY_RUNTIME_RATIO') {
        // Matches untagged shared EKS, NAT Gateways, or shared compute
        const isSharedTarget = rule.targetServices.some(ts => item.service.toLowerCase().includes(ts.toLowerCase())) ||
                               item.resourceId.includes('shared') || item.resourceId.includes('nat');
        
        if (isSharedTarget && !normTags.courseId) {
          const targetSem = normTags.semester || activeSemester || 'Fall 2025';
          const ratios = calculateTelemetryRatios(telemetryLogs, item.resourceId.includes('eks') ? item.resourceId : null, targetSem);

          if (Object.keys(ratios).length > 0) {
            Object.keys(ratios).forEach(cId => {
              const ratio = ratios[cId];
              const splitCost = Math.round(item.cost * ratio * 100) / 100;
              attributionResults.push({
                curId: item.id,
                resourceId: item.resourceId,
                service: item.service,
                rawCost: item.cost,
                attributedCost: splitCost,
                courseId: cId,
                semester: targetSem,
                ruleId: rule.id,
                ruleName: rule.name,
                confidenceScore: rule.confidence,
                splitPercentage: Math.round(ratio * 1000) / 10,
                status: 'ALLOCATED',
                evidence: `Telemetry ratio split: ${(ratio * 100).toFixed(1)}% derived from GPU/CPU runtime session logs for ${cId}`
              });
              totalAttributedSpend += splitCost;
            });
            itemAttributed = true;
          }
        }
      }

      // RULE 3: Product Activity Volume Fallback
      else if (rule.type === 'ACTIVITY_VOLUME_WEIGHT') {
        const isVolumeTarget = rule.targetServices.some(ts => item.service.toLowerCase().includes(ts.toLowerCase())) ||
                               item.resourceId.includes('s3') || item.resourceId.includes('shared');

        if (isVolumeTarget && !normTags.courseId) {
          const targetSem = normTags.semester || activeSemester || 'Fall 2025';
          const enrollmentRatios = calculateEnrollmentRatios(targetSem);

          if (Object.keys(enrollmentRatios).length > 0) {
            Object.keys(enrollmentRatios).forEach(cId => {
              const ratio = enrollmentRatios[cId];
              const splitCost = Math.round(item.cost * ratio * 100) / 100;
              attributionResults.push({
                curId: item.id,
                resourceId: item.resourceId,
                service: item.service,
                rawCost: item.cost,
                attributedCost: splitCost,
                courseId: cId,
                semester: targetSem,
                ruleId: rule.id,
                ruleName: rule.name,
                confidenceScore: rule.confidence,
                splitPercentage: Math.round(ratio * 1000) / 10,
                status: 'ALLOCATED',
                evidence: `Activity volume fallback: ${(ratio * 100).toFixed(1)}% split based on ${targetSem} student enrollment headcount`
              });
              totalAttributedSpend += splitCost;
            });
            itemAttributed = true;
          }
        }
      }

      // RULE 4: Unallocated Overhead & Idle Waste Routing
      else if (rule.type === 'UNALLOCATED_OVERHEAD') {
        const isIdleBreak = item.resourceId.includes('idlebreak') || (item.tags.Environment && item.tags.Environment.includes('Unassigned'));
        const isOrphan = item.resourceId.includes('orphan') || item.service.includes('EBS');
        
        const category = isIdleBreak ? 'Idle Semester-Break Waste' : isOrphan ? 'Untagged Orphan Storage' : 'Unallocated Dept Overhead';
        const remediation = isIdleBreak ? 'Shutdown unassigned GPU VM before break' : isOrphan ? 'Delete unattached EBS volume' : 'Apply mandatory tag policy via AWS SCP';

        attributionResults.push({
          curId: item.id,
          resourceId: item.resourceId,
          service: item.service,
          rawCost: item.cost,
          attributedCost: item.cost,
          courseId: 'UNALLOCATED',
          semester: activeSemester || 'Fall 2025',
          ruleId: rule.id,
          ruleName: rule.name,
          confidenceScore: 0,
          splitPercentage: 100,
          status: 'UNALLOCATED',
          unallocatedCategory: category,
          remediationAdvice: remediation,
          evidence: `Unallocated cost routed to department overhead. Reason: ${category}`
        });
        itemAttributed = true;
      }
    }
  });

  const percentageAllocated = totalSpend > 0 ? (totalAttributedSpend / totalSpend) * 100 : 0;

  // Calculate course-level summaries
  const courseSummaries = {};
  COURSES.forEach(c => {
    const sem = activeSemester || 'Fall 2025';
    const courseItems = attributionResults.filter(r => r.courseId === c.id && r.status === 'ALLOCATED');
    const courseSpend = courseItems.reduce((acc, curr) => acc + curr.attributedCost, 0);
    const studentCount = c.enrollment[sem] || 1;
    const allocatedBudget = c.budget[sem] || 10000;
    
    // Total lab target hours across exercises
    const totalLabHours = c.labExercises.reduce((acc, ex) => acc + ex.targetHours, 0);
    const totalStudentHours = totalLabHours * studentCount;

    courseSummaries[c.id] = {
      courseId: c.id,
      courseName: c.name,
      department: c.department,
      leadProfessor: c.leadProfessor,
      semester: sem,
      totalSpend: Math.round(courseSpend * 100) / 100,
      budget: allocatedBudget,
      budgetVariance: Math.round((allocatedBudget - courseSpend) * 100) / 100,
      studentCount,
      costPerStudent: Math.round((courseSpend / studentCount) * 100) / 100,
      costPerStudentHour: totalStudentHours > 0 ? Math.round((courseSpend / totalStudentHours) * 100) / 100 : 0,
      labExerciseSpend: c.labExercises.map(ex => {
        // Proportionally split course spend across exercises
        const exWeight = ex.targetHours / totalLabHours;
        return {
          id: ex.id,
          name: ex.name,
          targetHours: ex.targetHours,
          cost: Math.round(courseSpend * exWeight * 100) / 100
        };
      })
    };
  });

  return {
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalAttributedSpend: Math.round(totalAttributedSpend * 100) / 100,
    totalUnallocatedSpend: Math.round((totalSpend - totalAttributedSpend) * 100) / 100,
    percentageAllocated: Math.round(percentageAllocated * 10) / 10,
    attributionResults,
    courseSummaries
  };
}
