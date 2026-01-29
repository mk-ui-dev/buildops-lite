export const PROJECT_ROLES = ['INVESTOR', 'INSPECTOR', 'GC', 'SUB', 'PROCUREMENT'] as const;

export const TASK_STATUSES = ['NEW', 'PLANNED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE', 'CANCELLED'] as const;

export const INSPECTION_STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as const;

export const ISSUE_STATUSES = ['OPEN', 'ASSIGNED', 'FIXED', 'VERIFIED', 'CLOSED'] as const;

export const DELIVERY_STATUSES = ['REQUESTED', 'ORDERED', 'IN_TRANSIT', 'DELIVERED', 'ACCEPTED', 'REJECTED'] as const;

export const DECISION_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IMPLEMENTED'] as const;

export const PRIORITY_LEVELS = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  TRIVIAL: 5,
} as const;

export const ATTACHMENT_KINDS = ['BEFORE', 'AFTER', 'PROOF', 'GENERAL'] as const;

export const BLOCK_TYPES = ['DELIVERY', 'DECISION', 'DEPENDENCY', 'MANUAL'] as const;

export const BLOCK_SCOPES = ['START', 'DONE'] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const JWT_ACCESS_TOKEN_EXPIRY = '15m';
export const JWT_REFRESH_TOKEN_EXPIRY = '7d';

export const BCRYPT_ROUNDS = 10;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
