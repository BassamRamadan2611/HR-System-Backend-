const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // set true if using Azure
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    let pool = await sql.connect(config);
    console.log("✅ Connected to SQL Server:", config.database);
    return pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
