# egg-vite-middleware

use ViteServer middleware mode as eggjs plugin
[插件开发 - Egg](https://www.eggjs.org/zh-CN/advanced/plugin)

## 配置

通过 `config/plugin.ts` 配置启动 vite 插件:

```ts
export default {
  vitePlugin: {
    enable: true,
    package: "@banshan-alec/egg-vite-middleware",
  },
};
```

在 `config/config.${env}.ts` 配置基础配置：

```ts
export default (appInfo: EggAppInfo) => {
  return {
    vitePluginConfig: {
      dev: process.env.NODE_ENV === "development",
      envModeKey: "NODE_ENV",
      root: path.resolve(appInfo.baseDir, ".."),
      configFile: path.resolve(appInfo.baseDir, "../vite.config.ts"),
    },
    cluster = {
        listen: {
            open: true, // 设置open: true 可以自动打开浏览器
            port: 6019,
            hostname: '0.0.0.0',
        },
    };
  };
};
```

## 读取.env 逻辑

本插件会自动读取.env 文件，并写入到`this.app.envConfig`

不同于 Vite 官方默认的读取.env 逻辑 [Env Variables and Modes | Vite](https://vitejs.dev/guide/env-and-mode#node-env-and-modes)

读取.env 的 Mode 默认逻辑，依赖于`process.env.NODE_ENV`，当然你也可以自定义

```ts
export default (appInfo: EggAppInfo) => {
  return {
    vitePluginConfig: {
      mode: process.env["EGG_SERVER_ENV"],
    },
  };
};
```

## 模板渲染

本插件暴露一个 Service，`renderTpl` 用于注入必要的运行时，和处理模板渲染

逻辑参考 [Server-Side Rendering | Vite](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)

```ts
export default class HTMLController extends Controller {
  async html() {
    console.log("路由html", this.ctx.req.url);
    if (process.env.NODE_ENV === "production") {
      // Why? 使用ctx.render可以缓存模板，提高性能，vite.renderTpl使用的是fs读取html，不会缓存
      await this.ctx.render(
        "index.html",
        { appInfo: "xxx" },
        {
          viewEngine: "nunjucks",
        }
      );
    } else {
      await this.ctx.service.vite.renderTpl((code) => {
        return html.replace(
          "{{ appInfo }}",
          `<script>Object.defineProperty(window,'MyEnv',{value:Object.freeze(${JSON.stringify(
            { appInfo: "xxx" }
          )}),writable: false});</script>`
        );
      });
    }
  }
}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="cache-control"
      content="no-cache, no-store, must-revalidate"
    />
    <meta http-equiv="expires" content="0" />
    <title>%VITE_APP_NAME%</title>
    {{ appInfo }}
    <style></style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```
