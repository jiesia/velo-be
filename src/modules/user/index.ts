import Elysia from "elysia";
import { SuccessResponse } from "../../common/response";
import { authMiddleware } from "../../middleware/auth";

/**
 * 用户模块路由
 */
export const userRoutes = new Elysia({ prefix: "/user" })
  .use(authMiddleware)
  // 获取用户信息
  .get("/", async ({ store }) => {
    // 返回用户信息
    return new SuccessResponse({
      user: store.user,
    });
  });
