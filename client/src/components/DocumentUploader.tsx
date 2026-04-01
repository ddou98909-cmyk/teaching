import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, message, Upload } from "antd";
import type { UploadFile } from "antd";
import type { RcFile } from "antd/es/upload";
import { useMemo, useState } from "react";

import TagForm, { type TagFormValues } from "@/components/TagForm";
import { uploadDocument } from "@/services/api";

export default function DocumentUploader(props: { onUploaded?: () => void }) {
  const [form] = Form.useForm<TagFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const beforeUpload = useMemo(
    () => (file: RcFile) => {
      const tooLarge = file.size > 100 * 1024 * 1024;
      if (tooLarge) {
        void message.error("文件超过 100MB 限制");
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
      return false;
    },
    []
  );

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      if (!fileList[0]?.originFileObj) {
        void message.error("请先选择文档文件");
        return;
      }

      const subject = String(values.subject || "").trim();
      const week = String(values.week);
      const file = fileList[0].originFileObj as File;

      setLoading(true);
      await uploadDocument({
        file,
        subject,
        week,
      });

      void message.success("文档上传成功");
      props.onUploaded?.();
      setFileList([]);
      void form.resetFields();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "上传失败";
      void message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Upload.Dragger
        accept=".pdf,.docx,.txt,.md,.xlsx,.csv,.html"
        multiple={false}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={() => setFileList([])}
        style={{ borderStyle: "dashed" }}
      >
        <p>
          <UploadOutlined /> 拖拽文件到这里，或点击选择文件（最大 100MB）
        </p>
      </Upload.Dragger>

      <Form form={form} layout="vertical">
        <TagForm />
      </Form>

      <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
        上传并入库
      </Button>
    </div>
  );
}
