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
        username VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        network_mode VARCHAR(20) NOT NULL DEFAULT 'devnet',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'username'
        ) THEN
          ALTER TABLE users ADD COLUMN username VARCHAR(20);
          UPDATE users SET username = LOWER(zkid) WHERE username IS NULL;
          ALTER TABLE users ALTER COLUMN username SET NOT NULL;
          CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'network_mode'
        ) THEN
          ALTER TABLE users ADD COLUMN network_mode VARCHAR(20) NOT NULL DEFAULT 'devnet';
        END IF;
      END $$;
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT conversations_canonical_order CHECK (user1_id < user2_id),
        UNIQUE(user1_id, user2_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(20, 9) NOT NULL,
        token VARCHAR(10) NOT NULL CHECK (token IN ('SOL', 'USDC')),
        tx_signature VARCHAR(255),
        network VARCHAR(20) NOT NULL CHECK (network IN ('devnet', 'mainnet-beta')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'payment')),
        transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS testnet_balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sol_balance DECIMAL(20, 9) NOT NULL DEFAULT 10,
        usdc_balance DECIMAL(20, 9) NOT NULL DEFAULT 1000,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT idx_testnet_balances_user UNIQUE (user_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('visa', 'mastercard')),
        card_number_last4 VARCHAR(4) NOT NULL,
        cardholder_name VARCHAR(50) NOT NULL,
        expiry_month INTEGER NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
        expiry_year INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'pending_deletion')),
        previous_status VARCHAR(20) CHECK (previous_status IN ('active', 'frozen')),
        deletion_requested_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT idx_cards_user_type UNIQUE (user_id, card_type)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id)
    `);

    const healthCheck = await client.query('SELECT NOW() as time');
    console.log(`Database connected at ${healthCheck.rows[0].time}`);
    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
}

export default pool;
