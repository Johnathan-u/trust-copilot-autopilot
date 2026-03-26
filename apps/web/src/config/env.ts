import type { Environment } from "@/lib/constants";

interface AppConfig {
  env: Environment;
  apiUrl: string;
  appName: string;
  featureFlags: {
    shadowScoring: boolean;
    clickhouseEvents: boolean;
    mlflowRegistry: boolean;
    lightgbmRanking: boolean;
  };
}

function getEnv(): Environment {
  const e = process.env.NEXT_PUBLIC_APP_ENV || "dev";
  if (e === "prod" || e === "cert") return e;
  return "dev";
}

export const appConfig: AppConfig = {
  env: getEnv(),
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  appName: "Trust Copilot",
  featureFlags: {
    shadowScoring: process.env.NEXT_PUBLIC_FF_SHADOW === "true",
    clickhouseEvents: process.env.NEXT_PUBLIC_FF_CLICKHOUSE === "true",
    mlflowRegistry: process.env.NEXT_PUBLIC_FF_MLFLOW === "true",
    lightgbmRanking: process.env.NEXT_PUBLIC_FF_LIGHTGBM === "true",
  },
};
