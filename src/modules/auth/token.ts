import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../user/model";

/** refreshTokens 表 */
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  jti: uuid("jti").defaultRandom().notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export namespace RefreshTokenModel {
  export type RefreshToken = typeof refreshTokens.$inferSelect;
}
