import type { UserRole } from '../types/api';

/**
 * Normalize role for comparison. Backend (ouditit) uses lowercase in constants/DB
 * (e.g. 'admin', 'ciso', 'security_team'); dashboard uses UPPER_SNAKE_CASE.
 * So we normalize to uppercase so both casings match.
 */
function toRole(role: UserRole | string | undefined): UserRole | undefined {
  if (role == null || role === '') return undefined;
  return String(role).toUpperCase().replace(/-/g, '_') as UserRole;
}

/** Roles that can create/edit users */
const USER_MANAGE_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

/** Roles that can approve policies */
const POLICY_APPROVE_ROLES: UserRole[] = ['SUPER_ADMIN', 'CISO'];

/** Roles that can create policies */
const POLICY_CREATE_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO', 'SECURITY_TEAM'];

/** Roles that can update control status */
const CONTROL_UPDATE_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO', 'SECURITY_TEAM', 'IT_TEAM'];

/** Roles that can change applicability (control/subcontrol) – org members/admins same as control update */
const APPLICABILITY_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO', 'SECURITY_TEAM', 'IT_TEAM'];

/** Roles that can assign controls */
const CONTROL_ASSIGN_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO', 'SECURITY_TEAM'];

/** Roles that can review evidence */
const EVIDENCE_REVIEW_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO', 'SECURITY_TEAM'];

/** Roles that can run AI assessment */
const AI_ASSESSMENT_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO', 'SECURITY_TEAM'];

/** Roles that can activate/deactivate/update frameworks (ADMIN, SUPER_ADMIN, CISO) */
const FRAMEWORK_MANAGE_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CISO'];

export function canManageFrameworks(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? FRAMEWORK_MANAGE_ROLES.includes(r) : false;
}

export function canManageUsers(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? USER_MANAGE_ROLES.includes(r) : false;
}

export function canApprovePolicies(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? POLICY_APPROVE_ROLES.includes(r) : false;
}

export function canCreatePolicies(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? POLICY_CREATE_ROLES.includes(r) : false;
}

export function canUpdateControlStatus(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? CONTROL_UPDATE_ROLES.includes(r) : false;
}

export function canChangeApplicability(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? APPLICABILITY_ROLES.includes(r) : false;
}

export function canAssignControls(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? CONTROL_ASSIGN_ROLES.includes(r) : false;
}

export function canReviewEvidence(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? EVIDENCE_REVIEW_ROLES.includes(r) : false;
}

export function canRunAIAssessment(role: UserRole | string | undefined): boolean {
  const r = toRole(role);
  return r ? AI_ASSESSMENT_ROLES.includes(r) : false;
}
