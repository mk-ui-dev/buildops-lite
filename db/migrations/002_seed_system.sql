-- System seed data: permissions, instance settings, automation rules

-- Insert single instance_settings row
INSERT INTO instance_settings (id, public_json, secrets_encrypted, secrets_key_id, updated_at)
VALUES (
  1,
  '{"branding":{"companyName":"SiteFlow","logoUrl":null},"features":{"maxTenantsPerInstance":100,"maxProjectsPerTenant":50}}',
  '\x'::bytea,
  'v1',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PERMISSIONS (Comprehensive RBAC)
-- ============================================================================

INSERT INTO permissions (code, description) VALUES
-- Instance admin
('instance.settings.read', 'View instance settings'),
('instance.settings.write', 'Modify instance settings'),
('instance.settings.test_smtp', 'Test SMTP configuration'),
('instance.settings.test_s3', 'Test S3 configuration'),

-- Tenant admin
('tenant.users.read', 'View tenant users'),
('tenant.users.write', 'Manage tenant users'),
('tenant.users.invite', 'Invite new users to tenant'),
('tenant.roles.read', 'View tenant roles'),
('tenant.roles.write', 'Manage tenant roles'),
('tenant.projects.create', 'Create new projects'),
('tenant.templates.read', 'View checklist templates'),
('tenant.templates.write', 'Manage checklist templates'),
('tenant.tags.read', 'View tags'),
('tenant.tags.write', 'Manage tags'),

-- Project management
('project.read', 'View project details'),
('project.write', 'Modify project details'),
('project.delete', 'Delete project'),
('project.members.read', 'View project members'),
('project.members.write', 'Manage project members'),

-- Locations
('location.read', 'View locations'),
('location.write', 'Manage locations'),

-- Tasks
('task.read', 'View tasks'),
('task.write', 'Create and edit tasks'),
('task.delete', 'Delete tasks'),
('task.plan', 'Plan tasks (set dates, assignees)'),
('task.start', 'Start tasks'),
('task.complete', 'Complete tasks'),
('task.dependencies.write', 'Manage task dependencies'),

-- Inspections
('inspection.read', 'View inspections'),
('inspection.write', 'Create and edit inspections'),
('inspection.submit', 'Submit inspections for review'),
('inspection.review', 'Review inspections'),
('inspection.approve', 'Approve inspections'),
('inspection.reject', 'Reject inspections'),

-- Issues
('issue.read', 'View issues'),
('issue.write', 'Create and edit issues'),
('issue.assign', 'Assign issues'),
('issue.fix', 'Mark issues as fixed'),
('issue.verify', 'Verify fixed issues'),
('issue.close', 'Close issues'),

-- Deliveries
('delivery.read', 'View deliveries'),
('delivery.write', 'Manage deliveries'),
('delivery.accept', 'Accept deliveries'),
('delivery.reject', 'Reject deliveries'),

-- Decisions
('decision.read', 'View decisions'),
('decision.write', 'Create and edit decisions'),
('decision.approve', 'Approve decisions'),
('decision.implement', 'Mark decisions as implemented'),

-- Files
('file.upload', 'Upload files'),
('file.read', 'View and download files'),
('file.delete', 'Delete files'),

-- Comments
('comment.read', 'View comments'),
('comment.write', 'Create comments'),

-- Activity
('activity.read', 'View activity log')

ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PROJECT ROLE PERMISSIONS (Default Mappings)
-- ============================================================================

-- INVESTOR: Read-only + create decisions
INSERT INTO project_role_permissions (role, permission_id)
SELECT 'INVESTOR', id FROM permissions WHERE code IN (
  'project.read',
  'project.members.read',
  'location.read',
  'task.read',
  'inspection.read',
  'issue.read',
  'delivery.read',
  'decision.read',
  'decision.write',
  'file.read',
  'comment.read',
  'comment.write',
  'activity.read'
)
ON CONFLICT DO NOTHING;

-- INSPECTOR: Approve inspections, verify issues
INSERT INTO project_role_permissions (role, permission_id)
SELECT 'INSPECTOR', id FROM permissions WHERE code IN (
  'project.read',
  'project.members.read',
  'location.read',
  'task.read',
  'inspection.read',
  'inspection.write',
  'inspection.submit',
  'inspection.review',
  'inspection.approve',
  'inspection.reject',
  'issue.read',
  'issue.write',
  'issue.assign',
  'issue.verify',
  'issue.close',
  'delivery.read',
  'decision.read',
  'file.upload',
  'file.read',
  'comment.read',
  'comment.write',
  'activity.read'
)
ON CONFLICT DO NOTHING;

-- GC (General Contractor): Full project control
INSERT INTO project_role_permissions (role, permission_id)
SELECT 'GC', id FROM permissions WHERE code LIKE 'project.%'
  OR code LIKE 'location.%'
  OR code LIKE 'task.%'
  OR code LIKE 'inspection.%'
  OR code LIKE 'issue.%'
  OR code LIKE 'delivery.%'
  OR code LIKE 'decision.%'
  OR code LIKE 'file.%'
  OR code LIKE 'comment.%'
  OR code LIKE 'activity.%'
ON CONFLICT DO NOTHING;

-- SUB (Subcontractor): Limited to assigned tasks
INSERT INTO project_role_permissions (role, permission_id)
SELECT 'SUB', id FROM permissions WHERE code IN (
  'task.read',
  'task.start',
  'task.complete',
  'inspection.read',
  'inspection.write',
  'inspection.submit',
  'issue.read',
  'issue.fix',
  'delivery.read',
  'decision.read',
  'file.upload',
  'file.read',
  'comment.read',
  'comment.write',
  'activity.read'
)
ON CONFLICT DO NOTHING;

-- PROCUREMENT: Manage deliveries
INSERT INTO project_role_permissions (role, permission_id)
SELECT 'PROCUREMENT', id FROM permissions WHERE code IN (
  'project.read',
  'location.read',
  'task.read',
  'delivery.read',
  'delivery.write',
  'delivery.accept',
  'delivery.reject',
  'file.upload',
  'file.read',
  'comment.read',
  'comment.write',
  'activity.read'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEFAULT AUTOMATION RULES (Instance-level)
-- ============================================================================

INSERT INTO automation_rules (scope, scope_id, rule_type, config, is_active) VALUES
(
  'INSTANCE',
  NULL,
  'REMINDER',
  '{
    "d_minus": [2, 0],
    "entity_types": ["ISSUE", "DECISION", "INSPECTION", "DELIVERY", "TASK"]
  }',
  TRUE
),
(
  'INSTANCE',
  NULL,
  'ESCALATION',
  '{
    "issue_overdue_notify_roles": ["GC", "INSPECTOR"],
    "inspection_review_hours": 48
  }',
  TRUE
),
(
  'INSTANCE',
  NULL,
  'DIGEST',
  '{
    "include": ["today_tasks", "pending_approvals", "overdue_issues", "expected_deliveries"]
  }',
  TRUE
)
ON CONFLICT DO NOTHING;
