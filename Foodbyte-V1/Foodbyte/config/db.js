const mysql = require('mysql2/promise');

let db;

async function connectDB() {
  try {
    db = await mysql.createConnection({
      host:     'localhost',
      user:     'root',
      password: 'khan1811',
      database: 'foodbyte'
    });
    console.log('✅ Connected to MySQL!');
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error('DB not connected yet');
  return db;
}

module.exports = { connectDB, getDB };