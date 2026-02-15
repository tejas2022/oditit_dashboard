import type { UserRole } from '../types/api';

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
  if (!role) return false;
  const normalized = String(role).toUpperCase() as UserRole;
  return FRAMEWORK_MANAGE_ROLES.includes(normalized);
}

export function canManageUsers(role: UserRole | undefined): boolean {
  return role ? USER_MANAGE_ROLES.includes(role) : false;
}

export function canApprovePolicies(role: UserRole | undefined): boolean {
  return role ? POLICY_APPROVE_ROLES.includes(role) : false;
}

export function canCreatePolicies(role: UserRole | undefined): boolean {
  return role ? POLICY_CREATE_ROLES.includes(role) : false;
}

export function canUpdateControlStatus(role: UserRole | undefined): boolean {
  return role ? CONTROL_UPDATE_ROLES.includes(role) : false;
}

export function canChangeApplicability(role: UserRole | undefined): boolean {
  return role ? APPLICABILITY_ROLES.includes(role) : false;
}

export function canAssignControls(role: UserRole | undefined): boolean {
  return role ? CONTROL_ASSIGN_ROLES.includes(role) : false;
}

export function canReviewEvidence(role: UserRole | undefined): boolean {
  return role ? EVIDENCE_REVIEW_ROLES.includes(role) : false;
}

export function canRunAIAssessment(role: UserRole | undefined): boolean {
  return role ? AI_ASSESSMENT_ROLES.includes(role) : false;
}
