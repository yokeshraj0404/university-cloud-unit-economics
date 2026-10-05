// Ingestion Service for Real AWS/GCP Billing Exports (CUR) and Telemetry Logs

import { normalizeTags } from './attributionEngine';

/**
 * Parses raw AWS Cost & Usage Report (CUR) CSV format into structured billing records.
 * Supports standard AWS CUR headers and simplified CSV formats.
 */
export function parseCURCsv(csvString) {
  if (!csvString || typeof csvString !== 'string') {
    throw new Error('Invalid CSV input: Expected non-empty string');
  }

  const lines = csvString.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV line splitter handling quoted strings
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanRow = row.map(cell => cell.replace(/^["']|["']$/g, '').trim());

    const recordObj = {};
    headers.forEach((header, index) => {
      recordObj[header] = cleanRow[index] || '';
    });

    // Map AWS CUR columns or simplified CSV columns
    const curId = recordObj['identity/LineItemId'] || recordObj['curId'] || recordObj['id'] || `CUR-IMPORTED-${i}`;
    const resourceId = recordObj['lineItem/ResourceId'] || recordObj['resourceId'] || recordObj['resource_id'] || 'unassigned-resource';
    const service = recordObj['product/ProductName'] || recordObj['service'] || recordObj['product_name'] || 'Cloud Infrastructure';
    const usageType = recordObj['lineItem/UsageType'] || recordObj['usageType'] || recordObj['usage_type'] || 'StandardUsage';
    const cost = parseFloat(recordObj['lineItem/UnblendedCost'] || recordObj['cost'] || recordObj['amount'] || 0);

    // Extract tags from columns starting with resourceTags/ or explicit tags object
    const tags = {};
    headers.forEach(h => {
      if (h.startsWith('resourceTags/') || h.startsWith('tag:')) {
        const tagKey = h.replace(/^(resourceTags\/|tag:)/, '');
        if (recordObj[h]) tags[tagKey] = recordObj[h];
      }
    });

    // Also check for raw tags JSON string or individual columns
    if (recordObj['tags'] && typeof recordObj['tags'] === 'string') {
      try {
        const parsedJsonTags = JSON.parse(recordObj['tags']);
        Object.assign(tags, parsedJsonTags);
      } catch (e) {
        // Not JSON, ignore
      }
    }
    if (recordObj['CourseID'] || recordObj['course_id']) tags.CourseID = recordObj['CourseID'] || recordObj['course_id'];
    if (recordObj['Semester'] || recordObj['semester']) tags.Semester = recordObj['Semester'] || recordObj['semester'];

    const startPeriod = recordObj['lineItem/UsageStartDate'] || recordObj['usageStart'] || recordObj['start'] || '2026-01-01';
    const endPeriod = recordObj['lineItem/UsageEndDate'] || recordObj['usageEnd'] || recordObj['end'] || '2026-05-31';

    records.push({
      id: curId,
      resourceId,
      service,
      usageType,
      region: recordObj['product/region'] || recordObj['region'] || 'us-east-1',
      cost: isNaN(cost) ? 0 : Math.round(cost * 100) / 100,
      tags,
      usagePeriod: { start: startPeriod, end: endPeriod }
    });
  }

  return records;
}

/**
 * Parses JSON usage telemetry logs and enforces Zero-PII anonymization.
 */
export function parseTelemetryJson(jsonStringOrArray) {
  let logs = [];
  if (typeof jsonStringOrArray === 'string') {
    logs = JSON.parse(jsonStringOrArray);
  } else if (Array.isArray(jsonStringOrArray)) {
    logs = jsonStringOrArray;
  } else {
    throw new Error('Telemetry input must be JSON string or array');
  }

  return logs.map((log, idx) => {
    // Ensure PII protection: if raw student identity (email/name) is present, anonymize it
    let studentHash = log.studentHash || log.userId || log.studentId || `STUDENT_HASH_${idx + 100}`;
    if (studentHash.includes('@') || studentHash.includes(' ')) {
      studentHash = `ANONYMIZED_HASH_${simpleHash(studentHash)}`;
    }

    return {
      sessionId: log.sessionId || `SESS-IMP-${idx + 100}`,
      studentHash,
      courseId: (log.courseId || log.course_id || 'CS101').toUpperCase(),
      semester: log.semester || log.term || 'Fall 2025',
      labExerciseId: log.labExerciseId || log.labId || 'LAB_EX_1',
      cpuHours: parseFloat(log.cpuHours || log.cpu_hours || 0),
      gpuHours: parseFloat(log.gpuHours || log.gpu_hours || 0),
      ramGbHours: parseFloat(log.ramGbHours || log.ram_gb_hours || 0),
      timestamp: log.timestamp || new Date().toISOString(),
      clusterRef: log.clusterRef || log.cluster_name || 'eks-cluster-shared-lab-01'
    };
  });
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Generates sample AWS CUR CSV content for download/testing.
 */
export function generateSampleCsvContent() {
  return `lineItem/ResourceId,product/ProductName,lineItem/UsageType,lineItem/UnblendedCost,resourceTags/CourseID,resourceTags/Semester,lineItem/UsageStartDate
i-0a8f9c123456789a,Amazon EC2,t3.xlarge-LabCompute,4250.00,CS101,Fall 2025,2025-09-01
emr-j-3A9F112233,Amazon EMR Shared Cluster,m5.2xlarge-HadoopNodes,8400.00,CS450,Fall 2025,2025-09-01
ml.p4d.24xlarge-gpu-node-1,AWS SageMaker GPU,p4d.24xlarge-A100-8X,11500.00,AI602,Fall 2025,2025-09-01
i-0c9f110022334455,Amazon EC2 Genomics,c5.4xlarge-GenomicsCompute,3800.00,BIO301,Fall 2025,2025-09-01
eks-cluster-shared-lab-01,AWS EKS,k8s-NodePool-Shared,6500.00,,Fall 2025,2025-09-01
nat-0123456789abcdef0,Shared NAT Gateway,NatGateway-BytesProcessed,1450.00,,Fall 2025,2025-09-01
s3-shared-genomics-cs-datasets,Amazon S3 Shared Datasets,StandardStorage-GB,950.00,,Fall 2025,2025-09-01
i-0999idlebreak999,Amazon EC2,g4dn.2xlarge-GPU-Idle,1120.00,,Fall 2025,2026-01-01
vol-0888orphanebs888,Amazon EBS,gp3-OrphanVolume,480.00,,Fall 2025,2025-09-01`;
}
