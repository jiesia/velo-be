import { and, eq } from "drizzle-orm";
import { ErrorCode, ErrorResponse } from "../../common/response";
import { db } from "../../config/database";
import { projects } from "./model";

/**
 * 项目服务
 */
export abstract class ProjectService {
  /**
   * 获取用户拥有的所有项目
   */
  static async listMine(ownerId: number) {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, ownerId));
  }

  /**
   * 创建项目
   */
  static async create(ownerId: number, name: string) {
    const [project] = await db
      .insert(projects)
      .values({ name, ownerId, html: "" })
      .returning();

    return project;
  }

  /**
   * 获取单个项目详情
   */
  static async getById(id: number) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    // 项目不存在
    if (!project) {
      throw new ErrorResponse(ErrorCode.PROJECT_NOT_FOUND, "Project not found");
    }

    return project;
  }

  /**
   * 更新项目
   */
  static async update(ownerId: number, id: number, name: string) {
    const [project] = await db
      .update(projects)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
      .returning();

    // 项目不存在
    if (!project) {
      throw new ErrorResponse(
        ErrorCode.PROJECT_NOT_FOUND,
        "Project not found or no permission",
      );
    }

    return project;
  }

  /**
   * 删除项目
   */
  static async remove(ownerId: number, id: number) {
    const [project] = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
      .returning();

    // 项目不存在
    if (!project) {
      throw new ErrorResponse(
        ErrorCode.PROJECT_NOT_FOUND,
        "Project not found or no permission",
      );
    }

    return project;
  }
}
