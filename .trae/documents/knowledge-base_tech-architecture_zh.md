## 1. Architecture Design
```mermaid
graph TD
  A[用户浏览器] --> B[React 前端 :5173]
  B --> C[Express 后端 :3001]
  C --> D[AIHubMix Whisper API\nhttps://aihubmix.com/v1]
  C --> E[Dify Knowledge Base API\n/v1/datasets/...]
  C --> F[Dify Workflow API\n/v1/workflows/run]
  C --> G[Dify Chat API\n/v1/chat-messages]

  subgraph "Frontend Layer"
      B
  end

  subgraph "Backend Layer"
      C
  end

  subgraph "External Services"
      D
      E
      F
      G
  end
```

## 2. Technology Description
- **Frontend**: React 18 + Vite + TypeScript + Ant Design 5（ConfigProvider 全局主题 colorPrimary: #6366f1）
- **Backend**: Node.js + Express + TypeScript（ts-node-dev 热更新）
- **语音转写**: AIHubMix（OpenAI 兼容接口）→ `whisper-1` 模型
- **知识库存储**: Dify Knowledge Base API（文档索引、元数据管理）
- **试卷生成**: Dify Workflow API（已接入，Key：`DIFY_WORKFLOW_API_KEY`）
- **学生 AI 对话**: Dify Chat API（接口已就绪，Key：`DIFY_CHAT_API_KEY`，待配置）
- **Markdown 渲染**: react-markdown + remark-gfm
- **思维导图/流程图**: mermaid.js（识别 code block language=mermaid 自动渲染 SVG）
- **文件处理**: multer（内存缓冲，不落盘）
- **身份验证**: 前端本地 mock 验证（后续可接入后端认证服务）

## 3. Route Definitions

### 前端页面路由
| Route | Purpose |
|---|---|
| / | 登录页（未登录时）：教师/学生身份选择与登录 |
| / | 教师端工作台（教师登录后）：录音/文档上传、元数据填写、文档列表管理、AI 生成试卷 |
| / | 学生端（学生登录后）：Landing 英雄首页 + 滑入式 AI 对话界面 |

### 后端 API 路由
| Method | Path | Purpose |
|---|---|---|
| POST | /api/upload/audio | 上传录音 → Whisper 转写 → 写入 Dify |
| POST | /api/upload/document | 上传文档文件 → 写入 Dify |
| GET | /api/documents | 从 Dify 拉取文档列表 |
| DELETE | /api/documents/:id | 从 Dify 删除指定文档 |
| POST | /api/init-metadata | 初始化 Dify 元数据字段（subject/week） |
| POST | /api/generate-exam | 调用 Dify 工作流生成试卷 |
| POST | /api/chat | 学生端 AI 对话，代理至 Dify Chat API（需配置 DIFY_CHAT_API_KEY） |

## 4. Key Data Flows

### 登录流程
```
前端选择身份（学生/教师） → 输入账号密码
  → 本地 mock 验证（student1/123456、teacher1/123456）
  → 验证通过 → 存储用户信息（remember 则 localStorage，否则 sessionStorage）
  → 跳转至对应端页面
```

### 录音上传流程
```
前端 multipart/form-data (file + subject + week)
  → POST /api/upload/audio
  → multer 解析（内存缓冲，限 25MB）
  → MIME 类型校验（audio/*）
  → AIHubMix /v1/audio/transcriptions（whisper-1）
  → 转写文本 + 元数据拼装：[学科: xx] [第N周]\n\n{文本}
  → Dify POST /datasets/{id}/document/create_by_text
  → Dify POST /datasets/{id}/documents/metadata（subject + week）
  → 返回 { success, document_id, transcribed_text }
```

### 文档上传流程
```
前端 multipart/form-data (file + subject + week)
  → POST /api/upload/document
  → multer 解析（内存缓冲，限 100MB）
  → 扩展名校验（pdf/docx/txt/md/xlsx/csv/html）
  → Dify POST /datasets/{id}/document/create-by-file（multipart，含 name 字段）
  → Dify POST /datasets/{id}/documents/metadata（subject + week）
  → 返回 { success, document_id }
```

### 删除文档流程
```
前端 DELETE /api/documents/:id
  → 后端 DELETE /datasets/{datasetId}/documents/{documentId}
  → 返回 { success }
  → 前端列表实时移除该条记录
```

### 生成试卷流程
```
前端 POST /api/generate-exam { subject, week_start, week_end }
  → 参数校验（学科必填，周数范围合法）
  → 调用 Dify Workflow API POST /workflows/run
     Authorization: Bearer DIFY_WORKFLOW_API_KEY
     inputs: { subject, week_start, week_end }（字符串类型）
     response_mode: blocking
  → 取 outputs.result（或 outputs.text / outputs.exam_content）作为试卷内容
  → 返回 { success, content, filename }
  → 前端创建 Blob 并触发浏览器下载 .txt 文件
```

### 学生 AI 对话流程
```
前端 POST /api/chat { message, conversation_id?, user_id }
  → 校验 DIFY_CHAT_API_KEY（未配置返回 503）
  → 参数校验（message 必填）
  → 调用 Dify Chat API POST /chat-messages
     Authorization: Bearer DIFY_CHAT_API_KEY
     inputs: {}，query: message，response_mode: blocking
     conversation_id: 上轮返回的 ID（多轮对话）
  → 返回 { success, answer, conversation_id }
  → 前端渲染 Markdown（react-markdown + remark-gfm）
  → 若含 mermaid 代码块，mermaid.js 渲染为 SVG 图表
  → 对话记录存储至 localStorage（studyai_chats）
```

## 5. Environment Variables
| Variable | Purpose |
|---|---|
| DIFY_API_KEY | Dify 知识库 API Key（dataset-...） |
| DIFY_APP_API_KEY | Dify 应用 API Key（app-...） |
| DIFY_WORKFLOW_API_KEY | Dify 试卷生成工作流 API Key（app-...，已配置） |
| DIFY_CHAT_API_KEY | Dify 学生对话应用 API Key（app-...，待配置） |
| DIFY_BASE_URL | Dify API 基础地址（含 /v1） |
| DIFY_DATASET_ID | 目标知识库 Dataset ID |
| STT_API_KEY | AIHubMix API Key（sk-...） |
| STT_API_URL | 语音转写接口地址（https://aihubmix.com/v1/audio/transcriptions） |
| STT_MODEL | 使用的 Whisper 模型（whisper-1） |

## 6. External Service Limits
| Service | Limit |
|---|---|
| AIHubMix Whisper | 单文件 ≤ 25MB；支持 mp3/mp4/wav/webm/m4a/ogg 等 |
| Dify create-by-file | 单文件 ≤ 100MB；支持 pdf/docx/txt/md/xlsx/csv/html |
| Dify create_by_text | 文本长度无硬性限制（依 Dify 版本） |
| Dify Workflow | blocking 模式，超时 180s；输入变量：subject / week_start / week_end；输出变量：result |
| Dify Chat | blocking 模式，超时 120s；多轮对话通过 conversation_id 关联 |
