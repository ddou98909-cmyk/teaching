import FormData from "form-data";

import { createDifyHttpClient, getDifyConfig } from "./difyClient";

type DifyDocument = {
  id: string;
  name: string;
  created_at: string | number;
  indexing_status?: string;
};

type DifyMetadataField = {
  id: string;
  name: string;
  type: string;
};

let cachedMetadataIdByName: Map<string, string> | null = null;
let cachedMetadataFetchedAt = 0;

async function getMetadataIdByName(name: string): Promise<string> {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();

  const now = Date.now();
  const isStale = now - cachedMetadataFetchedAt > 5 * 60 * 1000;
  if (!cachedMetadataIdByName || isStale) {
    const res = await http.get(`/datasets/${datasetId}/metadata`);
    const fields = ((res.data as any)?.doc_metadata || []) as DifyMetadataField[];

    const byName = new Map<string, string>();
    for (const f of fields) {
      if (f && typeof f.name === "string" && typeof f.id === "string") {
        byName.set(f.name, f.id);
      }
    }

    cachedMetadataIdByName = byName;
    cachedMetadataFetchedAt = now;
  }

  const id = cachedMetadataIdByName.get(name);
  if (!id) {
    throw new Error(`未找到 metadata 字段：${name}（请先执行 /api/init-metadata）`);
  }
  return id;
}

export async function ensureMetadataFields() {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();

  const fields: Array<{ name: string; type: string }> = [
    { name: "subject", type: "string" },
    { name: "week", type: "string" },
  ];

  for (const field of fields) {
    try {
      await http.post(`/datasets/${datasetId}/metadata`, field);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = String(err?.response?.data?.message || err?.message || "");
      const ignorable = status === 409 || /exist|already|duplicate/i.test(msg);
      if (!ignorable) throw err;
    }
  }

  cachedMetadataIdByName = null;
  cachedMetadataFetchedAt = 0;
}

export async function createDocumentByText(input: { name: string; text: string }) {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();

  const res = await http.post(`/datasets/${datasetId}/document/create_by_text`, {
    name: input.name,
    text: input.text,
    indexing_technique: "high_quality",
    process_rule: { mode: "automatic" },
  });

  const docId = (res.data as any)?.document?.id;
  if (typeof docId !== "string") {
    throw new Error("create_by_text 返回缺少 document.id");
  }

  return { documentId: docId };
}

export async function createDocumentByFile(input: {
  filename: string;
  buffer: Buffer;
  mimeType?: string;
}) {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();

  const form = new FormData();
  form.append("file", input.buffer, {
    filename: input.filename,
    contentType: input.mimeType,
  });
  form.append(
    "data",
    JSON.stringify({
      name: input.filename,
      indexing_technique: "high_quality",
      process_rule: { mode: "automatic" },
    })
  );

  const res = await http.post(`/datasets/${datasetId}/document/create-by-file`, form, {
    headers: {
      ...form.getHeaders(),
    },
  });

  const docId = (res.data as any)?.document?.id;
  if (typeof docId !== "string") {
    throw new Error("create-by-file 返回缺少 document.id");
  }

  return { documentId: docId };
}

export async function assignDocumentMetadata(input: {
  documentId: string;
  subject: string;
  week: string;
}) {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();

  const subjectId = await getMetadataIdByName("subject");
  const weekId = await getMetadataIdByName("week");

  await http.post(`/datasets/${datasetId}/documents/metadata`, {
    operation_data: [
      {
        document_id: input.documentId,
        metadata_list: [
          { id: subjectId, name: "subject", value: input.subject },
          { id: weekId, name: "week", value: input.week },
        ],
      },
    ],
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();
  await http.delete(`/datasets/${datasetId}/documents/${documentId}`);
}

export async function listDocuments(): Promise<DifyDocument[]> {
  const http = createDifyHttpClient();
  const { datasetId } = getDifyConfig();

  const res = await http.get(`/datasets/${datasetId}/documents`);
  const docs = (res.data as any)?.data || (res.data as any)?.documents || [];

  if (!Array.isArray(docs)) return [];
  return docs
    .map((d: any) => ({
      id: String(d.id),
      name: String(d.name ?? ""),
      created_at: d.created_at ?? "",
      indexing_status: typeof d.indexing_status === "string" ? d.indexing_status : undefined,
    }))
    .filter((d: DifyDocument) => Boolean(d.id));
}
