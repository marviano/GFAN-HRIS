// Database diagnostic script
const mysql = require('mysql2/promise');

async function checkDatabase() {
    const connection = await mysql.createConnection({
        host: '182.253.188.170',
        user: 'dbadmin',
        password: 'Gfan2010!',
        database: 'gfan_hris',
        port: 3306
    });

    console.log('✓ Connected to database successfully\n');

    // Check all tables
    console.log('=== CHECKING TABLES ===');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`);
    tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
    });
    console.log('');

    // Check organizations table
    console.log('=== ORGANIZATIONS TABLE ===');
    const [orgs] = await connection.query('SELECT * FROM organizations');
    console.log(`Records: ${orgs.length}`);
    if (orgs.length > 0) {
        console.log(orgs);
    } else {
        console.log('⚠ WARNING: No organizations found!');
    }
    console.log('');

    // Check roles table
    console.log('=== ROLES TABLE ===');
    const [roles] = await connection.query('SELECT * FROM roles');
    console.log(`Records: ${roles.length}`);
    if (roles.length > 0) {
        console.log(roles);
    } else {
        console.log('⚠ WARNING: No roles found!');
    }
    console.log('');

    // Check users table
    console.log('=== USERS TABLE ===');
    const [users] = await connection.query('SELECT id, email, name, role_id, organization_id FROM users');
    console.log(`Records: ${users.length}`);
    if (users.length > 0) {
        console.log(users);
    } else {
        console.log('ℹ No users yet (expected for new setup)');
    }
    console.log('');

    // Check employees table
    console.log('=== EMPLOYEES TABLE ===');
    try {
        const [employees] = await connection.query('SELECT * FROM employees');
        console.log(`Records: ${employees.length}`);
    } catch (err) {
        console.log(`⚠ Error: ${err.message}`);
    }
    console.log('');

    // Check divisions table
    console.log('=== DIVISIONS TABLE ===');
    try {
        const [divisions] = await connection.query('SELECT * FROM divisions');
        console.log(`Records: ${divisions.length}`);
    } catch (err) {
        console.log(`⚠ Error: ${err.message}`);
    }
    console.log('');

    console.log('=== DIAGNOSIS ===');
    if (orgs.length === 0) {
        console.log('❌ ISSUE FOUND: No organizations in database');
        console.log('   Solution: Run initial-data.sql script');
    }
    if (roles.length === 0) {
        console.log('❌ ISSUE FOUND: No roles in database');
        console.log('   Solution: Run initial-data.sql script');
    }
    if (orgs.length > 0 && roles.length > 0) {
        console.log('✓ Database setup looks good!');
        console.log('  Organizations: ' + orgs.length);
        console.log('  Roles: ' + roles.length);
    }

    await connection.end();
}

checkDatabase().catch(err => {
    console.error('❌ Database Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
});
