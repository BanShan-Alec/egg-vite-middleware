import { createServer as createViteServer } from "vite";
import c2k from "koa2-connect";
import { Application } from "egg";
import { name } from "../package.json";

export async function initVitePlugin(app: Application) {
  const viteConfig = app.config.vitePluginConfig;
  const logger = app.logger;
  try {
    if (!viteConfig) {
      throw new Error("vite config not found");
    }
    if (viteConfig?.dev === false) {
      logger.info(`[${name}] initVitePlugin`, "vite serve false");
    } else {
      logger.info(`[${name}] initVitePlugin`, "vite serve init");
      app.viteDevServer = await createViteServer(viteConfig);
      // c2k: Convert koa middleware to express middleware https://juejin.cn/post/6949699600760438820
      app.use(c2k(app.viteDevServer.middlewares));
    }
  } catch (e) {
    logger.error(`[${name}] initVitePlugin`, e);
  }
}
