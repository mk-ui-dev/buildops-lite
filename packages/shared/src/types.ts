// Domain types

export type ProjectRole = 'INVESTOR' | 'INSPECTOR' | 'GC' | 'SUB' | 'PROCUREMENT';

export type TaskStatus = 'NEW' | 'PLANNED' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'DONE' | 'CANCELLED';

export type InspectionStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export type IssueStatus = 'OPEN' | 'ASSIGNED' | 'FIXED' | 'VERIFIED' | 'CLOSED';

export type DeliveryStatus = 'REQUESTED' | 'ORDERED' | 'IN_TRANSIT' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED';

export type DecisionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';

export type EntityType =
  | 'TASK'
  | 'INSPECTION'
  | 'ISSUE'
  | 'DELIVERY'
  | 'DECISION'
  | 'LOCATION'
  | 'COMMENT'
  | 'FILE'
  | 'PROJECT';

export type ChecklistItemType = 'BOOL' | 'TEXT' | 'NUMBER' | 'SELECT' | 'PHOTO';

export type NotificationChannel = 'IN_APP' | 'EMAIL';

export type AttachmentKind = 'BEFORE' | 'AFTER' | 'PROOF' | 'GENERAL';

export type BlockType = 'DELIVERY' | 'DECISION' | 'DEPENDENCY' | 'MANUAL';

export type BlockScope = 'START' | 'DONE';

// Entity interfaces

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  isActive: boolean;
  membershipStatus: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  code: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
}

export interface Task {
  id: string;
  projectId: string;
  locationId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  plannedDate: Date | null;
  dueDate: Date | null;
  requiresInspection: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
}

export interface TaskBlock {
  id: string;
  taskId: string;
  blockType: BlockType;
  scope: BlockScope;
  refEntityType: EntityType | null;
  refEntityId: string | null;
  message: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface Inspection {
  id: string;
  projectId: string;
  taskId: string | null;
  locationId: string | null;
  checklistRunId: string;
  status: InspectionStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  decisionAt: Date | null;
  decisionReason: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
}

export interface Issue {
  id: string;
  projectId: string;
  taskId: string | null;
  inspectionId: string | null;
  locationId: string | null;
  title: string;
  description: string;
  status: IssueStatus;
  priority: number;
  assigneeId: string | null;
  dueDate: Date | null;
  overdue: boolean;
  fixedAt: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
}

export interface Delivery {
  id: string;
  projectId: string;
  taskId: string | null;
  locationId: string | null;
  supplierName: string;
  status: DeliveryStatus;
  expectedDate: Date | null;
  deliveredAt: Date | null;
  blocksWork: boolean;
  statusReason: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
}

export interface Decision {
  id: string;
  projectId: string;
  relatedType: EntityType | null;
  relatedId: string | null;
  subject: string;
  problem: string;
  status: DecisionStatus;
  blocksWork: boolean;
  decisionOwnerId: string | null;
  dueDate: Date | null;
  approvalReason: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt: Date | null;
}

// API Request/Response types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  tenantId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}
