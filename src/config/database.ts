import { drizzle } from "drizzle-orm/postgres-js";
import pastgres from "postgres";

const url =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/velo";

/**
 * 初始化数据库连接
 */
const pg = pastgres(url, { max: 10 });

export const db = drizzle(pg);

/**
 * 初始化数据库，创建必要的表和索引
 */
export async function initDatabase() {
  // 启用 uuid 扩展（不存在则创建）
  await pg`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // users 表
  await pg`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      uuid UUID DEFAULT uuid_generate_v4() NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `;

  // refresh_tokens 表
  await pg`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      jti UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `;

  // projects 表
  await pg`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      uuid UUID DEFAULT uuid_generate_v4() NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      html TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
  `;

  // 构建索引
  await pg`CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id)`;
}
