import { InlineConfig } from "vite";
import path from "path";

export interface IVitePluginConfig extends InlineConfig {
  dev?: boolean;
  /**
   * 默认值改写为 `process.env.NODE_ENV`，不再读取`--mode`参数
   * @default
   * process.env.NODE_ENV
   */
  mode?: string;
}

export default () => {
  return {
    vitePluginConfig: {
      dev: process.env.NODE_ENV === "development",
      mode: process.env.NODE_ENV,
      root: process.cwd(),
      configFile: path.resolve(process.cwd(), "./vite.config.ts"),
      server: { middlewareMode: true },
    } as IVitePluginConfig,
  };
};
