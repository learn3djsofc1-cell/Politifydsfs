import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        zkid VARCHAR(8) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        public_key VARCHAR(255) NOT NULL,
        encrypted_private_key TEXT NOT NULL,
        network VARCHAR(50) NOT NULL DEFAULT 'solana',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`DROP INDEX IF EXISTS idx_wallets_user_id`);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_unique ON wallets(user_id)
    `);

    const healthCheck = await client.query('SELECT NOW() as time');
    console.log(`Database connected at ${healthCheck.rows[0].time}`);
    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
}

export default pool;
