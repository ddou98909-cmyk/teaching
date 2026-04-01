import { Form, Input, InputNumber } from "antd";

export type TagFormValues = {
  subject: string;
  week: number;
};

export default function TagForm() {
  return (
    <>
      <Form.Item
        label="学科"
        name="subject"
        rules={[
          { required: true, message: "请输入学科" },
          {
            validator: async (_rule, value: unknown) => {
              if (typeof value !== "string" || !value.trim()) {
                throw new Error("请输入学科");
              }
            },
          },
        ]}
      >
        <Input placeholder="请输入学科（例如：数学）" />
      </Form.Item>

      <Form.Item
        label="第几周"
        name="week"
        rules={[{ required: true, message: "请输入周数" }]}
      >
        <InputNumber
          min={1}
          max={30}
          precision={0}
          style={{ width: "100%" }}
          placeholder="请输入周数（例如：1）"
        />
      </Form.Item>
    </>
  );
}
