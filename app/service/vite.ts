import { Service } from "egg";
import { name } from "../../package.json";
import path from "path";
import fs from "fs";

export default class ViteService extends Service {
  /**
   * PS: `renderTpl` is recommended only use in development mode. Please use "egg-view-xxx" for production.
   *
   * Because the renderTpl method without a caching mechanism, it might have performance issues.
   *
   * @param [transformTemplate]
   * @param [_templatePath]
   */
  async renderTpl(
    transformTemplate?: (code: string) => string,
    _templatePath?: string
  ) {
    const { ctx, logger, app } = this;
    const url = ctx.req.url;
    const config = app.config.vitePluginConfig;
    const templatePath =
      _templatePath || path.join(config.root || process.cwd(), "index.html");

    if (process.env.NODE_ENV === "production") {
      logger.warn(
        `[${name}] renderTpl is recommended only use in development mode. Please use "egg-view-xxx" for production.`
      );
    }
    logger.info(`[${name}] renderTpl`, url);
    try {
      let template = await fs.promises.readFile(templatePath, {
        encoding: "utf-8",
      });
      if (!template) throw new Error("template is empty!" + templatePath);

      if (app.viteDevServer && url)
        template = await app.viteDevServer.transformIndexHtml(url, template);

      const html = transformTemplate?.(template);

      ctx.status = 200;
      ctx.set("Content-Type", "text/html");
      ctx.body = html;
    } catch (error: any) {
      app.viteDevServer?.ssrFixStacktrace(error);
      logger.error(`[${name}] renderTpl error`, error.message);
      ctx.status = 500;
      ctx.body = error.message;
    }
  }
}
