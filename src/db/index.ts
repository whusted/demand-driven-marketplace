import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const client = postgres(process.env.DATABASE_URL!);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// For backward compatibility — modules import { db }
// This will throw at module-load time if DATABASE_URL is not set,
// but only when actually accessed at runtime
export const db = new Proxy(
  {} as PostgresJsDatabase<typeof schema>,
  {
    get(_target, prop: string | symbol) {
      const instance = getDb();
      const value = instance[prop as keyof typeof instance];
      if (typeof value === "function") {
        return value.bind(instance);
      }
      return value;
    },
  },
);
