import { FileTextOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Card, Col, Layout, Row, Segmented, Typography } from "antd";
import { useMemo, useState } from "react";

import AudioUploader from "@/components/AudioUploader";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentList from "@/components/DocumentList";
import ExamGenerator from "@/components/ExamGenerator";

export default function Home(props: { userId?: string; onLogout?: () => void }) {
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = useMemo(() => () => setRefreshTick((t) => t + 1), []);
  const [uploadType, setUploadType] = useState<"audio" | "document">("audio");

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8ecff 0%, #f3f4f8 55%, #dbeafe 100%)",
      }}
    >
      {/* ── Header ── */}
      <Layout.Header
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(200,210,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* 左侧 Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            <FileTextOutlined style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <Typography.Title
            level={4}
            style={{ margin: 0, color: "#1e1b4b", letterSpacing: 1, fontWeight: 700 }}
          >
            知识库管理系统
          </Typography.Title>
        </div>

        {/* 右侧操作区 */}
        {props.onLogout && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ExamGenerator />
            <Typography.Text style={{ color: "#6b7280", fontSize: 14 }}>
              {props.userId}
            </Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={props.onLogout}
              style={{
                borderRadius: 8,
                borderColor: "rgba(99,102,241,0.25)",
                color: "#6366f1",
              }}
            >
              退出
            </Button>
          </div>
        )}
      </Layout.Header>

      {/* ── Content ── */}
      <Layout.Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[20, 20]}>
            {/* 上传区 */}
            <Col xs={24} lg={10}>
              <Card
                title={
                  <span style={{ color: "#1e1b4b", fontWeight: 600, letterSpacing: 0.5 }}>
                    上传到知识库
                  </span>
                }
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(99,102,241,0.12)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.07)",
                  background: "rgba(255,255,255,0.88)",
                }}
                extra={
                  <Segmented
                    value={uploadType}
                    options={[
                      { label: "录音", value: "audio" },
                      { label: "文档", value: "document" },
                    ]}
                    onChange={(v) => setUploadType(v as "audio" | "document")}
                  />
                }
              >
                {uploadType === "audio" ? (
                  <AudioUploader onUploaded={refresh} />
                ) : (
                  <DocumentUploader onUploaded={refresh} />
                )}
              </Card>
            </Col>

            {/* 文档列表 */}
            <Col xs={24} lg={14}>
              <Card
                title={
                  <span style={{ color: "#1e1b4b", fontWeight: 600, letterSpacing: 0.5 }}>
                    已上传文档
                  </span>
                }
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(99,102,241,0.12)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.07)",
                  background: "rgba(255,255,255,0.88)",
                }}
              >
                <DocumentList refreshTick={refreshTick} />
              </Card>
            </Col>
          </Row>
        </div>
      </Layout.Content>
    </Layout>
  );
}
