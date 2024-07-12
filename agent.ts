import { Agent, IBoot } from "egg";
import { openBrowser } from "./lib/openBrowser";
import { name } from "./package.json";

export default class Ag implements IBoot {
  private readonly agent: Agent;
  private readonly logger: Agent["logger"];

  constructor(agent: Agent) {
    this.agent = agent;
    this.logger = agent.logger;
  }

  configDidLoad() {
    // 使用once监听事件，避免egg热更新时多次打开浏览器
    this.agent.messenger.once("vite-server-ready", () => {
      this.logger.info(`[${name}]`, "vite server did ready");
      openBrowser(this.agent);
    });
  }
}
