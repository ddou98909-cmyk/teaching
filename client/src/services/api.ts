import axios from "axios";

import type { ApiError, ApiSuccess, DifyDocumentListItem } from "@/types";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      if (
        data &&
        typeof data === "object" &&
        (data as { success?: unknown }).success === false &&
        typeof (data as { error?: unknown }).error === "string"
      ) {
        return Promise.reject(new Error((data as { error: string }).error));
      }
    }
    return Promise.reject(err);
  }
);

function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success?: unknown }).success === false
  );
}

function unwrap<T>(data: ApiSuccess<T> | ApiError): ApiSuccess<T> {
  if (isApiError(data)) throw new Error(data.error);
  return data;
}

export async function initMetadata(): Promise<ApiSuccess<Record<string, never>>> {
  const res = await api.post<ApiSuccess<Record<string, never>> | ApiError>(
    "/init-metadata",
    {}
  );
  return unwrap(res.data);
}

export async function uploadAudio(input: {
  file: File;
  subject: string;
  week: string;
  onProgress?: (percent: number) => void;
}): Promise<ApiSuccess<{ document_id: string; transcribed_text: string }>> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("subject", input.subject);
  form.append("week", input.week);

  const res = await api.post<
    ApiSuccess<{ document_id: string; transcribed_text: string }> | ApiError
  >("/upload/audio", form, {
    onUploadProgress: (evt) => {
      if (!input.onProgress) return;
      const total = evt.total || 0;
      if (!total) return;
      input.onProgress(Math.round((evt.loaded / total) * 100));
    },
  });

  return unwrap(res.data);
}

export async function uploadDocument(input: {
  file: File;
  subject: string;
  week: string;
}): Promise<ApiSuccess<{ document_id: string }>> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("subject", input.subject);
  form.append("week", input.week);

  const res = await api.post<ApiSuccess<{ document_id: string }> | ApiError>(
    "/upload/document",
    form
  );

  return unwrap(res.data);
}

export async function getDocuments(): Promise<ApiSuccess<{ documents: DifyDocumentListItem[] }>> {
  const res = await api.get<ApiSuccess<{ documents: DifyDocumentListItem[] }> | ApiError>(
    "/documents"
  );
  return unwrap(res.data);
}

export async function generateExam(input: {
  subject: string;
  week_start: number;
  week_end: number;
}): Promise<ApiSuccess<{ content: string; filename: string }>> {
  const res = await api.post<ApiSuccess<{ content: string; filename: string }> | ApiError>(
    "/generate-exam",
    input
  );
  return unwrap(res.data);
}

export async function deleteDocument(id: string): Promise<ApiSuccess<Record<string, never>>> {
  const res = await api.delete<ApiSuccess<Record<string, never>> | ApiError>(`/documents/${id}`);
  return unwrap(res.data);
}

export async function sendChatMessage(input: {
  message: string;
  conversation_id?: string;
  user_id: string;
}): Promise<ApiSuccess<{ answer: string; conversation_id: string }>> {
  const res = await api.post<ApiSuccess<{ answer: string; conversation_id: string }> | ApiError>(
    "/chat",
    input
  );
  return unwrap(res.data);
}
