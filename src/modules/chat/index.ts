import Elysia from "elysia";
import { authMiddleware } from "../../middleware/auth";

/**
 * 认证模块路由
 */
export const chatRoutes = new Elysia({ prefix: "/chat" }).use(authMiddleware);
