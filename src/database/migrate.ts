import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from 'kysely';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run migrations');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool,
  }),
});

const migrationFolder = path.join(__dirname, 'migrations');

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  }),
});

async function migrate(): Promise<void> {
  const direction = process.argv[2];

  if (direction === 'down') {
    const result = await migrator.migrateDown();

    if (result.error) {
      console.error('Migration rollback failed');
      console.error(result.error);
      process.exitCode = 1;
      return;
    }

    result.results?.forEach((migration) => {
      console.log(
        `${migration.status}: ${migration.migrationName}`,
      );
    });

    return;
  }

  const result = await migrator.migrateToLatest();

  result.results?.forEach((migration) => {
    console.log(
      `${migration.status}: ${migration.migrationName}`,
    );
  });

  if (result.error) {
    console.error('Migration failed');
    console.error(result.error);
    process.exitCode = 1;
  }
}

migrate()
  .catch((error) => {
    console.error('Migration process failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });