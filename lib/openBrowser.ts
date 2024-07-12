import { EggApplication } from "egg";
import { name } from "../package.json";
import open from "open";

export function openBrowser(app: EggApplication) {
  const logger = app.logger;
  const clusterConfig = app.config.cluster.listen;

  logger.info(`[${name}] openBrowserByConfig`, clusterConfig);
  if (!clusterConfig.open) return;
  // 这里没直接使用clusterConfig.hostname，是因为0.0.0.0在windows下是无法打开的
  const url = `http://localhost:${clusterConfig.port}`;
  open(url);
}
