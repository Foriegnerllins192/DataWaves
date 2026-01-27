const db = require('./config/db');

async function removeValidityColumn() {
  try {
    console.log('🔍 Checking if validity_days column exists...');
    
    // Check if the column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'data_plans' 
      AND column_name = 'validity_days'
    `;
    
    const checkResult = await db.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ validity_days column found. Removing...');
      
      // Drop the column
      const dropQuery = 'ALTER TABLE data_plans DROP COLUMN validity_days';
      await db.query(dropQuery);
      
      console.log('🎉 Successfully removed validity_days column from data_plans table');
      
      // Verify removal
      const verifyQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'data_plans' 
        ORDER BY ordinal_position
      `;
      
      const verifyResult = await db.query(verifyQuery);
      console.log('\n📋 Current data_plans table structure:');
      verifyResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      
    } else {
      console.log('ℹ️  validity_days column does not exist in data_plans table');
    }
    
  } catch (error) {
    console.error('❌ Error removing validity column:', error.message);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the script
console.log('🚀 Starting validity removal process...\n');
removeValidityColumn();