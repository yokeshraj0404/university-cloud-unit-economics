// Dynamic Data Freshness & Pipeline Sync Health Engine

/**
 * Calculates dynamic pipeline freshness, sync lag, tag coverage, and data health alerts.
 */
export function calculateDynamicFreshness(billingExports = [], telemetryLogs = [], syncState = {}) {
  const now = new Date();
  
  // Custom or default sync timestamps
  const curSyncTime = syncState.curSyncTime ? new Date(syncState.curSyncTime) : new Date(now.getTime() - 2 * 3600 * 1000); // 2 hours ago
  const telemSyncTime = syncState.telemSyncTime ? new Date(syncState.telemSyncTime) : new Date(now.getTime() - 12 * 60 * 1000); // 12 mins ago

  const curAgeMinutes = Math.floor((now - curSyncTime) / (1000 * 60));
  const telemAgeMinutes = Math.floor((now - telemSyncTime) / (1000 * 60));

  // Determine CUR Sync Status
  let curStatus = 'FRESH';
  let curBadgeClass = 'badge-emerald';
  if (curAgeMinutes > 24 * 60) {
    curStatus = 'STALE';
    curBadgeClass = 'badge-rose';
  } else if (curAgeMinutes > 4 * 60) {
    curStatus = 'LAGGING';
    curBadgeClass = 'badge-amber';
  }

  // Determine Telemetry Sync Status
  let telemStatus = 'FRESH';
  let telemBadgeClass = 'badge-emerald';
  if (telemAgeMinutes > 12 * 60) {
    telemStatus = 'STALE';
    telemBadgeClass = 'badge-rose';
  } else if (telemAgeMinutes > 60) {
    telemStatus = 'LAGGING';
    telemBadgeClass = 'badge-amber';
  }

  // Calculate Tag Taxonomy Coverage
  let taggedCount = 0;
  let totalCost = 0;
  let taggedCost = 0;

  billingExports.forEach(item => {
    totalCost += item.cost;
    const hasTag = item.tags && Object.keys(item.tags).some(k => 
      ['courseid', 'course_id', 'course', 'semester', 'term'].includes(k.toLowerCase())
    );
    if (hasTag) {
      taggedCount++;
      taggedCost += item.cost;
    }
  });

  const tagCoveragePct = totalCost > 0 ? Math.round((taggedCost / totalCost) * 1000) / 10 : 0;
  const untaggedCount = billingExports.length - taggedCount;

  // Generate Missing / Stale Data Warning Alerts
  const missingDataAlerts = [];
  if (untaggedCount > 0) {
    missingDataAlerts.push({
      id: 'ALT-01',
      severity: 'WARNING',
      title: `${untaggedCount} Untagged Resources Detected`,
      message: `$${(totalCost - taggedCost).toLocaleString()} of cloud spend lacks explicit CourseID tags and relies on Telemetry Split Rules.`
    });
  }

  if (telemAgeMinutes > 60) {
    missingDataAlerts.push({
      id: 'ALT-02',
      severity: 'CRITICAL',
      title: 'Telemetry Pipeline Lagging',
      message: `Telemetry sync is ${telemAgeMinutes} minutes behind. Provisional reconciliation buffer active.`
    });
  }

  return {
    cur: {
      status: curStatus,
      badgeClass: curBadgeClass,
      ageMinutes: curAgeMinutes,
      lastSyncDisplay: formatAge(curAgeMinutes),
      provider: 'AWS CUR S3 Export Pipeline',
      recordCount: billingExports.length
    },
    telemetry: {
      status: telemStatus,
      badgeClass: telemBadgeClass,
      ageMinutes: telemAgeMinutes,
      lastSyncDisplay: formatAge(telemAgeMinutes),
      provider: 'K8s Pod & SageMaker Log Collector',
      sessionCount: telemetryLogs.length
    },
    tagCoverage: {
      coveragePct: tagCoveragePct,
      taggedCount,
      untaggedCount,
      untaggedCost: Math.round((totalCost - taggedCost) * 100) / 100,
      healthGrade: tagCoveragePct > 80 ? 'A+' : tagCoveragePct > 60 ? 'B' : 'C'
    },
    alerts: missingDataAlerts
  };
}

function formatAge(minutes) {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m ago`;
}
