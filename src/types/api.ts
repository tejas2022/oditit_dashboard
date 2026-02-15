// =============================================================================
// Compliance SaaS Dashboard - TypeScript Types
// Based on Prisma schema with INT IDs
// =============================================================================

// =============================================================================
// API Response Types
// =============================================================================
export interface ApiResponse<T = unknown> {
  statusCode: number;
  status: boolean;
  data: T;
  message: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginatedMeta;
  pagination?: { page: number; limit: number; total: number };
  total?: number;
}

// =============================================================================
// Enums
// =============================================================================
export type AuthProvider = 'EMAIL' | 'GOOGLE';
export type SectionAccess = 'READ' | 'WRITE';
export type ControlInstanceStatus = 'DRAFT' | 'UPLOADED' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED';
export type AIAssessmentResult = 'NONE' | 'PASS' | 'FAIL' | 'INCONCLUSIVE';
export type ChecklistStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type AuditorReviewStatus = 'INCOMPLETE' | 'DONE';
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CISO'
  | 'SECURITY_TEAM'
  | 'IT_TEAM'
  | 'EMPLOYEE'
  | 'AUDITOR';

// =============================================================================
// User & Auth Types
// =============================================================================
export interface User {
  id: number;
  email: string;
  name?: string;
  authProvider: AuthProvider;
  passwordHash?: string;
  emailConfirmedAt?: string;
  isActive: boolean;
  googleId?: string;
  dateAdded: string;
  dateUpdated: string;
}

export interface RefreshToken {
  id: number;
  token: string;
  userId: number;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface Organization {
  id: number;
  name: string;
  slug?: string;
  complianceStartDate?: string;
  settings?: Record<string, any>;
  dateAdded: string;
  dateUpdated: string;
}

export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  user: User;
  roles: OrganizationMemberRole[];
  dateAdded: string;
  dateUpdated: string;
}

export interface Role {
  id: number;
  name: string;
  label?: string;
  dateAdded: string;
}

export interface OrganizationMemberRole {
  id: number;
  organizationMemberId: number;
  roleId: number;
  role: Role;
}

export interface SectionPermission {
  id: number;
  organizationId: number;
  userId: number;
  section: string;
  access: SectionAccess;
  organizationFrameworkId?: number;
  dateAdded: string;
  dateUpdated: string;
}

// =============================================================================
// Auth Response Types
// =============================================================================
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** TPRM assignment for org switcher (as respondent or assessor) */
export interface TprmAssignmentItem {
  tprmVendorId: number;
  vendorName?: string;
  organizationId: number;
  organizationName?: string;
  organizationSlug?: string;
  role: 'RESPONDENT' | 'ASSESSOR';
}

export interface TprmAssignments {
  asRespondent: TprmAssignmentItem[];
  asAssessor: TprmAssignmentItem[];
}

export interface UserOrganization {
  id: number;
  name: string;
  slug: string;
  roles: string[];
}

/** Full profile from GET /auth/me (org switcher, TPRM, roles) */
export interface AuthProfile {
  id: number;
  email: string;
  name: string | null;
  organizationId: number | null;
  organization: Organization | null;
  roles: string[];
  organizations: UserOrganization[];
  tprmAssignments: TprmAssignments;
}

export interface LoginResponse {
  user: User;
  organizations?: UserOrganization[];
  currentOrganization: Organization | null;
  roles: string[];
  tprmAssignments?: TprmAssignments;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  tprmAssignments?: TprmAssignments;
  accessToken: string;
  refreshToken: string;
}

// =============================================================================
// Framework Types
// =============================================================================
export interface Framework {
  id: number;
  code: string;
  name: string;
  description?: string;
  totalControlsCount: number;
  dateAdded: string;
  dateUpdated: string;
}

export interface OrganizationFramework {
  id: number;
  organizationId: number;
  frameworkId: number;
  framework: Framework;
  startedAt: string;
  ownerId?: number;
  owner?: User;
  managerId?: number;
  manager?: User;
  reAssessmentFrequency?: string;
  nextAssessmentDue?: string;
  completionProgress: number;
  totalControlsCount: number;
  totalPoliciesCount: number;
  totalProceduresCount: number;
  dateAdded: string;
  dateUpdated: string;
}

/** Activated frameworks for org (same as OrganizationFramework from /frameworks/activated) */
export type ActivatedFramework = OrganizationFramework;

// =============================================================================
// Control Types
// =============================================================================
export interface FrameworkControl {
  id: number;
  frameworkId: number;
  refCode: string;
  category?: string;
  subcategory?: string;
  name: string;
  description?: string;
  guidance?: string;
  parentControlId?: number;
  sortOrder: number;
  dateAdded: string;
  dateUpdated: string;
}

export interface FrameworkSubcontrol {
  id: number;
  frameworkControlId: number;
  refCode?: string;
  name: string;
  description?: string;
  guidance?: string;
  sortOrder: number;
  dateAdded: string;
  dateUpdated: string;
}

export interface OrganizationControlInstance {
  id: number;
  organizationFrameworkId: number;
  organizationFramework?: OrganizationFramework;
  frameworkControlId: number;
  frameworkControl: FrameworkControl;
  status: ControlInstanceStatus;
  isApplicable: boolean;
  guidance?: string;
  reviewNotes?: string;
  todo?: string;
  implementedPct: number;
  context?: string;
  ownerId?: number;
  owner?: User;
  operatorId?: number;
  operator?: User;
  aiAssessed: boolean;
  aiAssessmentResult: AIAssessmentResult;
  reassessmentDueDate?: string;
  updateDate?: string;
  dateAdded: string;
  dateUpdated: string;
  subcontrolInstances?: OrganizationSubcontrolInstance[];
}

/** Alias for controls API */
export type OrganizationControl = OrganizationControlInstance;

export interface OrganizationSubcontrolInstance {
  id: number;
  organizationControlInstanceId: number;
  organizationControlInstance?: OrganizationControlInstance;
  frameworkSubcontrolId: number;
  frameworkSubcontrol: FrameworkSubcontrol;
  status: ControlInstanceStatus;
  isApplicable: boolean;
  guidance?: string;
  reviewNotes?: string;
  implementedPct: number;
  context?: string;
  ownerId?: number;
  owner?: User;
  operatorId?: number;
  operator?: User;
  aiAssessed: boolean;
  aiAssessmentResult: AIAssessmentResult;
  updateDate?: string;
  dateAdded: string;
  dateUpdated: string;
  evidenceLinks?: ControlEvidenceLink[];
}

// =============================================================================
// Evidence Types
// =============================================================================
export interface Evidence {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  content?: string;
  collectedDate: string;
  ownerId?: number;
  owner?: User;
  dateAdded: string;
  dateUpdated: string;
  files?: EvidenceFile[];
}

export interface EvidenceFile {
  id: number;
  evidenceId: number;
  fileName: string;
  fileType?: string;
  s3Key: string;
  uploadedById?: number;
  uploadedBy?: User;
  dateAdded: string;
}

export interface ControlEvidenceLink {
  id: number;
  organizationSubcontrolInstanceId: number;
  evidenceId: number;
  evidence: Evidence;
  dateAdded: string;
}

export interface PolicyEvidenceLink {
  id: number;
  policyId: number;
  evidenceId: number;
  evidence: Evidence;
  dateAdded: string;
}

// =============================================================================
// Policy & Procedure Types
// =============================================================================
export interface Policy {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  ownerId?: number;
  owner?: User;
  reviewerId?: number;
  reviewer?: User;
  templateSource?: string;
  currentVersionId?: number;
  dateAdded: string;
  dateUpdated: string;
  versions?: PolicyVersion[];
  evidenceLinks?: PolicyEvidenceLink[];
}

export interface PolicyVersion {
  id: number;
  policyId: number;
  versionNumber: number;
  content?: string;
  s3Key?: string;
  changeNote?: string;
  createdById?: number;
  createdBy?: User;
  createdAt: string;
}

export interface Procedure {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  policyId?: number;
  policy?: Policy;
  ownerId?: number;
  owner?: User;
  reviewerId?: number;
  reviewer?: User;
  currentVersionId?: number;
  dateAdded: string;
  dateUpdated: string;
  versions?: ProcedureVersion[];
}

export interface ProcedureVersion {
  id: number;
  procedureId: number;
  versionNumber: number;
  content?: string;
  s3Key?: string;
  createdById?: number;
  createdBy?: User;
  createdAt: string;
}

export interface PolicyTemplate {
  id: number;
  organizationId?: number | null;
  frameworkId?: number;
  name: string;
  description?: string;
  content?: string;
  s3Key?: string;
  dateAdded: string;
  dateUpdated: string;
}

// =============================================================================
// Finding Types
// =============================================================================
export interface Finding {
  id: number;
  organizationId: number;
  organizationFrameworkId?: number;
  organizationFramework?: OrganizationFramework;
  organizationControlInstanceId?: number;
  organizationControlInstance?: OrganizationControlInstance;
  title: string;
  description?: string;
  status: FindingStatus;
  severity: FindingSeverity;
  dateAdded: string;
  dateUpdated: string;
}

// =============================================================================
// Note & Comment Types
// =============================================================================
export interface Note {
  id: number;
  organizationId: number;
  entityType: string;
  entityId: number;
  content: string;
  ownerId?: number;
  owner?: User;
  dateAdded: string;
  dateUpdated: string;
}

export interface ControlInstanceComment {
  id: number;
  organizationId: number;
  entityType: string;
  entityId: number;
  content: string;
  ownerId?: number;
  owner?: User;
  dateAdded: string;
  dateUpdated: string;
  mentions?: CommentMention[];
}

export interface CommentMention {
  id: number;
  commentId: number;
  userId: number;
  user: User;
  dateAdded: string;
}

// =============================================================================
// TPRM/Vendor Types
// =============================================================================
/** Alias for vendor API (TPRM vendor) */
export type Vendor = TprmVendor;

export interface TprmVendor {
  id: number;
  organizationId: number;
  name: string;
  email?: string;
  description?: string;
  industry?: string;
  status: VendorStatus;
  startDate?: string;
  expirationDate?: string;
  ownerId?: number;
  alertEnabled: boolean;
  dateAdded: string;
  dateUpdated: string;
  users?: TprmVendorUser[];
  questions?: TprmQuestion[];
  answers?: TprmAnswer[];
  evidences?: TprmVendorEvidence[];
  notes?: TprmVendorNote[];
}

export interface TprmVendorUser {
  id: number;
  tprmVendorId: number;
  userId: number;
  user: User;
  dateAdded: string;
}

export interface TprmQuestion {
  id: number;
  organizationId: number;
  tprmVendorId?: number;
  questionText: string;
  sortOrder: number;
  dateAdded: string;
  answers?: TprmAnswer[];
}

export interface TprmAnswer {
  id: number;
  tprmQuestionId: number;
  tprmQuestion?: TprmQuestion;
  tprmVendorId: number;
  answerText?: string;
  submittedAt: string;
  dateAdded: string;
}

export interface TprmVendorEvidence {
  id: number;
  tprmVendorId: number;
  evidenceId: number;
  evidence: Evidence;
  dateAdded: string;
}

export interface TprmVendorNote {
  id: number;
  tprmVendorId: number;
  userId: number;
  user: User;
  note: string;
  dateAdded: string;
}

export interface TprmVendorStatusHistory {
  id: number;
  tprmVendorId: number;
  status: string;
  changedById?: number;
  changedBy?: User;
  dateAdded: string;
}

// =============================================================================
// Auditor Types
// =============================================================================
export interface Auditor {
  id: number;
  name: string;
  email: string;
  experience?: string;
  certifications?: string;
  designation?: string;
  organisationName?: string;
  dateAdded: string;
  dateUpdated: string;
}

export interface AuditorAccessGrant {
  id: number;
  organizationId: number;
  auditorId: number;
  auditor: Auditor;
  organizationFrameworkId: number;
  organizationFramework: OrganizationFramework;
  fromDate: string;
  toDate: string;
  grantedById?: number;
  grantedBy?: User;
  dateAdded: string;
}

export interface AuditorReviewRemark {
  id: number;
  code: string;
  label: string;
}

export interface AuditorControlReview {
  id: number;
  auditorId: number;
  auditor: Auditor;
  organizationSubcontrolInstanceId: number;
  organizationSubcontrolInstance?: OrganizationSubcontrolInstance;
  status: AuditorReviewStatus;
  remarkId?: number;
  remark?: AuditorReviewRemark;
  notes?: string;
  dateAdded: string;
  dateUpdated: string;
}

export interface AuditorReport {
  id: number;
  auditorId: number;
  auditor: Auditor;
  organizationId: number;
  organizationFrameworkId: number;
  organizationFramework: OrganizationFramework;
  reportContent?: string;
  s3Key?: string;
  templateUsed?: string;
  eSignedAt?: string;
  dateAdded: string;
  dateUpdated: string;
}

/** GET /auditor/my-assignments: one org with its frameworks */
export interface AuditorAssignmentOrg {
  organizationId: number;
  organizationName: string;
  organizationSlug?: string;
  frameworks: Array<{
    organizationFrameworkId: number;
    frameworkId: number;
    frameworkName: string;
    frameworkCode?: string;
    fromDate: string;
    toDate: string;
  }>;
}

/** GET /auditor/assignments/:id - assignment detail */
export interface AuditorAssignmentDetail {
  organizationFrameworkId: number;
  organization: { id: number; name: string; slug?: string };
  framework: { id: number; name: string; code?: string };
  grantFromDate: string;
  grantToDate: string;
}

/** Paginated controls for auditor assignment */
export interface AuditorControlsResponse {
  data: OrganizationControlInstance[];
  pagination?: { page: number; limit: number; total: number };
}

// =============================================================================
// Compliance Checklist Types
// =============================================================================
export interface ComplianceChecklistItem {
  id: number;
  organizationFrameworkId: number;
  organizationFramework: OrganizationFramework;
  frameworkControlId: number;
  frameworkControl: FrameworkControl;
  status: ChecklistStatus;
  dateAdded: string;
  dateUpdated: string;
}

// =============================================================================
// Report Types
// =============================================================================
export interface Report {
  id: number;
  organizationId: number;
  organizationFrameworkId?: number;
  organizationFramework?: OrganizationFramework;
  reportType: string;
  content?: Record<string, any>;
  s3Key?: string;
  generatedById?: number;
  generatedBy?: User;
  dateAdded: string;
}

// =============================================================================
// Dashboard & Stats Types
// =============================================================================
/** Matches GET /dashboard/summary response */
export interface DashboardSummary {
  overview: {
    totalControls: number;
    completedControls: number;
    inProgressControls: number;
    notStartedControls: number;
    complianceScore: number;
    auditReadiness: number;
  };
  evidence: {
    pending: number;
    approved: number;
  };
  frameworks: DashboardSummaryFramework[];
  recentAudits: RecentAuditItem[];
}

export interface DashboardSummaryFramework {
  id: number;
  name: string;
  code: string;
  activatedAt: string;
}

export interface RecentAuditItem {
  id: number | string;
  title: string;
  status: string;
  scheduledDate: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  user?: string;
  userName?: string;
  timestamp: string;
  entityType?: string;
  entityId?: number;
}

export interface Task {
  id: number;
  title: string;
  type: string;
  dueDate?: string;
  priority: string;
  assignedTo?: string;
}

/** Matches GET /controls/stats response */
export interface ControlStats {
  total: number;
  draft: number;
  uploaded: number;
  submitted: number;
  reviewed: number;
  approved: number;
  applicable?: number;
  notApplicable?: number;
  /** Optional; backend may not return this */
  byFramework?: Array<{
    frameworkId: number;
    frameworkName: string;
    count: number;
    progress: number;
  }>;
}

export interface EvidenceStats {
  total: number;
  withFiles: number;
  withoutFiles: number;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}

// =============================================================================
// Filter & Query Types
// =============================================================================
export interface ControlFilters {
  search?: string;
  status?: ControlInstanceStatus;
  frameworkId?: number;
  priority?: string;
  ownerId?: number;
  operatorId?: number;
  aiAssessed?: boolean;
  page?: number;
  limit?: number;
}

export interface EvidenceFilters {
  search?: string;
  controlId?: number;
  policyId?: number;
  startDate?: string;
  endDate?: string;
  hasFiles?: boolean;
  page?: number;
  limit?: number;
}

export interface VendorFilters {
  search?: string;
  status?: VendorStatus;
  industry?: string;
  page?: number;
  limit?: number;
}

export interface FindingFilters {
  search?: string;
  status?: FindingStatus;
  severity?: FindingSeverity;
  frameworkId?: number;
  controlId?: number;
  page?: number;
  limit?: number;
}

// =============================================================================
// AI Assessment Types
// =============================================================================
export interface AssessmentReport {
  id: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  overallScore?: number;
  controlIds?: number[];
  provider?: string;
  results?: AssessmentResult[];
}

export interface AssessmentResult {
  controlId: number;
  controlName: string;
  result: AIAssessmentResult;
  confidence: number;
  reasoning?: string;
  suggestions?: string[];
}
