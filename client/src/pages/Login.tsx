import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, message, Segmented, Typography } from "antd";
import { useEffect, useState } from "react";

import { getRememberedCredentials, login, type Role, type User } from "@/services/auth";

type LoginFormValues = {
  id: string;
  password: string;
  remember: boolean;
};

export default function Login(props: { onLogin: (user: User) => void }) {
  const [role, setRole] = useState<Role>("student");
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = getRememberedCredentials();
    if (saved) {
      setRole(saved.role);
      form.setFieldsValue({ id: saved.id, remember: true });
    }
  }, [form]);

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      const user = login(values.id, values.password, role, values.remember);
      void message.success("登录成功");
      props.onLogin(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "登录失败";
      void message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8ecff 0%, #f3f4f8 55%, #dbeafe 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Logo 区 */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 8px 28px rgba(99,102,241,0.35)",
          }}
        >
          {/* 书本图标 */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <Typography.Title level={2} style={{ margin: 0, color: "#1e1b4b", letterSpacing: 2 }}>
          教学资源平台
        </Typography.Title>
        <Typography.Text style={{ color: "#6b7280", fontSize: 14, letterSpacing: 1 }}>
          智慧校园 · 知识互联
        </Typography.Text>
      </div>

      {/* 登录卡片 */}
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.1)",
        }}
        styles={{ body: { padding: "32px 32px 24px" } }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Segmented
            value={role}
            options={[
              { label: "学生登录", value: "student" },
              { label: "教师登录", value: "teacher" },
            ]}
            onChange={(v) => setRole(v as Role)}
            block
            style={{ width: "100%" }}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => void onSubmit(v)}
          initialValues={{ remember: false }}
        >
          <Form.Item
            name="id"
            rules={[{ required: true, message: role === "student" ? "请输入学号" : "请输入工号" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#818cf8" }} />}
              placeholder={role === "student" ? "请输入学号" : "请输入工号"}
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#818cf8" }} />}
              placeholder="请输入密码"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 16 }}>
            <Checkbox>记住密码</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ borderRadius: 10, height: 46, fontWeight: 600, letterSpacing: 1 }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Typography.Text style={{ marginTop: 24, color: "#9ca3af", fontSize: 12, letterSpacing: 1 }}>
        如需开通账号，请联系管理员
      </Typography.Text>
    </div>
  );
}
