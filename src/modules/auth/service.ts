import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { ErrorCode, ErrorResponse } from "../../common/response";
import { db } from "../../config/database";
import { users } from "../user/model";
import type { AuthModel } from "./model";

/**
 * 认证模块服务
 */
export abstract class AuthService {
  /**
   * 注册
   */
  static async signUp({ email, password }: AuthModel.signUpBody) {
    const existed = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // 如果邮箱已存在, 则抛出错误
    if (existed.length) {
      throw new ErrorResponse(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        "Email already exists",
      );
    }

    // 加密密码
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const inserted = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
      })
      .returning();
    return inserted[0];
  }

  /**
   * 登录
   */
  static async verify({ email, password }: AuthModel.signInBody) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // 如果用户不存在, 则抛出错误
    if (!user.length) {
      throw new ErrorResponse(ErrorCode.USER_NOT_FOUND, "User not found");
    }

    // 校验密码是否正确
    const ok = await bcrypt.compare(password, user[0].passwordHash);
    if (!ok) {
      throw new ErrorResponse(
        ErrorCode.PASSWORD_NOT_MATCH,
        "Password not match",
      );
    }

    // 邮箱、密码正确, 返回用户信息
    return user[0];
  }
}
