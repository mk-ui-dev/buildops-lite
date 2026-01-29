import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  projectRole: z.enum(['INVESTOR', 'INSPECTOR', 'GC', 'SUB', 'PROCUREMENT']).optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().default(''),
  locationId: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  plannedDate: z.string().date().optional(),
  dueDate: z.string().date().optional(),
  requiresInspection: z.boolean().default(false),
  assigneeIds: z.array(z.string().uuid()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

export const planTaskSchema = z.object({
  plannedDate: z.string().date(),
  assigneeIds: z.array(z.string().uuid()).min(1),
});

export const addDependencySchema = z.object({
  blockerTaskId: z.string().uuid(),
});

// Inspection schemas
export const createInspectionSchema = z.object({
  taskId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  templateId: z.string().uuid(),
});

export const fillChecklistAnswerSchema = z.object({
  itemId: z.string().uuid(),
  valueBool: z.boolean().optional(),
  valueText: z.string().optional(),
  valueNumber: z.number().optional(),
  valueSelect: z.string().optional(),
});

export const approveInspectionSchema = z.object({
  approvalReason: z.string().optional(),
});

export const rejectInspectionSchema = z.object({
  decisionReason: z.string().min(1),
  issues: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        priority: z.number().int().min(1).max(5).default(3),
        dueDate: z.string().date().optional(),
      })
    )
    .default([]),
});

// Issue schemas
export const createIssueSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().default(''),
  taskId: z.string().uuid().optional(),
  inspectionId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().date().optional(),
});

export const assignIssueSchema = z.object({
  assigneeId: z.string().uuid(),
  dueDate: z.string().date(),
});

export const fixIssueSchema = z.object({
  comment: z.string().optional(),
});

export const verifyIssueSchema = z.object({
  verified: z.boolean(),
});

// Delivery schemas
export const createDeliverySchema = z.object({
  supplierName: z.string().min(1),
  taskId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  expectedDate: z.string().date().optional(),
  blocksWork: z.boolean().default(false),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .min(1),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'ORDERED', 'IN_TRANSIT', 'DELIVERED', 'ACCEPTED', 'REJECTED']),
  statusReason: z.string().optional(),
});

export const acceptDeliverySchema = z.object({
  reason: z.string().optional(),
});

export const rejectDeliverySchema = z.object({
  reason: z.string().min(1),
});

// Decision schemas
export const createDecisionSchema = z.object({
  relatedType: z.enum(['TASK', 'INSPECTION', 'ISSUE', 'DELIVERY', 'DECISION', 'LOCATION', 'COMMENT', 'FILE', 'PROJECT']).optional(),
  relatedId: z.string().uuid().optional(),
  subject: z.string().min(1),
  problem: z.string().min(1),
  blocksWork: z.boolean().default(false),
  decisionOwnerId: z.string().uuid().optional(),
  dueDate: z.string().date().optional(),
  options: z
    .array(
      z.object({
        optionText: z.string().min(1),
      })
    )
    .default([]),
  approverIds: z.array(z.string().uuid()).default([]),
});

export const castApprovalSchema = z.object({
  approved: z.boolean(),
  comment: z.string().optional(),
});

// File schemas
export const presignUploadSchema = z.object({
  entityType: z.enum(['TASK', 'INSPECTION', 'ISSUE', 'DELIVERY', 'DECISION', 'LOCATION', 'COMMENT', 'FILE', 'PROJECT']),
  entityId: z.string().uuid(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  kind: z.enum(['BEFORE', 'AFTER', 'PROOF', 'GENERAL']).default('GENERAL'),
  meta: z.record(z.unknown()).default({}),
});

export const confirmUploadSchema = z.object({
  fileId: z.string().uuid(),
  uploadSuccess: z.boolean(),
});

// Comment schemas
export const createCommentSchema = z.object({
  entityType: z.enum(['TASK', 'INSPECTION', 'ISSUE', 'DELIVERY', 'DECISION', 'LOCATION', 'COMMENT', 'FILE', 'PROJECT']),
  entityId: z.string().uuid(),
  body: z.string().min(1),
});

// Instance settings schemas
export const updateInstanceSettingsSchema = z.object({
  branding: z
    .object({
      companyName: z.string().optional(),
      logoUrl: z.string().url().optional(),
    })
    .optional(),
  smtp: z
    .object({
      host: z.string().optional(),
      port: z.number().int().positive().optional(),
      secure: z.boolean().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      fromEmail: z.string().email().optional(),
    })
    .optional(),
  s3: z
    .object({
      endpoint: z.string().optional(),
      region: z.string().optional(),
      bucket: z.string().optional(),
      accessKeyId: z.string().optional(),
      secretAccessKey: z.string().optional(),
    })
    .optional(),
});
