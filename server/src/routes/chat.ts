import { Router } from "express";

import { createChatHttpClient } from "../services/difyClient";
import { getReadableErrorMessage } from "../services/error";

const router = Router();

/**
 * POST /api/chat
 * 学生端 AI 对话接口，代理至 Dify Chat-Messages API。
 * Body: { message: string, conversation_id?: string, user_id: string }
 * Response: { success: true, answer: string, conversation_id: string }
 *
 * 配置：在 server/.env 中填写 DIFY_CHAT_API_KEY 后启用。
 */
router.post("/chat", async (req, res) => {
  try {
    const chatApiKey = process.env.DIFY_CHAT_API_KEY?.trim();
    if (!chatApiKey) {
      return res.status(503).json({
        success: false,
        error: "聊天功能尚未配置，请联系管理员设置 DIFY_CHAT_API_KEY",
      });
    }

    const message        = String(req.body.message        || "").trim();
    const conversationId = String(req.body.conversation_id || "").trim() || undefined;
    const userId         = String(req.body.user_id         || "student").trim();

    if (!message) {
      return res.status(400).json({ success: false, error: "消息不能为空" });
    }

    const client = createChatHttpClient();
    const response = await client.post("/chat-messages", {
      inputs:          {},
      query:           message,
      response_mode:   "blocking",
      conversation_id: conversationId ?? "",
      user:            userId,
    });

    const answer           = response.data?.answer as string | undefined;
    const difyConvId       = response.data?.conversation_id as string | undefined;

    if (!answer) {
      return res.status(500).json({ success: false, error: "未获取到 AI 回复，请检查 Dify 应用配置" });
    }

    return res.status(200).json({
      success:         true,
      answer,
      conversation_id: difyConvId ?? "",
    });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
