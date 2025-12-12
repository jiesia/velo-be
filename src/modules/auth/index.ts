import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { SuccessResponse } from "../../common/response";
import {
  ACCESS_COOKIE_MAX_AGE,
  computeRefreshExpiresAt,
  REFRESH_COOKIE_MAX_AGE,
} from "../../config/auth";
import { db } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { AuthModel } from "./model";
import { AuthService } from "./service";
import { refreshTokens } from "./token";

/**
 * 认证模块路由
 */
export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authMiddleware)
  // 注册
  .post(
    "/sign-up",
    async ({
      body,
      accessJwt,
      refreshJwt,
      cookie: { accessToken, refreshToken },
    }) => {
      // 创建用户
      const user = await AuthService.signUp(body);

      // 签发 Token 并设置到 Cookie
      const accessTokenValue = await accessJwt.sign({
        id: user.id,
        email: user.email,
      });
      const expiresAt = computeRefreshExpiresAt();
      const [rtRow] = await db
        .insert(refreshTokens)
        .values({ userId: user.id, expiresAt })
        .returning();
      const refreshTokenValue = await refreshJwt.sign({
        id: user.id,
        jti: (rtRow.jti as unknown as string) ?? "",
      });

      // 设置新的 access_token 和 refresh_token 到 Cookie
      accessToken.value = accessTokenValue;
      accessToken.httpOnly = true;
      accessToken.secure = true;
      accessToken.sameSite = "strict";
      accessToken.path = "/";
      accessToken.maxAge = ACCESS_COOKIE_MAX_AGE;

      refreshToken.value = refreshTokenValue;
      refreshToken.httpOnly = true;
      refreshToken.secure = true;
      refreshToken.sameSite = "strict";
      refreshToken.path = "/";
      refreshToken.maxAge = REFRESH_COOKIE_MAX_AGE;

      // 返回用户信息
      return new SuccessResponse({
        user,
      });
    },
    {
      body: AuthModel.signUpBody,
    },
  )
  // 登录
  .post(
    "/sign-in",
    async ({
      body,
      accessJwt,
      refreshJwt,
      cookie: { accessToken, refreshToken },
    }) => {
      // 校验邮箱、密码, 获取用户信息
      const user = await AuthService.verify(body);

      // 签发 Token 并设置到 Cookie
      const accessTokenValue = await accessJwt.sign({
        id: user.id,
        email: user.email,
      });
      const expiresAt = computeRefreshExpiresAt();
      const [rtRow] = await db
        .insert(refreshTokens)
        .values({ userId: user.id, expiresAt })
        .returning();
      const refreshTokenValue = await refreshJwt.sign({
        id: user.id,
        jti: (rtRow.jti as unknown as string) ?? "",
      });

      // 设置新的 access_token 和 refresh_token 到 Cookie
      accessToken.value = accessTokenValue;
      accessToken.httpOnly = true;
      accessToken.secure = true;
      accessToken.sameSite = "strict";
      accessToken.path = "/";
      accessToken.maxAge = ACCESS_COOKIE_MAX_AGE;

      refreshToken.value = refreshTokenValue;
      refreshToken.httpOnly = true;
      refreshToken.secure = true;
      refreshToken.sameSite = "strict";
      refreshToken.path = "/";
      refreshToken.maxAge = REFRESH_COOKIE_MAX_AGE;

      // 返回用户信息
      return new SuccessResponse({
        user,
      });
    },
    {
      body: AuthModel.signInBody,
    },
  )
  // 退出登录
  .post(
    "/sign-out",
    async ({ cookie: { accessToken, refreshToken }, refreshJwt }) => {
      // 撤销刷新令牌
      const refreshTokenValue = refreshToken.value as string;
      if (refreshTokenValue) {
        const payload = await refreshJwt.verify(refreshTokenValue);
        if (payload && payload?.jti) {
          await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.jti, payload.jti));
        }
      }

      // 清空 Cookie
      accessToken.remove();
      refreshToken.remove();

      return new SuccessResponse();
    },
  );
