const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function createAdminUser() {
  console.log('🔧 Creating admin user directly...');
  
  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Admin credentials
    const adminEmail = 'admin@datawaves.com';
    const adminPassword = 'DataWaves2026!';
    const adminName = 'DataWaves Admin';
    const adminPhone = '+233208494123';

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user exists
    console.log('🔍 Checking for existing admin user...');
    const existingUser = await client.query('SELECT id, email, role FROM users WHERE email = $1', [adminEmail]);
    
    if (existingUser.rows.length > 0) {
      console.log('👤 Admin user exists, updating...');
      await client.query(
        'UPDATE users SET password = $1, full_name = $2, phone = $3, role = $4, updated_at = NOW() WHERE email = $5',
        [hashedPassword, adminName, adminPhone, 'admin', adminEmail]
      );
      console.log('✅ Admin user updated successfully!');
    } else {
      console.log('👤 Creating new admin user...');
      await client.query(
        'INSERT INTO users (full_name, email, password, phone, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [adminName, adminEmail, hashedPassword, adminPhone, 'admin']
      );
      console.log('✅ Admin user created successfully!');
    }

    // Verify the admin user
    console.log('🔍 Verifying admin user...');
    const verifyUser = await client.query('SELECT id, full_name, email, role FROM users WHERE email = $1', [adminEmail]);
    
    if (verifyUser.rows.length > 0) {
      const user = verifyUser.rows[0];
      console.log('✅ Admin user verified:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    }

    client.release();

    console.log('\n📋 Admin Login Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n🌐 Login URL:');
    console.log('http://localhost:3003/login.html');
    console.log('\n🔧 Admin Dashboard:');
    console.log('http://localhost:3003/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdminUser();