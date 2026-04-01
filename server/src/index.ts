import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import multer from "multer";

import initRoutes from "./routes/init";
import uploadRoutes from "./routes/upload";
import examRoutes from "./routes/exam";
import chatRoutes from "./routes/chat";
import { getReadableErrorMessage } from "./services/error";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", initRoutes);
app.use("/api", uploadRoutes);
app.use("/api", examRoutes);
app.use("/api", chatRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    const isFileTooLarge = err.code === "LIMIT_FILE_SIZE";
    const message = isFileTooLarge ? "文件超过 100MB 限制" : `上传失败：${err.message}`;
    return res.status(400).json({ success: false, error: message });
  }

  const message = getReadableErrorMessage(err);
  return res.status(500).json({ success: false, error: message });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
