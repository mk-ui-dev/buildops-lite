import * as argon2 from 'argon2';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://buildops:buildops@localhost:5432/buildops',
});

export async function runDemoSeed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('Seeding demo data...');

    // Hash password for all demo users
    const demoPassword = await argon2.hash('Demo1234!', {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    // Create demo tenant
    const tenantRes = await client.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
      ['Acme Construction', 'acme']
    );
    const tenantId = tenantRes.rows[0].id;

    // Create demo users
    const users = [
      { email: 'admin@acme.com', name: 'Admin User', role: null },
      { email: 'gc@acme.com', name: 'General Contractor', role: 'GC' },
      { email: 'inspector@acme.com', name: 'QA Inspector', role: 'INSPECTOR' },
      { email: 'sub@acme.com', name: 'Subcontractor', role: 'SUB' },
      { email: 'investor@acme.com', name: 'Investor', role: 'INVESTOR' },
      { email: 'procurement@acme.com', name: 'Procurement Manager', role: 'PROCUREMENT' },
    ];

    const userIds: Record<string, string> = {};

    for (const user of users) {
      const userRes = await client.query(
        `INSERT INTO users (tenant_id, email, name, password_hash, is_active, membership_status)
         VALUES ($1, $2, $3, $4, TRUE, 'ACTIVE') RETURNING id`,
        [tenantId, user.email, user.name, demoPassword]
      );
      userIds[user.email] = userRes.rows[0].id;

      // Set first user as instance admin
      if (user.email === 'admin@acme.com') {
        await client.query(
          `INSERT INTO instance_admins (user_id) VALUES ($1)`,
          [userRes.rows[0].id]
        );
      }

      // Create default notification settings
      await client.query(
        `INSERT INTO user_notification_settings (user_id, in_app_enabled, email_enabled, digest_enabled)
         VALUES ($1, TRUE, TRUE, TRUE)`,
        [userRes.rows[0].id]
      );
    }

    // Create demo project
    const projectRes = await client.query(
      `INSERT INTO projects (tenant_id, name, code, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $4) RETURNING id`,
      [tenantId, 'Office Building Construction', 'OBC-2026', userIds['gc@acme.com']]
    );
    const projectId = projectRes.rows[0].id;

    // Add project members
    for (const user of users) {
      if (user.role) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role, is_active)
           VALUES ($1, $2, $3, TRUE)`,
          [projectId, userIds[user.email], user.role]
        );
      }
    }

    // Create locations (building hierarchy)
    const floorRes = await client.query(
      `INSERT INTO locations (project_id, parent_id, name, path, created_by, updated_by)
       VALUES ($1, NULL, $2, $3, $4, $4) RETURNING id`,
      [projectId, 'Ground Floor', '/ground-floor', userIds['gc@acme.com']]
    );
    const groundFloorId = floorRes.rows[0].id;

    await client.query(
      `INSERT INTO locations (project_id, parent_id, name, path, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $5)`,
      [projectId, groundFloorId, 'Lobby', '/ground-floor/lobby', userIds['gc@acme.com']]
    );

    // Create demo checklist template
    const templateRes = await client.query(
      `INSERT INTO checklist_templates (tenant_id, name, discipline, version, is_active, created_by)
       VALUES ($1, $2, $3, $4, TRUE, $5) RETURNING id`,
      [tenantId, 'Electrical Installation Inspection', 'Electrical', 1, userIds['gc@acme.com']]
    );
    const templateId = templateRes.rows[0].id;

    // Add checklist items
    await client.query(
      `INSERT INTO checklist_template_items (template_id, label, item_type, is_required, position, requires_photo)
       VALUES
       ($1, 'All conduits properly secured', 'BOOL', TRUE, 1, TRUE),
       ($1, 'Grounding connections verified', 'BOOL', TRUE, 2, TRUE),
       ($1, 'Number of defects found', 'NUMBER', FALSE, 3, FALSE),
       ($1, 'Inspector notes', 'TEXT', FALSE, 4, FALSE)`,
      [templateId]
    );

    // Create demo task
    const taskRes = await client.query(
      `INSERT INTO tasks (project_id, location_id, title, description, status, priority, planned_date, requires_inspection, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $8) RETURNING id`,
      [
        projectId,
        groundFloorId,
        'Install electrical wiring in lobby',
        'Complete electrical wiring installation as per approved plans',
        'PLANNED',
        2,
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        userIds['gc@acme.com'],
      ]
    );
    const taskId = taskRes.rows[0].id;

    // Assign task to SUB
    await client.query(
      `INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)`,
      [taskId, userIds['sub@acme.com']]
    );

    // Create demo delivery that blocks the task
    const deliveryRes = await client.query(
      `INSERT INTO deliveries (project_id, task_id, location_id, supplier_name, status, expected_date, blocks_work, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $7) RETURNING id`,
      [
        projectId,
        taskId,
        groundFloorId,
        'ElectroSupply Co.',
        'ORDERED',
        new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day from now
        userIds['procurement@acme.com'],
      ]
    );
    const deliveryId = deliveryRes.rows[0].id;

    // Add delivery items
    await client.query(
      `INSERT INTO delivery_items (delivery_id, name, quantity, unit)
       VALUES ($1, 'Copper wire 2.5mm', 500, 'meters'), ($1, 'Junction boxes', 25, 'pcs')`,
      [deliveryId]
    );

    // Create task block for delivery
    await client.query(
      `INSERT INTO task_blocks (task_id, block_type, scope, ref_entity_type, ref_entity_id, message, is_active, created_by)
       VALUES ($1, 'DELIVERY', 'START', 'DELIVERY', $2, 'Waiting for electrical materials delivery', TRUE, $3)`,
      [taskId, deliveryId, userIds['gc@acme.com']]
    );

    // Create demo decision
    await client.query(
      `INSERT INTO decisions (project_id, related_type, related_id, subject, problem, status, blocks_work, decision_owner_id, due_date, created_by, updated_by)
       VALUES ($1, 'TASK', $2, 'Wiring route approval', 'Need to decide between ceiling vs wall routing for main cables', 'DRAFT', FALSE, $3, $4, $3, $3)`,
      [
        projectId,
        taskId,
        userIds['gc@acme.com'],
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ]
    );

    // Create demo tags
    await client.query(
      `INSERT INTO tags (tenant_id, name, color) VALUES ($1, 'Urgent', '#EF4444'), ($1, 'Safety', '#F59E0B')`,
      [tenantId]
    );

    await client.query('COMMIT');
    console.log('Demo seed completed successfully!');
    console.log('\nDemo credentials:');
    console.log('  Admin: admin@acme.com / Demo1234!');
    console.log('  GC: gc@acme.com / Demo1234!');
    console.log('  Inspector: inspector@acme.com / Demo1234!');
    console.log('  Subcontractor: sub@acme.com / Demo1234!');
    console.log('  Investor: investor@acme.com / Demo1234!');
    console.log('  Procurement: procurement@acme.com / Demo1234!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Demo seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runDemoSeed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
