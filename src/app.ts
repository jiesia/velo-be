import { logger } from "@bogeychan/elysia-logger";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { ErrorCode, ErrorResponse } from "./common/response";
import { authMiddleware } from "./middleware/auth";
import { authRoutes } from "./modules/auth";
import { chatRoutes } from "./modules/chat";
import { projectRoutes } from "./modules/project";
import { userRoutes } from "./modules/user";

/**
 * 实例化 Elysia 实例
 */
export function createApp() {
  return (
    new Elysia({ prefix: "/api" })
      // 错误处理
      .error({ ErrorResponse })
      .onError(({ code, error }) => {
        switch (code) {
          case "UNKNOWN":
            return new ErrorResponse(ErrorCode.UNKNOWN, error.message, 500);
          case "NOT_FOUND":
            return new ErrorResponse(
              ErrorCode.NOT_FOUND,
              error.message,
              error.status,
            );
          case "VALIDATION":
            return new ErrorResponse(
              ErrorCode.VALIDATION,
              error.valueError?.message,
              error.status,
            );
          case "INTERNAL_SERVER_ERROR":
            return new ErrorResponse(
              ErrorCode.INTERNAL_SERVER_ERROR,
              error.message,
              500,
            );
          default:
            return error;
        }
      })
      // 开启 OpenAPI 文档
      .use(openapi())
      // 中间件
      .use(cors())
      .use(logger())
      .use(authMiddleware)
      // 路由
      .use(authRoutes)
      .use(userRoutes)
      .use(projectRoutes)
      .use(chatRoutes)
  );
}
