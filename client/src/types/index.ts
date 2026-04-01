export type DifyIndexingStatus = "processing" | "completed" | "error" | string;

export type DifyDocumentListItem = {
  id: string;
  name: string;
  created_at: string | number;
  indexing_status?: DifyIndexingStatus;
};

export type ApiSuccess<T> = { success: true } & T;
export type ApiError = { success: false; error: string };

