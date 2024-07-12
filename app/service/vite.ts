import { Service } from "egg";
import { name } from "../../package.json";
import path from "path";
import fs from "fs";

export default class ViteService extends Service {
  async renderTpl(
    transformTemplate?: (code: string) => string,
    _templatePath?: string
  ) {
    const { ctx, logger, app } = this;
    const url = ctx.req.url;
    const config = app.config.vitePluginConfig;
    const templatePath =
      _templatePath || path.join(config.root || process.cwd(), "index.html");

    logger.info(`[${name}] renderTpl`, url);
    try {
      // 1. 读取 index.html
      let template = await fs.promises.readFile(templatePath, {
        encoding: "utf-8",
      });
      if (!template) throw new Error("template is empty!" + templatePath);

      // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
      //    同时也会从 Vite 插件应用 HTML 转换。
      //    例如：@vitejs/plugin-react-refresh 中的 global preambles
      if (app.viteDevServer && url)
        template = await app.viteDevServer.transformIndexHtml(url, template);

      // 5. 注入渲染后的应用程序 HTML 到模板中。
      const html = transformTemplate?.(template);

      // 6. 返回渲染后的 HTML。
      ctx.status = 200;
      ctx.set("Content-Type", "text/html");
      ctx.body = html;
    } catch (error: any) {
      // 如果捕获到了一个错误，让 Vite 来修复该堆栈，这样它就可以映射回
      // 你的实际源码中。
      app.viteDevServer?.ssrFixStacktrace(error);
      logger.error(`[${name}] renderTpl error`, error.message);
      ctx.status = 500;
      ctx.body = error.message;
    }
  }
}
