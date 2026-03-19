const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Warm up connection on startup
pool.query('SELECT 1').catch(() => {});

// pg uses $1,$2 placeholders — wrap execute() to match mysql2's interface
// so all controllers work without changes
pool.execute = (sql, params = []) => {
  // Convert MySQL ? placeholders to PostgreSQL $1, $2, ...
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  return pool.query(pgSql, params).then(result => {
    // Mimic mysql2 interface: [rows, fields]
    // Also attach insertId from RETURNING clause if present
    const rows = result.rows;
    if (rows.length > 0 && rows[0].id !== undefined) {
      rows.insertId = rows[0].id;
    }
    return [rows, result.fields];
  });
};

module.exports = pool;
