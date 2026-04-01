import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { deleteDocument, getDocuments } from "@/services/api";
import type { DifyDocumentListItem } from "@/types";

function renderStatus(status?: string) {
  if (!status) return <Tag>unknown</Tag>;
  if (status === "processing") return <Tag color="blue">processing</Tag>;
  if (status === "completed") return <Tag color="green">completed</Tag>;
  if (status === "error") return <Tag color="red">error</Tag>;
  return <Tag>{status}</Tag>;
}

export default function DocumentList(props: { refreshTick: number }) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [data, setData] = useState<DifyDocumentListItem[]>([]);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteDocument(id);
      void message.success("删除成功");
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "删除失败";
      void message.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const columns: ColumnsType<DifyDocumentListItem> = useMemo(
    () => [
      {
        title: "文档名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        render: (value: string) => <Typography.Text title={value}>{value}</Typography.Text>,
      },
      {
        title: "上传时间",
        dataIndex: "created_at",
        key: "created_at",
        width: 180,
        render: (v: string | number) => {
          const str = typeof v === "number" ? new Date(v * 1000).toISOString() : String(v);
          return <Typography.Text>{str}</Typography.Text>;
        },
      },
      {
        title: "索引状态",
        dataIndex: "indexing_status",
        key: "indexing_status",
        width: 140,
        render: (s: string) => renderStatus(s),
      },
      {
        title: "操作",
        key: "action",
        width: 80,
        render: (_: unknown, record: DifyDocumentListItem) => (
          <Popconfirm
            title="确认删除该文档？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDelete(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
            />
          </Popconfirm>
        ),
      },
    ],
    [deletingId]
  );

  async function refresh() {
    try {
      setLoading(true);
      const res = await getDocuments();
      setData(res.documents);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加载失败";
      void message.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [props.refreshTick]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <Typography.Text type="secondary">共 {data.length} 条</Typography.Text>
        <Button icon={<ReloadOutlined />} onClick={() => void refresh()} loading={loading}>
          刷新
        </Button>
      </Space>
      <Table
        rowKey={(r) => r.id}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </div>
  );
}

