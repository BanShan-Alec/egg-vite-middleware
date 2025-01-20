# egg-vite-middleware

Use vite server middleware mode as eggjs plugin, Fit for vite >= 5
[Plugin Development - Egg](https://www.eggjs.org/zh-CN/advanced/plugin)

## Usage

```ts
// {app_root}/config/plugin.ts
export default {
  vitePlugin: {
    enable: true,
    package: "egg-vite-middleware",
  },
};
```

## Configuration
support Configuration TypeScript prompt

```ts
// {app_root}/config/config.default.ts
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
            open: true, // `true` will auto open default Browser
            port: 6019,
            hostname: '0.0.0.0',
        },
    };
  };
};
```


## Template Rendering

This plugin exposes a Service with `renderTpl` method for injecting necessary runtime and handling template rendering.

The logic refers to [Server-Side Rendering | Vite](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)

```ts
export default class HTMLController extends Controller {
  async html() {
    console.log("route html", this.ctx.req.url);
    if (process.env.NODE_ENV === "production") {
      // Why? Using ctx.render can cache templates to improve performance, while vite.renderTpl uses fs to read html without caching
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
