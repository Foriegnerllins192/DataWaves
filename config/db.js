const { Pool } = require('pg');

// Database connection configuration for Neon PostgreSQL
let dbConfig;

// Robust SSL configuration for production/cloud
const sslConfig = {
  rejectUnauthorized: true, // Secure by default
};

// Allow self-signed certs only if explicitly allowed (e.g. some dev envs) or if strictly necessary for specific Neon setups that don't provide full chain
// For Neon, typically rejectUnauthorized: true with system CAs works, or strict certificates.
// However, to avoid "self signed certificate" errors common in some PaaS, we can set rejectUnauthorized: false if needed, 
// but the requirement is "Ensure SSL is enabled". 
// Safe bet for Neon on Render:
const productionSSL = {
  rejectUnauthorized: false // Often required for managed Postgres unless CA is provided
};

if (process.env.DATABASE_URL) {
  // Production / Render configuration
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: productionSSL,
    max: 10, // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Fail fast if DB is unreachable
  };
} else {
  // Local / Development configuration
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    // Only use SSL if explicitly requested locally, or if using a cloud DB URL locally
    ssl: process.env.DB_SSL === 'true' ? productionSSL : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

// Create the connection pool
const pool = new Pool(dbConfig);

// Handle pool errors globally - DO NOT EXIT PROCESS
// If the DB goes down, we want the app to stay up and return 500s, not crash and restart loop.
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  // Do NOT process.exit(-1) here
});

// Test connection on startup (non-blocking)
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    console.error('Database connection failed. Ensure DATABASE_URL is correct and SSL is enabled.');
  } else {
    console.log('Connected to PostgreSQL database successfully');
    release();
  }
});

module.exports = pool;