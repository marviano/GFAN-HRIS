// Insert initial data into database
const mysql = require('mysql2/promise');

async function insertInitialData() {
    const connection = await mysql.createConnection({
        host: '182.253.188.170',
        user: 'dbadmin',
        password: 'Gfan2010!',
        database: 'gfan_hris',
        port: 3306
    });

    console.log('✓ Connected to database\n');

    try {
        // Disable foreign key checks temporarily
        console.log('Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Insert default organization
        console.log('Inserting default organization...');
        await connection.query(`
      INSERT INTO organizations (id, name, slug, owner_user_id, subscription_status, subscription_plan)
      VALUES (1, 'Default Organization', 'default', 1, 'active', 'basic')
      ON DUPLICATE KEY UPDATE name = 'Default Organization'
    `);
        console.log('✓ Organization inserted');

        // Insert default roles
        console.log('Inserting default roles...');
        await connection.query(`
      INSERT INTO roles (id, name, description, organization_id)
      VALUES (1, 'User', 'Default user role', 1)
      ON DUPLICATE KEY UPDATE name = 'User'
    `);
        console.log('✓ User role inserted');

        await connection.query(`
      INSERT INTO roles (id, name, description, organization_id)
      VALUES (2, 'Admin', 'Administrator role', 1)
      ON DUPLICATE KEY UPDATE name = 'Admin'
    `);
        console.log('✓ Admin role inserted');

        // Re-enable foreign key checks
        console.log('Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n=== VERIFICATION ===');
        const [orgs] = await connection.query('SELECT * FROM organizations');
        console.log(`Organizations: ${orgs.length} record(s)`);
        console.log(orgs);

        const [roles] = await connection.query('SELECT * FROM roles');
        console.log(`\nRoles: ${roles.length} record(s)`);
        console.log(roles);

        console.log('\n✅ Initial data setup complete!');
        console.log('You can now register users in the application.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

insertInitialData().catch(err => {
    console.error('Failed to insert initial data:', err);
    process.exit(1);
});
