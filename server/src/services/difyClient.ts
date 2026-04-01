import axios from "axios";

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("`") && trimmed.endsWith("`"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return normalizeEnvValue(value);
}

export function getDifyConfig() {
  const apiKey = requiredEnv("DIFY_API_KEY");
  const appApiKey = process.env.DIFY_APP_API_KEY ? normalizeEnvValue(process.env.DIFY_APP_API_KEY) : apiKey;
  const workflowApiKey = process.env.DIFY_WORKFLOW_API_KEY ? normalizeEnvValue(process.env.DIFY_WORKFLOW_API_KEY) : appApiKey;
  const datasetId = requiredEnv("DIFY_DATASET_ID");
  const baseURL = process.env.DIFY_BASE_URL
    ? normalizeEnvValue(process.env.DIFY_BASE_URL)
    : "https://api.dify.ai/v1";
  return { apiKey, appApiKey, workflowApiKey, datasetId, baseURL };
}

export function createDifyHttpClient(useAppKey = false) {
  const { apiKey, appApiKey, baseURL } = getDifyConfig();
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${useAppKey ? appApiKey : apiKey}`,
    },
    timeout: 120000,
  });
}

export function createWorkflowHttpClient() {
  const { workflowApiKey, baseURL } = getDifyConfig();
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${workflowApiKey}`,
    },
    timeout: 180000,
  });
}

export function createChatHttpClient() {
  const chatKey = process.env.DIFY_CHAT_API_KEY
    ? normalizeEnvValue(process.env.DIFY_CHAT_API_KEY)
    : "";
  const baseURL = process.env.DIFY_BASE_URL
    ? normalizeEnvValue(process.env.DIFY_BASE_URL)
    : "https://api.dify.ai/v1";
  return axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${chatKey}` },
    timeout: 120000,
  });
}
