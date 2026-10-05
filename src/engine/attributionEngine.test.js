import { describe, it, expect } from 'vitest';
import { normalizeTags, calculateTelemetryRatios, calculateEnrollmentRatios, runAttributionEngine } from './attributionEngine';
import { parseCURCsv, parseTelemetryJson } from './ingestionService';
import { RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES } from '../data/mockData';

describe('University Cloud Attribution Engine Comprehensive Test Suite', () => {

  describe('Tag Normalization & Schema Reconciliation', () => {
    it('1. Should normalize lowercase and alternate course tag keys', () => {
      const raw = { course_id: 'cs101', term: 'Fall 2025' };
      const norm = normalizeTags(raw);
      expect(norm.courseId).toBe('CS101');
      expect(norm.semester).toBe('Fall 2025');
    });

    it('2. Should handle mixed-case, whitespace, and uppercase keys', () => {
      const raw = { 'COURSE': ' ai602 ', 'SEMESTER': 'Spring 2026' };
      const norm = normalizeTags(raw);
      expect(norm.courseId).toBe('AI602');
      expect(norm.semester).toBe('Spring 2026');
    });

    it('3. Should safely return unchanged object when no course/semester keys are present', () => {
      const raw = { Environment: 'Production', Owner: 'Terraform' };
      const norm = normalizeTags(raw);
      expect(norm.courseId).toBeUndefined();
      expect(norm.semester).toBeUndefined();
      expect(norm.Environment).toBe('Production');
    });
  });

  describe('Telemetry Ratio & Activity Volume Mathematics', () => {
    it('4. Should calculate non-zero GPU/CPU weighted ratios for shared EKS clusters', () => {
      const ratios = calculateTelemetryRatios(USAGE_TELEMETRY, 'eks-cluster-shared-lab-01', 'Fall 2025');
      expect(Object.keys(ratios).length).toBeGreaterThan(0);
      const sum = Object.values(ratios).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 4);
    });

    it('5. Should handle logs with 0 GPU hours safely without division by zero', () => {
      const zeroGpuLogs = [
        { courseId: 'CS101', cpuHours: 10, gpuHours: 0, semester: 'Fall 2025' },
        { courseId: 'BIO301', cpuHours: 30, gpuHours: 0, semester: 'Fall 2025' }
      ];
      const ratios = calculateTelemetryRatios(zeroGpuLogs, null, 'Fall 2025');
      expect(ratios['CS101']).toBeCloseTo(0.25, 2);
      expect(ratios['BIO301']).toBeCloseTo(0.75, 2);
    });

    it('6. Should return empty ratio object if filtered telemetry logs have 0 runtime', () => {
      const zeroLogs = [{ courseId: 'CS101', cpuHours: 0, gpuHours: 0 }];
      const ratios = calculateTelemetryRatios(zeroLogs);
      expect(Object.keys(ratios).length).toBe(0);
    });

    it('7. Should compute enrollment headcount ratios for fallback splitting', () => {
      const ratios = calculateEnrollmentRatios('Fall 2025');
      expect(ratios['CS101']).toBeGreaterThan(0);
      const total = Object.values(ratios).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1.0, 4);
    });
  });

  describe('Full Attribution Engine Execution & Arithmetic Reconciliation', () => {
    it('8. Should process full dataset and achieve ~97.7% allocation ($67,550 of $69,150)', () => {
      const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
      expect(result.totalSpend).toBe(69150.00);
      expect(result.totalAttributedSpend).toBe(67550.00);
      expect(result.totalUnallocatedSpend).toBe(1600.00);
      expect(result.percentageAllocated).toBeCloseTo(97.7, 1);
    });

    it('9. Arithmetic Integrity: Total Spend must exactly equal (Attributed Spend + Unallocated Spend)', () => {
      const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
      const calculatedSum = Math.round((result.totalAttributedSpend + result.totalUnallocatedSpend) * 100) / 100;
      expect(calculatedSum).toBe(result.totalSpend);
    });

    it('10. Should handle zero-cost billing items ($0.00) without crashing or invalid percentages', () => {
      const zeroCostExports = [
        ...RAW_BILLING_EXPORTS,
        { id: 'CUR-ZERO', resourceId: 'i-free-tier', service: 'Amazon EC2', cost: 0.00, tags: { CourseID: 'CS101' }, usagePeriod: { start: '2025-09-01', end: '2025-12-15' } }
      ];
      const result = runAttributionEngine(zeroCostExports, USAGE_TELEMETRY, INITIAL_RULES);
      expect(result.totalSpend).toBe(69150.00);
      expect(result.percentageAllocated).toBeGreaterThan(95.0);
    });

    it('11. Semester Boundary Splitting: Should filter items accurately for Fall 2025 vs Spring 2026', () => {
      const fallResult = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES, 'Fall 2025');
      const springResult = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES, 'Spring 2026');
      
      expect(fallResult.totalSpend).toBeGreaterThan(0);
      expect(springResult.totalSpend).toBeGreaterThan(0);
      expect(fallResult.totalSpend + springResult.totalSpend).toBe(RAW_BILLING_EXPORTS.reduce((a, b) => a + b.cost, 0));
    });

    it('12. Should route untagged orphan EBS storage to UNALLOCATED category', () => {
      const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
      const orphanItem = result.attributionResults.find(r => r.curId === 'CUR-1013');
      expect(orphanItem.status).toBe('UNALLOCATED');
      expect(orphanItem.unallocatedCategory).toBe('Untagged Orphan Storage');
    });

    it('13. Should route idle break spend to UNALLOCATED Category', () => {
      const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
      const idleItem = result.attributionResults.find(r => r.curId === 'CUR-1012');
      expect(idleItem.status).toBe('UNALLOCATED');
      expect(idleItem.unallocatedCategory).toBe('Idle Semester-Break Waste');
    });

    it('14. Multi-split input: Should split single shared resource (EKS Cluster $6,500) into multiple course records', () => {
      const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, INITIAL_RULES);
      const eksRecords = result.attributionResults.filter(r => r.curId === 'CUR-1009');
      expect(eksRecords.length).toBeGreaterThan(1);
      const eksTotalSplitsSum = eksRecords.reduce((acc, curr) => acc + curr.attributedCost, 0);
      expect(eksTotalSplitsSum).toBeCloseTo(6500.00, 2);
    });

    it('15. Dynamic Rule Priority: Disabling Rule 2 should shift shared infrastructure to Volume Fallback (Rule 3)', () => {
      const disabledRule2 = INITIAL_RULES.map(r => r.id === 'RULE_2' ? { ...r, enabled: false } : r);
      const result = runAttributionEngine(RAW_BILLING_EXPORTS, USAGE_TELEMETRY, disabledRule2);
      expect(result.percentageAllocated).toBeGreaterThan(80.0);
      const eksItem = result.attributionResults.find(r => r.curId === 'CUR-1009');
      expect(eksItem.ruleId).toBe('RULE_3');
    });
  });

  describe('Data Ingestion & Privacy Anonymization', () => {
    it('16. Should parse AWS CUR CSV content and hash cleartext student emails into Zero-PII tokens', () => {
      const csvSample = `lineItem/ResourceId,product/ProductName,lineItem/UnblendedCost,resourceTags/CourseID
i-test-123,Amazon EC2,500.00,CS101`;
      const parsedCur = parseCURCsv(csvSample);
      expect(parsedCur.length).toBe(1);
      expect(parsedCur[0].cost).toBe(500.00);

      const rawTelemetry = [{ studentHash: 'student.john@university.edu', courseId: 'cs101' }];
      const anonymized = parseTelemetryJson(rawTelemetry);
      expect(anonymized[0].studentHash).not.toContain('@');
      expect(anonymized[0].studentHash).toContain('ANONYMIZED_HASH_');
    });
  });

});
