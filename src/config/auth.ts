// 900 秒 = 15 分钟，用于 accessToken Cookie 默认 maxAge
export const ACCESS_COOKIE_MAX_AGE = Number(
  process.env.ACCESS_COOKIE_MAX_AGE_SEC ?? 900,
);
// 604800 秒 = 7 天，用于 refreshToken Cookie 默认 maxAge
export const REFRESH_COOKIE_MAX_AGE = Number(
  process.env.REFRESH_COOKIE_MAX_AGE_SEC ?? 604800,
);
// 604800000 毫秒 = 7 天，用于数据库 refresh_token 的过期时间
const REFRESH_EXPIRES_MS = Number(process.env.REFRESH_EXPIRES_MS ?? 604800000);

export function computeRefreshExpiresAt(now: number = Date.now()): Date {
  return new Date(now + REFRESH_EXPIRES_MS);
}
