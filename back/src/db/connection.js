import "dotenv/config";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("Nenurodytas DATABASE_URL aplinkos kintamasis.");
}

export const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
});

export async function testConnection() {
  await sql`SELECT 1`;
}

