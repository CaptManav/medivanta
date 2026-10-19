import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  process.exit(-1);
});

/**
 * Execute a parameterized query.
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transactions.
 * @returns {Promise<pg.PoolClient>}
 */
export const getClient = () => pool.connect();

export default pool;
