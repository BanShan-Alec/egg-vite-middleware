import { Application, IBoot } from "egg";
import { getEnv } from "./lib/defineEnv";
import { initVitePlugin } from "./lib/vitePlugin";
import { name } from "./package.json";

export default class App implements IBoot {
  // https://eggjs.github.io/zh/guide/lifecycle.html
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  configDidLoad(): void {
    this.app.logger.info(
      `[${name}] vitePluginConfig`,
      this.app.config.vitePluginConfig
    );

    const { mode = "prod", root, envDir } = this.app.config.vitePluginConfig;
    const _envDir = envDir || root || process.cwd();

    this.app.envConfig = getEnv(mode, _envDir, this.app.config.remoteConfig);
  }

  async didLoad() {
    console.time(`[${name}] Vite DevServer Elapse`);
    await initVitePlugin(this.app);
    console.timeEnd(`[${name}] Vite DevServer Elapse`);
    // 发送消息给agent
    this.app.messenger.sendToAgent("vite-server-ready", {});
  }
}
