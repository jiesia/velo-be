import Elysia, { t } from "elysia";
import {
  ErrorCode,
  ErrorResponse,
  SuccessResponse,
} from "../../common/response";
import { authMiddleware } from "../../middleware/auth";
import { ProjectService } from "./service";

/**
 * 用户模块路由
 */
export const projectRoutes = new Elysia({ prefix: "/project" })
  .use(authMiddleware)
  // 获取项目列表
  .get("/", async ({ store }) => {
    const projects = await ProjectService.listMine(store.user!.id);
    return new SuccessResponse({
      projects,
    });
  })
  // 创建项目
  .post(
    "/",
    async ({ store, body }) => {
      const project = await ProjectService.create(store.user!.id, body.name);

      return new SuccessResponse({
        project,
      });
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 1,
          maxLength: 20,
        }),
      }),
    },
  )
  // 获取单个项目详情
  .get(
    "/:id",
    async ({ store, params }) => {
      const projectId = Number(params.id);
      const project = await ProjectService.getById(projectId);

      if (project.ownerId !== store.user!.id) {
        throw new ErrorResponse(
          ErrorCode.FORBIDDEN,
          "You do not have permission to access this project",
        );
      }

      return new SuccessResponse({
        project,
      });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  // 更新项目
  .put(
    "/:id",
    async ({ store, params, body }) => {
      const projectId = Number(params.id);

      await ProjectService.update(store.user!.id, projectId, body.name);

      return new SuccessResponse();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({
          minLength: 1,
          maxLength: 20,
        }),
      }),
    },
  )
  // 删除项目
  .delete(
    "/:id",
    async ({ store, params }) => {
      const projectId = Number(params.id);
      await ProjectService.remove(store.user!.id, projectId);

      return new SuccessResponse();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
