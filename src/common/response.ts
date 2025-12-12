/** 统一接口返回格式 */
class BaseResponse<T = undefined> {
  /** http 状态码 */
  status: number;
  /** 响应码, 成功 code: 0; 失败 code: 具体错误码 */
  code: 0 | ErrorCode;
  /** 响应信息, 成功 message: "success"; 失败 message: 具体失败原因 */
  message: string;
  /** 响应数据 */
  data?: T;

  constructor(status = 200, code = 0, message = "", data?: T) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  toResponse() {
    return Response.json(
      {
        code: this.code,
        message: this.message,
        data: this.data,
      },
      {
        status: this.status,
      },
    );
  }
}

/** 自定义业务异常 */
export class ErrorResponse extends BaseResponse<undefined> implements Error {
  name = "error";

  constructor(code: ErrorCode, message = "", status = 200) {
    super(status, code, message);
  }
}

/** 成功响应 */
export class SuccessResponse<T = undefined> extends BaseResponse<T> {
  constructor(data?: T) {
    super(200, 0, "success", data);
  }
}

/** 错误码枚举 */
export enum ErrorCode {
  /** 未知错误 */
  UNKNOWN = 1000,
  /** 校验错误 */
  VALIDATION = 1001,
  /** 资源不存在 */
  NOT_FOUND = 1002,
  /** 内部服务器错误 */
  INTERNAL_SERVER_ERROR = 1003,
  /** 未授权 */
  UNAUTHORIZED = 1004,
  /** 邮箱已存在 */
  EMAIL_ALREADY_EXISTS = 1005,
  /** 用户不存在 */
  USER_NOT_FOUND = 1006,
  /** 密码错误 */
  PASSWORD_NOT_MATCH = 1007,
  /** 项目不存在 */
  PROJECT_NOT_FOUND = 1008,
  /** 无权限 */
  FORBIDDEN = 1009,
}
