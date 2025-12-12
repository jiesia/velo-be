import { pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * 用户表
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * 用户模型
 */
export namespace UserModel {
  export type User = typeof users.$inferSelect;
}
