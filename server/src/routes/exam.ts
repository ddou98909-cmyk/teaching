import { Router } from "express";

import { createWorkflowHttpClient } from "../services/difyClient";
import { getReadableErrorMessage } from "../services/error";

const router = Router();

/**
 * POST /api/generate-exam
 * 调用 Dify 工作流生成试卷，返回生成的试卷内容。
 * Dify 工作流输入变量：subject, week_start, week_end
 * Dify 工作流输出变量：result
 */
router.post("/generate-exam", async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const weekStart = Number(req.body.week_start) || 0;
    const weekEnd = Number(req.body.week_end) || 0;

    if (!subject) {
      return res.status(400).json({ success: false, error: "缺少 subject" });
    }
    if (!weekStart || !weekEnd || weekEnd < weekStart) {
      return res.status(400).json({ success: false, error: "请填写正确的周数范围" });
    }

    const client = createWorkflowHttpClient();
    const response = await client.post("/workflows/run", {
      inputs: {
        subject,
        week_start: String(weekStart),
        week_end: String(weekEnd),
      },
      response_mode: "blocking",
      user: "teacher",
    });

    const outputs = response.data?.data?.outputs as Record<string, unknown> | undefined;
    const content =
      (outputs?.result as string) ||
      (outputs?.text as string) ||
      (outputs?.exam_content as string) ||
      JSON.stringify(outputs, null, 2);

    if (!content) {
      return res.status(500).json({ success: false, error: "工作流未返回有效内容，请检查 Dify 工作流配置" });
    }

    return res.status(200).json({
      success: true,
      content,
      filename: `${subject}_第${weekStart}-${weekEnd}周_试卷.txt`,
    });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
