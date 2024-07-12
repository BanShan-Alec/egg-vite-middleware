import { loadEnv } from "vite";
import mergeWith from "lodash/mergeWith";

export const deepMerge = (
  target: Record<string, any>,
  source: Record<string, any>
) => {
  return mergeWith(target, source, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
};

export const getEnv = (
  mode: string,
  envDir: string,
  expendConfig?: Record<string, any>
) => {
  const env = loadEnv(mode, envDir, "");
  return deepMerge(env, expendConfig || {});
};
