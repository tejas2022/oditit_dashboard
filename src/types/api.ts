/** Backend API response wrapper */
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
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CISO'
  | 'SECURITY_TEAM'
  | 'IT_TEAM'
  | 'EMPLOYEE'
  | 'AUDITOR';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  industry?: string;
  gstin?: string;
  status?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  organization: Organization;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardSummary {
  overview: {
    totalControls: number;
    completedControls: number;
    inProgressControls: number;
    notStartedControls?: number;
    complianceScore: number;
    auditReadiness: number;
  };
  evidence: { pending: number; approved: number };
  frameworks: Array<{ id: string; name: string; type: string; activatedAt: string }>;
  recentAudits: Array<{ id: string; title: string; status: string; scheduledDate: string }>;
}

export type ControlStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_APPLICABLE';
export type EvidenceStatus = 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type PolicyStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface Framework {
  id: string;
  name: string;
  type: string;
  version?: string;
  description?: string;
  _count?: { controls?: number; organizations?: number };
  controls?: Array<{ id: string; code: string; name: string }>;
}

/** Organisation's activated framework record */
export interface ActivatedFramework {
  id: string;
  organizationId: string;
  frameworkId: string;
  activatedAt: string;
  targetDate?: string;
  isActive?: boolean;
  framework: Framework;
}

export interface Control {
  id: string;
  code: string;
  name: string;
  description?: string;
  frameworkId: string;
  framework?: Framework;
}

export interface OrganizationControl {
  id: string;
  controlId: string;
  organizationId: string;
  status: ControlStatus;
  completionDate?: string;
  nextReviewDate?: string;
  implementationContext?: string;
  control?: Control;
  evidence?: Evidence[];
  assignments?: ControlAssignment[];
}

export interface ControlAssignment {
  id: string;
  userId: string;
  dueDate?: string;
  user?: User;
}

export interface Evidence {
  id: string;
  organizationControlId: string;
  title: string;
  description?: string;
  status: EvidenceStatus;
  fileUrl?: string;
  validUntil?: string;
  reviewNotes?: string;
}

export interface Policy {
  id: string;
  title: string;
  content?: string;
  version?: string;
  status: PolicyStatus;
  createdAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  gstin?: string;
  website?: string;
  riskLevel?: string;
}

export interface AssessmentReport {
  id: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  overallScore?: number;
  controlIds?: string[];
  provider?: string;
}
