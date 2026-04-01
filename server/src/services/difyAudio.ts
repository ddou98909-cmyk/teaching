import axios from "axios";
import FormData from "form-data";

/**
 * 语音转文字：通过 STT_API_URL 配置的接口（OpenAI 兼容格式）
 * 默认使用 SiliconFlow（国内可访问，免费额度）
 * 也可切换为其他兼容 OpenAI 格式的 STT 服务
 */
export async function audioToText(input: {
  filename: string;
  buffer: Buffer;
  mimeType?: string;
}): Promise<string> {
  const apiKey = (process.env.STT_API_KEY ?? "").trim();
  if (!apiKey) throw new Error("缺少环境变量 STT_API_KEY，请在 .env 中配置");

  const apiUrl =
    (process.env.STT_API_URL ?? "").trim() ||
    "https://api.siliconflow.cn/v1/audio/transcriptions";

  const model =
    (process.env.STT_MODEL ?? "").trim() || "FunAudioLLM/SenseVoiceSmall";

  const form = new FormData();
  form.append("file", input.buffer, {
    filename: input.filename,
    contentType: input.mimeType || "application/octet-stream",
  });
  form.append("model", model);

  const res = await axios.post(apiUrl, form, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...form.getHeaders(),
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 300_000,
  });

  const result = res.data;

  // 部分接口返回纯文本，部分返回 JSON
  if (typeof result === "string" && result.length > 0) return result;
  const text = (result as { text?: unknown }).text;
  if (typeof text === "string") return text;

  throw new Error("STT 接口返回格式异常，请检查 STT_API_KEY 和 STT_API_URL 是否正确");
}
