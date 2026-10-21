const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "smart_hostel",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS id_card_url TEXT,
      ADD COLUMN IF NOT EXISTS id_card_filename TEXT,
      ADD COLUMN IF NOT EXISTS id_card_status VARCHAR(20) DEFAULT 'NOT_UPLOADED',
      ADD COLUMN IF NOT EXISTS id_card_rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS id_card_uploaded_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS id_card_verified_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS id_card_verified_by VARCHAR(100);
    `);
    console.log("Migration successful: id_card columns added to users table");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await pool.end();
  }
}

migrate();
