import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medivanta';
  console.log(`Connecting to database: ${dbUrl.replace(/:[^:@]*@/, ':****@')}...`);

  // Parse connection URL to extract target database name
  const urlObj = new URL(dbUrl);
  const targetDbName = urlObj.pathname.replace('/', '') || 'medivanta';

  // First connect to default 'postgres' database to ensure target DB exists
  urlObj.pathname = '/postgres';
  const rootClient = new pg.Client({ connectionString: urlObj.toString() });

  try {
    await rootClient.connect();
    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`Creating database "${targetDbName}"...`);
      await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`✓ Database "${targetDbName}" created.`);
    } else {
      console.log(`✓ Database "${targetDbName}" already exists.`);
    }
  } catch (err) {
    console.warn(`Note: Could not check/create root database (might be hosted like Neon/Supabase):`, err.message);
  } finally {
    await rootClient.end().catch(() => {});
  }

  // Now connect to target database and run schema + seed
  const targetClient = new pg.Client({ connectionString: dbUrl });
  try {
    await targetClient.connect();
    console.log(`✓ Connected to "${targetDbName}".`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Applying database schema (schema.sql)...');
    await targetClient.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    console.log('Seeding initial hospital & demo data (seed.sql)...');
    await targetClient.query(seedSql);
    console.log('✓ Initial seed data populated successfully.');

    console.log('\n======================================================');
    console.log('  🏥 MEDIVANTA DATABASE INITIALIZATION COMPLETE!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    console.error('\nIf your postgres password differs from "postgres", please edit server/.env with your password.');
  } finally {
    await targetClient.end().catch(() => {});
  }
};

setupDatabase();
