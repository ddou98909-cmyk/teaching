import axios from "axios";

type AnyObject = Record<string, unknown>;

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function getReadableErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as AnyObject | undefined;
    const msg =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      err.message;

    console.error("[dify] axios error", {
      url: err.config?.url,
      method: err.config?.method,
      status,
      data: err.response?.data,
    });

    const host = err.config?.baseURL || err.config?.url || "";
    const label = host.includes("groq.com") ? "Groq API" : "Dify API";
    if (status) return `${label} 调用失败（${status}）：${msg} [${err.config?.url ?? ""}]`;
    return `网络请求失败：${msg} [${err.config?.url ?? ""}]`;
  }

  if (err instanceof Error) {
    console.error("[server] error", err);
    return err.message;
  }

  console.error("[server] unknown error", err);
  return `未知错误：${safeJsonStringify(err)}`;
}
