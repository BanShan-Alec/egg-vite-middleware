import { ViteDevServer } from "vite";

export default {
  /** 读取.env 的环境变量 */
  envConfig: {} as Record<string, any>,
  viteDevServer: null as ViteDevServer | null,
};
