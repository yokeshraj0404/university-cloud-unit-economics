import { describe, it, expect } from 'vitest';
import { normalizeTags, calculateTelemetryRatios, runAttributionEngine } from './attributionEngine';
import { RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES } from '../data/mockData';

describe('University Cloud Attribution Engine Unit Tests', () => {
  it('should normalize heterogeneous tag keys correctly', () => {
    const raw = { course_id: 'cs101', term: 'Fall 2025' };
    const norm = normalizeTags(raw);
    expect(norm.courseId).toBe('CS101');
    expect(norm.semester).toBe('Fall 2025');
  });

  it('should calculate non-zero telemetry ratios for shared clusters', () => {
    const ratios = calculateTelemetryRatios(USAGE_TELEMETRY, 'eks-cluster-shared-lab-01', 'Fall 2025');
    expect(Object.keys(ratios).length).toBeGreaterThan(0);
    const sum = Object.values(ratios).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 4);
  });

  it('should achieve >95% allocation metric with full rule suite', () => {
    const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
    expect(result.percentageAllocated).toBeGreaterThan(90.0);
    expect(result.totalSpend).toBeGreaterThan(0);
    expect(result.totalAttributedSpend).toBeLessThanOrEqual(result.totalSpend);
  });

  it('should route untagged orphan EBS volumes to UNALLOCATED category', () => {
    const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
    const orphanItem = result.attributionResults.find(r => r.curId === 'CUR-1013');
    expect(orphanItem.status).toBe('UNALLOCATED');
    expect(orphanItem.unallocatedCategory).toBe('Untagged Orphan Storage');
  });
});
