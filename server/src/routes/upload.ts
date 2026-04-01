import { Router } from "express";

import { upload } from "../middleware/upload";
import {
  assignDocumentMetadata,
  createDocumentByFile,
  createDocumentByText,
  deleteDocument,
  listDocuments,
} from "../services/difyKnowledge";
import { audioToText } from "../services/difyAudio";
import { getReadableErrorMessage } from "../services/error";

const router = Router();

const AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",      // Windows/Chrome 上传 .mp3 时可能报此类型
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/mp4a-latm",
  "audio/mpga",
  "audio/ogg",
]);

const DOC_EXT = new Set(["pdf", "docx", "txt", "md", "xlsx", "csv", "html"]);

router.post("/upload/audio", upload.single("file"), async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const week = String(req.body.week || "").trim();

    if (!req.file) {
      return res.status(400).json({ success: false, error: "缺少 file" });
    }
    if (!subject) {
      return res.status(400).json({ success: false, error: "缺少 subject" });
    }
    if (!week) {
      return res.status(400).json({ success: false, error: "缺少 week" });
    }
    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: "录音文件超过 25MB 限制（Groq Whisper 上限）" });
    }
    // 去掉 codec 参数再比较，如 "audio/webm; codecs=opus" → "audio/webm"
    const baseMime = (req.file.mimetype || "").split(";")[0].trim().toLowerCase();
    if (baseMime && !AUDIO_MIME.has(baseMime)) {
      return res.status(400).json({ success: false, error: `不支持的音频类型: ${req.file.mimetype}` });
    }

    const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");

    const transcribed = await audioToText({
      filename: originalName,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    const mergedText = `[学科: ${subject}] [第${week}周]\n\n${transcribed}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const name = `录音_${originalName}_${timestamp}`;

    const created = await createDocumentByText({
      name,
      text: mergedText,
    });

    await assignDocumentMetadata({
      documentId: created.documentId,
      subject,
      week,
    });

    return res.status(200).json({
      success: true,
      document_id: created.documentId,
      transcribed_text: mergedText,
    });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

router.post("/upload/document", upload.single("file"), async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const week = String(req.body.week || "").trim();

    if (!req.file) {
      return res.status(400).json({ success: false, error: "缺少 file" });
    }
    if (!subject) {
      return res.status(400).json({ success: false, error: "缺少 subject" });
    }
    if (!week) {
      return res.status(400).json({ success: false, error: "缺少 week" });
    }
    if (req.file.size > 100 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: "文件超过 100MB 限制" });
    }

    const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");
    const ext = (originalName.split(".").pop() || "").toLowerCase();
    if (ext && !DOC_EXT.has(ext)) {
      return res.status(400).json({ success: false, error: `不支持的文档类型: .${ext}` });
    }

    const created = await createDocumentByFile({
      filename: originalName,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    await assignDocumentMetadata({
      documentId: created.documentId,
      subject,
      week,
    });

    return res.status(200).json({
      success: true,
      document_id: created.documentId,
    });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

router.delete("/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: "缺少文档 id" });
    await deleteDocument(id);
    return res.status(200).json({ success: true });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

router.get("/documents", async (_req, res) => {
  try {
    const docs = await listDocuments();
    return res.status(200).json({ success: true, documents: docs });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;

