import { UploadOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, message, Progress, Typography, Upload } from "antd";
import type { UploadFile } from "antd";
import type { RcFile } from "antd/es/upload";
import { useMemo, useState } from "react";

import TagForm, { type TagFormValues } from "@/components/TagForm";
import { uploadAudio } from "@/services/api";

export default function AudioUploader(props: { onUploaded?: () => void }) {
  const [form] = Form.useForm<TagFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);

  const beforeUpload = useMemo(
    () => (file: RcFile) => {
      const tooLarge = file.size > 25 * 1024 * 1024;
      if (tooLarge) {
        void message.error("录音文件超过 25MB 限制（Groq Whisper 上限）");
        return Upload.LIST_IGNORE;
      }
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          size: file.size,
          type: file.type,
          originFileObj: file,
        },
      ]);
      setTranscribedText(null);
      return false;
    },
    []
  );

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      if (!fileList[0]?.originFileObj) {
        void message.error("请先选择音频文件");
        return;
      }

      const subject = String(values.subject || "").trim();
      const week = String(values.week);
      const file = fileList[0].originFileObj as File;

      setLoading(true);
      setProgress(0);

      const res = await uploadAudio({
        file,
        subject,
        week,
        onProgress: (p) => setProgress(p),
      });

      setTranscribedText(res.transcribed_text);
      void message.success("录音上传成功");
      props.onUploaded?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "上传失败";
      void message.error(msg);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Upload.Dragger
        accept=".mp3,.mp4,.wav,.webm,.m4a,.mpeg,.mpga"
        multiple={false}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={() => {
          setFileList([]);
          setTranscribedText(null);
        }}
        style={{ borderStyle: "dashed" }}
      >
        <p>
          <UploadOutlined /> 拖拽文件到这里，或点击选择文件（最大 25MB）
        </p>
      </Upload.Dragger>

      <Form form={form} layout="vertical">
        <TagForm />
      </Form>

      {progress !== null ? <Progress percent={progress} size="small" /> : null}

      <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
        上传并入库
      </Button>

      {transcribedText ? (
        <Collapse
          items={[
            {
              key: "t",
              label: "转写文本预览",
              children: (
                <Typography.Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {transcribedText}
                </Typography.Paragraph>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
