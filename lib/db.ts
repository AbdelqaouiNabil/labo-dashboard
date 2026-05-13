import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool =
  global._pgPool ??
  new Pool({
    host: process.env.PG_HOST!,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE!,
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    ssl: false,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export default pool;
