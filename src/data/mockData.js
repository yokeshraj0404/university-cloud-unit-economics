// Mock Data for University Cloud Spend Attribution Engine

export const SEMESTERS = ['Fall 2025', 'Spring 2026'];

export const COURSES = [
  {
    id: 'CS101',
    code: 'CS101',
    name: 'Introduction to Cloud Computing',
    department: 'Computer Science',
    leadProfessor: 'Dr. Sarah Jenkins',
    enrollment: { 'Fall 2025': 180, 'Spring 2026': 195 },
    budget: { 'Fall 2025': 8000, 'Spring 2026': 9000 },
    labExercises: [
      { id: 'LAB_EX_1', name: 'Lab 1: AWS S3 & Static Web Hosting', targetHours: 4 },
      { id: 'LAB_EX_2', name: 'Lab 2: EC2 Autoscaling & Elastic Load Balancer', targetHours: 8 },
      { id: 'LAB_EX_3', name: 'Lab 3: Docker Containers on ECS', targetHours: 10 }
    ]
  },
  {
    id: 'CS450',
    code: 'CS450',
    name: 'Big Data & Distributed Systems',
    department: 'Computer Science',
    leadProfessor: 'Prof. Marcus Vance',
    enrollment: { 'Fall 2025': 65, 'Spring 2026': 70 },
    budget: { 'Fall 2025': 16000, 'Spring 2026': 18000 },
    labExercises: [
      { id: 'LAB_EX_1', name: 'Lab 1: Hadoop HDFS Cluster Setup', targetHours: 12 },
      { id: 'LAB_EX_2', name: 'Lab 2: Apache Spark Distributed Analytics', targetHours: 20 },
      { id: 'LAB_EX_3', name: 'Lab 3: Kafka Real-Time Stream Processing', targetHours: 18 }
    ]
  },
  {
    id: 'AI602',
    code: 'AI602',
    name: 'Deep Learning & Neural Networks',
    department: 'Artificial Intelligence Inst.',
    leadProfessor: 'Dr. Elena Rostova',
    enrollment: { 'Fall 2025': 40, 'Spring 2026': 45 },
    budget: { 'Fall 2025': 22000, 'Spring 2026': 25000 },
    labExercises: [
      { id: 'LAB_EX_1', name: 'Lab 1: PyTorch CNN Model Training on A100 GPUs', targetHours: 25 },
      { id: 'LAB_EX_2', name: 'Lab 2: Transformer LLM Fine-Tuning (SageMaker)', targetHours: 35 },
      { id: 'LAB_EX_3', name: 'Lab 3: Distributed Multi-Node GPU Scaling', targetHours: 30 }
    ]
  },
  {
    id: 'BIO301',
    code: 'BIO301',
    name: 'Bioinformatics Genomic Analytics',
    department: 'Computational Biology',
    leadProfessor: 'Prof. David Chen',
    enrollment: { 'Fall 2025': 55, 'Spring 2026': 60 },
    budget: { 'Fall 2025': 10000, 'Spring 2026': 11500 },
    labExercises: [
      { id: 'LAB_EX_1', name: 'Lab 1: Genomic Sequence Alignment Pipeline', targetHours: 14 },
      { id: 'LAB_EX_2', name: 'Lab 2: BLAST Database Search on Cloud Compute', targetHours: 16 }
    ]
  }
];

export const INITIAL_RULES = [
  {
    id: 'RULE_1',
    name: 'Direct Resource Tag Match',
    description: 'Matches exact resource tags (CourseID, Semester) attached to AWS/GCP resources.',
    type: 'EXACT_TAG_MATCH',
    enabled: true,
    priority: 1,
    confidence: 100,
    fields: ['CourseID', 'Semester', 'course_id', 'semester', 'Term']
  },
  {
    id: 'RULE_2',
    name: 'Shared Infrastructure Telemetry Split',
    description: 'Splits shared EKS clusters & NAT gateways proportionally using active GPU/CPU runtime session logs.',
    type: 'TELEMETRY_RUNTIME_RATIO',
    enabled: true,
    priority: 2,
    confidence: 92,
    targetServices: ['AWS EKS', 'Shared NAT Gateway', 'Amazon EMR Shared Cluster']
  },
  {
    id: 'RULE_3',
    name: 'Product Activity Volume Fallback',
    description: 'Allocates shared un-tagged storage (S3 datasets) based on student enrollment & active lab hours.',
    type: 'ACTIVITY_VOLUME_WEIGHT',
    enabled: true,
    priority: 3,
    confidence: 80,
    targetServices: ['Amazon S3 Shared Datasets', 'CloudWatch Logs', 'Elastic IP Pool']
  },
  {
    id: 'RULE_4',
    name: 'Unallocated Overhead & Waste Routing',
    description: 'Routes orphan volumes, broken tags, or idle semester-break spend to Unallocated Department Overhead with remediation alerts.',
    type: 'UNALLOCATED_OVERHEAD',
    enabled: true,
    priority: 4,
    confidence: 0,
    targetServices: ['*']
  }
];

// Raw Cloud Billing CUR Records ($48,500 total spend)
export const RAW_BILLING_EXPORTS = [
  {
    id: 'CUR-1001',
    resourceId: 'i-0a8f9c123456789a',
    service: 'Amazon EC2',
    usageType: 't3.xlarge-LabCompute',
    region: 'us-east-1',
    cost: 4250.00,
    tags: { CourseID: 'CS101', Semester: 'Fall 2025', Environment: 'Lab' },
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  {
    id: 'CUR-1002',
    resourceId: 'i-0b7e8d234567890b',
    service: 'Amazon EC2',
    usageType: 't3.xlarge-LabCompute',
    region: 'us-east-1',
    cost: 4600.00,
    tags: { course_id: 'CS101', semester: 'Spring 2026', Environment: 'Lab' },
    usagePeriod: { start: '2026-01-15', end: '2026-05-15' }
  },
  {
    id: 'CUR-1003',
    resourceId: 'emr-j-3A9F112233',
    service: 'Amazon EMR Shared Cluster',
    usageType: 'm5.2xlarge-HadoopNodes',
    region: 'us-east-1',
    cost: 8400.00,
    tags: { CourseID: 'CS450', Semester: 'Fall 2025', Owner: 'ProfVance' },
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  {
    id: 'CUR-1004',
    resourceId: 'emr-j-4B0F223344',
    service: 'Amazon EMR Shared Cluster',
    usageType: 'm5.2xlarge-HadoopNodes',
    region: 'us-east-1',
    cost: 9100.00,
    tags: { CourseID: 'CS450', Semester: 'Spring 2026', Owner: 'ProfVance' },
    usagePeriod: { start: '2026-01-15', end: '2026-05-15' }
  },
  {
    id: 'CUR-1005',
    resourceId: 'ml.p4d.24xlarge-gpu-node-1',
    service: 'AWS SageMaker GPU',
    usageType: 'p4d.24xlarge-A100-8X',
    region: 'us-east-1',
    cost: 11500.00,
    tags: { CourseID: 'AI602', Semester: 'Fall 2025', Environment: 'ResearchLab' },
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  {
    id: 'CUR-1006',
    resourceId: 'ml.p4d.24xlarge-gpu-node-2',
    service: 'AWS SageMaker GPU',
    usageType: 'p4d.24xlarge-A100-8X',
    region: 'us-east-1',
    cost: 12800.00,
    tags: { CourseID: 'AI602', Semester: 'Spring 2026', Environment: 'ResearchLab' },
    usagePeriod: { start: '2026-01-15', end: '2026-05-15' }
  },
  {
    id: 'CUR-1007',
    resourceId: 'i-0c9f110022334455',
    service: 'Amazon EC2 Genomics',
    usageType: 'c5.4xlarge-GenomicsCompute',
    region: 'us-west-2',
    cost: 3800.00,
    tags: { CourseID: 'BIO301', Semester: 'Fall 2025' },
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  {
    id: 'CUR-1008',
    resourceId: 'i-0d0f221133445566',
    service: 'Amazon EC2 Genomics',
    usageType: 'c5.4xlarge-GenomicsCompute',
    region: 'us-west-2',
    cost: 4200.00,
    tags: { CourseID: 'BIO301', Semester: 'Spring 2026' },
    usagePeriod: { start: '2026-01-15', end: '2026-05-15' }
  },
  // Shared Untagged Infrastructure (Requires Telemetry Split)
  {
    id: 'CUR-1009',
    resourceId: 'eks-cluster-shared-lab-01',
    service: 'AWS EKS',
    usageType: 'k8s-NodePool-Shared',
    region: 'us-east-1',
    cost: 6500.00,
    tags: {}, // Intentionally empty to test telemetry split rule
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  {
    id: 'CUR-1010',
    resourceId: 'nat-0123456789abcdef0',
    service: 'Shared NAT Gateway',
    usageType: 'NatGateway-BytesProcessed',
    region: 'us-east-1',
    cost: 1450.00,
    tags: { ManagedBy: 'Terraform' }, // No course tag
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  {
    id: 'CUR-1011',
    resourceId: 's3-shared-genomics-cs-datasets',
    service: 'Amazon S3 Shared Datasets',
    usageType: 'StandardStorage-GB',
    region: 'us-east-1',
    cost: 950.00,
    tags: {}, // Untagged shared dataset bucket
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  },
  // Edge / Failure Cases: Idle break spend & Orphan volumes
  {
    id: 'CUR-1012',
    resourceId: 'i-0999idlebreak999',
    service: 'Amazon EC2',
    usageType: 'g4dn.2xlarge-GPU-Idle',
    region: 'us-east-1',
    cost: 1120.00,
    tags: { Environment: 'Lab-Unassigned' }, // Forgotten VM during Jan break
    usagePeriod: { start: '2026-01-01', end: '2026-01-14' }
  },
  {
    id: 'CUR-1013',
    resourceId: 'vol-0888orphanebs888',
    service: 'Amazon EBS',
    usageType: 'gp3-OrphanVolume',
    region: 'us-east-1',
    cost: 480.00,
    tags: {}, // Detached orphan disk
    usagePeriod: { start: '2025-09-01', end: '2025-12-15' }
  }
];

// Telemetry Session Logs (Privacy-Preserving - Hashed Student Identifiers)
export const USAGE_TELEMETRY = [
  {
    sessionId: 'SESS-8012',
    studentHash: 'STUDENT_HASH_7A12',
    courseId: 'CS101',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_1',
    cpuHours: 4.5,
    gpuHours: 0,
    ramGbHours: 18.0,
    timestamp: '2025-09-12T14:30:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8013',
    studentHash: 'STUDENT_HASH_8B34',
    courseId: 'CS101',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_2',
    cpuHours: 8.0,
    gpuHours: 0,
    ramGbHours: 32.0,
    timestamp: '2025-10-05T10:15:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8014',
    studentHash: 'STUDENT_HASH_9C56',
    courseId: 'CS450',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_2',
    cpuHours: 45.0,
    gpuHours: 2.0,
    ramGbHours: 180.0,
    timestamp: '2025-10-20T16:00:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8015',
    studentHash: 'STUDENT_HASH_1D78',
    courseId: 'CS450',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_3',
    cpuHours: 60.0,
    gpuHours: 5.0,
    ramGbHours: 240.0,
    timestamp: '2025-11-14T11:45:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8016',
    studentHash: 'STUDENT_HASH_2E90',
    courseId: 'AI602',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_1',
    cpuHours: 120.0,
    gpuHours: 42.0,
    ramGbHours: 960.0,
    timestamp: '2025-10-10T09:00:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8017',
    studentHash: 'STUDENT_HASH_3F12',
    courseId: 'AI602',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_2',
    cpuHours: 210.0,
    gpuHours: 88.0,
    ramGbHours: 1680.0,
    timestamp: '2025-11-01T13:20:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8018',
    studentHash: 'STUDENT_HASH_4G34',
    courseId: 'BIO301',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_1',
    cpuHours: 35.0,
    gpuHours: 0,
    ramGbHours: 140.0,
    timestamp: '2025-09-28T15:10:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  },
  {
    sessionId: 'SESS-8019',
    studentHash: 'STUDENT_HASH_5H56',
    courseId: 'BIO301',
    semester: 'Fall 2025',
    labExerciseId: 'LAB_EX_2',
    cpuHours: 40.0,
    gpuHours: 0,
    ramGbHours: 160.0,
    timestamp: '2025-10-18T17:00:00Z',
    clusterRef: 'eks-cluster-shared-lab-01'
  }
];

export const SYSTEM_FRESHNESS = {
  curExport: {
    status: 'FRESH',
    lastSync: '2026-09-09 09:00:00 UTC',
    provider: 'AWS Cost & Usage Report (CUR)',
    recordCount: 13
  },
  telemetry: {
    status: 'FRESH',
    lastSync: '2026-09-09 11:10:00 UTC',
    provider: 'CloudLab JupyterHub & K8s Event Collector',
    sessionCount: 1240
  },
  tagTaxonomy: {
    status: 'OPTIMIZED',
    lastSync: '2026-09-09 11:15:00 UTC',
    healthScore: '96.4%'
  }
};
