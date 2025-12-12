import { jwt } from "@elysiajs/jwt";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { ErrorCode, ErrorResponse } from "../common/response";
import {
  ACCESS_COOKIE_MAX_AGE,
  computeRefreshExpiresAt,
  REFRESH_COOKIE_MAX_AGE,
} from "../config/auth";
import { db } from "../config/database";
import { refreshTokens } from "../modules/auth/token";
import { type UserModel, users } from "../modules/user/model";

/**
 * 认证中间件
 */
export const authMiddleware = new Elysia({ name: "authMiddleware" })
  .state("user", null as UserModel.User | null)
  // accessTtoken
  .use(
    jwt({
      name: "accessJwt",
      secret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
      exp: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      schema: t.Object({
        id: t.Number(),
        email: t.String(),
      }),
    }),
  )
  // refreshToken
  .use(
    jwt({
      name: "refreshJwt",
      secret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
      exp: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      schema: t.Object({
        id: t.Number(),
        jti: t.String(),
      }),
    }),
  )
  .guard({
    as: "global",
    beforeHandle: async ({
      store,
      request,
      accessJwt,
      refreshJwt,
      cookie: { accessToken, refreshToken },
    }) => {
      // 尝试从 Cookie 读取 access_token 并校验
      const accessTokenValue = accessToken.value as string;
      if (accessTokenValue) {
        const payload = await accessJwt.verify(accessTokenValue);

        if (payload) {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.id))
            .limit(1);

          if (user.length) {
            store.user = user[0];
          }
        }
      }

      // 如果校验失败但存在 refresh_token 时, 此时 accessToken 过期, 进行无感刷新（旋转 refresh）
      const refreshTokenValue = refreshToken.value as string;
      if (!store.user && refreshTokenValue) {
        const rtPayload = await refreshJwt.verify(refreshTokenValue);

        if (rtPayload) {
          const [rtRow] = await db
            .select()
            .from(refreshTokens)
            .where(
              and(
                eq(refreshTokens.jti, rtPayload.jti),
                eq(refreshTokens.userId, rtPayload.id),
              ),
            )
            .limit(1);

          // refreshToken 校验通过, 且未被撤销, 且未过期
          if (rtRow && !rtRow.revokedAt && rtRow.expiresAt > new Date()) {
            const [userRow] = await db
              .select()
              .from(users)
              .where(eq(users.id, rtPayload.id))
              .limit(1);

            if (userRow) {
              store.user = userRow;

              // 旋转 refresh：插入新行 + 标记旧行撤销
              const expiresAt = computeRefreshExpiresAt();
              const [newRt] = await db
                .insert(refreshTokens)
                .values({ userId: rtPayload.id, expiresAt })
                .returning();
              await db
                .update(refreshTokens)
                .set({ revokedAt: new Date() })
                .where(eq(refreshTokens.id, rtRow.id));

              // 生成新的 access_token 和 refresh_token
              const newAccessToken = await accessJwt.sign({
                id: store.user.id,
                email: store.user.email,
              });
              const newRefreshToken = await refreshJwt.sign({
                id: store.user.id,
                jti: (newRt.jti as unknown as string) ?? "",
              });

              // 设置新的 access_token 和 refresh_token 到 Cookie
              accessToken.value = newAccessToken;
              accessToken.httpOnly = true;
              accessToken.secure = true;
              accessToken.sameSite = "strict";
              accessToken.path = "/";
              accessToken.maxAge = ACCESS_COOKIE_MAX_AGE;

              refreshToken.value = newRefreshToken;
              refreshToken.httpOnly = true;
              refreshToken.secure = true;
              refreshToken.sameSite = "strict";
              refreshToken.path = "/";
              refreshToken.maxAge = REFRESH_COOKIE_MAX_AGE;
            }
          }
        }
      }

      // 非 /api/auth 路由都需要登录才能访问, 否则返回 401 错误
      const isAuthRoute = request.url.startsWith("/api/auth");
      if (!isAuthRoute && !store.user) {
        return new ErrorResponse(ErrorCode.UNAUTHORIZED, "Unauthorized", 401);
      }
    },
  });
