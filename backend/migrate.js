const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

const migrate = async () => {
  try {
    const sqlPath = path.join(__dirname, '../backend/migrations/000001_init_schema.up.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`Migration file not found at: ${sqlPath}`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await db.query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
