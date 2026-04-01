import { FileTextOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, message, Modal } from "antd";
import { useState } from "react";

import { generateExam } from "@/services/api";

type ExamFormValues = {
  subject: string;
  week_start: number;
  week_end: number;
};

export default function ExamGenerator() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<ExamFormValues>();
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res = await generateExam({
        subject: values.subject.trim(),
        week_start: values.week_start,
        week_end: values.week_end,
      });

      // 下载文件
      const blob = new Blob([res.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      void message.success("试卷生成成功，已开始下载");
      setOpen(false);
      form.resetFields();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "生成失败";
      void message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="primary"
        icon={<FileTextOutlined />}
        onClick={() => setOpen(true)}
      >
        生成试卷
      </Button>

      <Modal
        title="AI 生成试卷"
        open={open}
        onCancel={() => { if (!loading) setOpen(false); }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="学科"
            name="subject"
            rules={[{ required: true, message: "请输入学科" }]}
          >
            <Input placeholder="请输入学科（例如：数学）" />
          </Form.Item>

          <Form.Item label="周数范围" required style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Form.Item
                name="week_start"
                noStyle
                rules={[{ required: true, message: "请输入起始周" }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  precision={0}
                  placeholder="起始周"
                  style={{ flex: 1 }}
                />
              </Form.Item>
              <span style={{ color: "#94A3B8" }}>—</span>
              <Form.Item
                name="week_end"
                noStyle
                rules={[
                  { required: true, message: "请输入结束周" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue("week_start") || value >= getFieldValue("week_start")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("结束周不能小于起始周"));
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  precision={0}
                  placeholder="结束周"
                  style={{ flex: 1 }}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Button onClick={() => setOpen(false)} disabled={loading} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
              {loading ? "生成中..." : "生成并下载"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
