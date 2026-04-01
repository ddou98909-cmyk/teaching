import { Router } from "express";

import { ensureMetadataFields } from "../services/difyKnowledge";
import { getReadableErrorMessage } from "../services/error";

const router = Router();

router.post("/init-metadata", async (_req, res) => {
  try {
    await ensureMetadataFields();
    return res.status(200).json({ success: true });
  } catch (err) {
    const message = getReadableErrorMessage(err);
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;

