import "server-only";

type Row = Record<string, unknown>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    pincode TEXT NOT NULL DEFAULT '',
    mobile TEXT NOT NULL,
    product TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    rate NUMERIC(12, 2) NOT NULL CHECK (rate >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

async function connect(): Promise<QueryFn> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    return (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Connect a Postgres database (e.g. Neon) to this project.",
    );
  }

  // Local development: an embedded Postgres stored in .data/
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdir } = await import("node:fs/promises");
  await mkdir("./.data", { recursive: true });
  const db = new PGlite("./.data/pglite");
  return async (text, params = []) => (await db.query<Row>(text, params)).rows;
}

async function init(): Promise<QueryFn> {
  const run = await connect();
  for (const statement of SCHEMA) await run(statement);
  return run;
}

// Reuse one connection (and one schema check) per server instance / dev reload.
const globalForDb = globalThis as unknown as { __ledgerDb?: Promise<QueryFn> };

export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!globalForDb.__ledgerDb) {
    globalForDb.__ledgerDb = init().catch((error) => {
      globalForDb.__ledgerDb = undefined;
      throw error;
    });
  }
  const run = await globalForDb.__ledgerDb;
  return (await run(text, params)) as T[];
}
