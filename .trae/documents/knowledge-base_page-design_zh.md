# 页面设计文档：知识库系统（桌面优先）

## 全局设计（Global Styles）
- 设计基调：简洁学院风，indigo 紫蓝配色，Ant Design 5 组件库（主题色 #6366f1）
- UI 组件库：Ant Design 5（ConfigProvider 全局注入 colorPrimary: #6366f1）
- 布局：最大宽度 1200px，居中，顶部导航 + 主体内容区
- 配色方案：
  - 主色：#6366f1（indigo-500）/ #818cf8（indigo-400）
  - 渐变背景：`linear-gradient(135deg, #e8ecff 0%, #f3f4f8 55%, #dbeafe 100%)`
  - 深色文字：#1e1b4b / #374151
  - 辅助文字：#6b7280 / #9ca3af
  - 卡片背景：rgba(255,255,255,0.88)，圆角 14px，柔和阴影

---

## 页面 1：登录页

### 1) Layout
- 全屏居中，渐变背景（#e8ecff → #f3f4f8 → #dbeafe）
- 顶部：系统图标（书本 SVG，indigo 渐变方块底）+ 标题「教学资源平台」+ 副标题「智慧校园 · 知识互联」
- 中部：登录卡片（max-width 400px，圆角 16px，indigo 阴影）
- 底部：提示文字「如需开通账号，请联系管理员」

### 2) 登录卡片内部

| 组件 | 说明 |
|---|---|
| Segmented | 身份切换：「学生登录」/「教师登录」，block 全宽，indigo 主题 |
| Input (UserOutlined) | 账号输入框；placeholder 随角色切换：「请输入学号」/「请输入工号」；图标 #818cf8 |
| Input.Password (LockOutlined) | 密码输入框；图标 #818cf8 |
| Checkbox | 「记住密码」；勾选后账号与角色存入 localStorage，下次打开自动填充 |
| Button | 「登 录」主按钮，block 全宽，size large，圆角 10px，字间距 1px |

### 3) 登录逻辑
- 本地 mock 验证：student1/123456（学生）、teacher1/123456（教师）
- 登录成功：用户信息存入 sessionStorage（或勾选记住密码时存入 localStorage）
- 登录失败：message.error 提示「账号不存在」或「密码错误」
- 退出：清除存储，回到登录页

---

## 页面 2：教师端 — 知识库工作台

### 1) Layout
- 桌面优先，两列布局（Ant Design Row+Col）
  - 左侧（约 5/12）：上传 Card
  - 右侧（约 7/12）：文档列表 Card
- < 1024px：上下堆叠

### 2) 视觉风格
- 顶部 Header：磨砂玻璃效果（`rgba(255,255,255,0.80)` + `backdrop-filter: blur(20px)`），sticky 固定
- 背景：indigo 渐变（同登录页）
- 卡片：`rgba(255,255,255,0.88)`，圆角 14px，indigo 边框色 `rgba(99,102,241,0.12)`

### 3) 顶部导航栏

| 区域 | 内容 |
|---|---|
| 左侧 | indigo 渐变小方块图标 + 「知识库管理系统」标题（#1e1b4b） |
| 右侧 | 「生成试卷」按钮 · 用户工号文字 · 「退出」按钮（indigo 边框色） |

---

### 4) 上传 Card（左侧）
- 卡片标题：上传到知识库
- 内部通过 **Ant Design Segmented** 切换两个上传入口

**Tab 1 — 录音上传（AudioUploader）**

| 组件 | 说明 |
|---|---|
| Upload.Dragger | 拖拽/点击选择音频文件；accept: mp3/wav/m4a/webm 等；单文件；选后展示文件名与大小 |
| TagForm | 学科（Input，必填）+ 第几周（InputNumber，1–30，必填） |
| Progress | 上传中显示进度条（0–100%，来自 axios onUploadProgress） |
| Button「上传并入库」 | loading 状态；成功后显示 message.success + 清空表单 |

- 文件大小限制：≤ 25MB（超出前端提示）
- 上传成功后额外展示转写文本预览（折叠/展开）

**Tab 2 — 文档上传（DocumentUploader）**

| 组件 | 说明 |
|---|---|
| Upload.Dragger | 拖拽/点击选择文档；accept: pdf/docx/txt/md/xlsx/csv/html；单文件 |
| TagForm | 学科（必填）+ 第几周（必填） |
| Button「上传并入库」 | loading 状态；成功后 message.success + 清空表单 |

- 文件大小限制：≤ 100MB

---

### 5) 文档列表 Card（右侧）
- 卡片标题：已上传文档

**顶部操作栏**
- 左侧：共 N 条（文字统计）
- 右侧：刷新按钮（ReloadOutlined，loading 状态）

**文档列表表格（Ant Design Table）**

| 列名 | 字段 | 宽度 | 说明 |
|---|---|---|---|
| 文档名称 | name | 自适应 | 长名省略号 + title tooltip |
| 上传时间 | created_at | 180px | Unix 时间戳转本地时间字符串 |
| 索引状态 | indexing_status | 140px | Tag 色标：processing=蓝 / completed=绿 / error=红 |
| 操作 | — | 80px | 删除按钮（DeleteOutlined，红色 text 按钮） |

**删除交互**
- 点击删除 → Popconfirm 确认 → 调用 DELETE /api/documents/:id → 成功后列表实时移除

**空状态**：「暂无文档，先上传一个吧」

**分页**：pageSize 8，隐藏 pageSize 切换器

---

### 6) AI 生成试卷弹窗（ExamGenerator）
- 触发：点击顶部「生成试卷」按钮
- Modal 标题：AI 生成试卷

| 组件 | 说明 |
|---|---|
| Input | 学科（必填） |
| InputNumber × 2 | 周数范围：起始周（1–30）— 结束周（1–30），结束周 ≥ 起始周校验 |
| Button「生成并下载」 | primary 样式；loading 显示「生成中...」；成功后自动下载 .txt 文件并关闭弹窗 |

---

## 页面 3：学生端 — AI 复习助手

### 1) 整体结构
学生端为全屏独立应用，不使用 Ant Design Layout，全部采用自定义 CSS（Student.css）实现 indigo 设计风格。分为两个子页面：**Landing 首页**（默认显示）和**聊天页面**（点击「开始复习」后以 CSS transform 滑入）。

---

### 2) Landing 首页（Hero）

**导航栏（固定顶部）**
- 毛玻璃效果（`rgba(255,255,255,0.7)` + `backdrop-filter: blur(20px)`）
- 左侧：「StudyAI」渐变 Logo
- 右侧：用户学号 + 退出按钮

**左侧文字区（50%宽）**
| 元素 | 内容 |
|---|---|
| 徽标 | 「✦ AI 驱动的学习平台」，indigo 边框圆角胶囊 |
| 标题 | 「复习更聪明 / 考试更**自信**」，「自信」为 indigo 渐变文字 |
| 特性列表 | 3 条特性，每条前置 indigo 渐变圆形勾选图标 |
| CTA 按钮 | 「开始复习 →」，indigo 渐变按钮，hover 上浮 + 加深阴影 |

**右侧装饰区（50%宽）**
- 纯 SVG 几何动画：同心圆、多边形、星形，三层不同速度旋转
- 鼠标悬停：显示跟随光标的十字准线 + 光晕点
- 鼠标点击：产生扩散涟漪动画

---

### 3) 聊天页面（Chat）

**触发**：点击「开始复习」，`.s-chat-page` 通过 `transform: translateX(0)` 滑入，过渡 0.45s

**左侧边栏（260px）**
- 背景：#e8ecff
- 顶部：「StudyAI」渐变 Logo
- 「＋ 新建对话」按钮（虚线边框，hover 填充）
- 历史对话列表（localStorage 持久化）：每项显示标题 + hover 时显示删除按钮

**右侧主区域**
| 区域 | 内容 |
|---|---|
| Header | 「←」返回按钮 + 当前对话标题 + 绿色闪烁在线状态点 |
| 消息区 | 支持滚动，消息入场带 fadeIn+translateY 动画 |
| AI 消息气泡 | 白底，支持完整 Markdown 渲染（段落/标题/列表/代码块/表格/引用/链接） |
| Mermaid 图表 | 代码块 language=mermaid 时自动渲染为 SVG 思维导图/流程图 |
| 用户消息气泡 | indigo 渐变底，右对齐 |
| 打字动画 | AI 思考时显示三点跳动动画（#c4b5fd） |
| 输入栏 | 毛玻璃底部栏，圆角输入框，focus 时 indigo 边框高亮，「↑」发送按钮 |

**交互规则**
- Enter 发送，Shift+Enter 换行
- 发送后自动创建新对话（若无激活对话），标题取消息前 20 字
- 对话历史存储在 localStorage（`studyai_chats`）

---

### 4) 状态说明

| 状态 | 表现 |
|---|---|
| 上传中 | 按钮 loading + 进度条（录音上传） |
| 上传成功 | message.success toast + 表单清空 + 列表刷新 |
| 上传失败 | message.error toast，显示服务端错误文案 |
| 删除中 | 对应行删除按钮 loading |
| 删除成功 | message.success + 该行从列表移除 |
| 试卷生成中 | 弹窗内按钮 loading，显示「生成中...」 |
| 试卷生成成功 | message.success + 自动下载文件 + 关闭弹窗 |
| AI 回复中 | 三点打字动画气泡 |
| AI 聊天未配置 | 返回「聊天功能尚未配置，请联系管理员」错误气泡 |
