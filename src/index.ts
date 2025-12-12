import { createApp } from "./app";
import { initDatabase } from "./config/database";

// 创建应用实例
const app = createApp();

// 连接数据库
try {
  await initDatabase();
} catch (error) {
  console.error("数据库连接失败:", error);
  process.exit(1);
}

// 启动服务
app.listen({ port: 3000, hostname: "0.0.0.0" });

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
