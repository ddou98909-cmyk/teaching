import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

import { sendChatMessage } from "@/services/api";
import "./Student.css";

/* ─── Types ─── */
type Message      = { id: string; role: "user" | "ai"; text: string };
type Conversation = { id: string; title: string; messages: Message[]; difyConvId?: string };

/* ─── localStorage helpers ─── */
const STORE_KEY  = "studyai_chats";
const ACTIVE_KEY = "studyai_active";
function loadConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}
function saveConversations(cs: Conversation[]) { localStorage.setItem(STORE_KEY, JSON.stringify(cs)); }
function loadActiveId(): string | null { return localStorage.getItem(ACTIVE_KEY); }
function saveActiveId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ─── Mermaid block ─── */
function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const id = "mermaid-" + Math.random().toString(36).slice(2);
    mermaid
      .render(id, code)
      .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; })
      .catch(() => { if (ref.current) ref.current.textContent = code; });
  }, [code]);
  return <div ref={ref} className="s-mermaid" />;
}

/* ─── Markdown renderer ─── */
function AiMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code(props: any) {
          const { children, className } = props;
          const match = /language-(\w+)/.exec(className || "");
          const lang  = match?.[1];
          const src   = String(children).replace(/\n$/, "");
          if (lang === "mermaid") return <MermaidBlock code={src} />;
          return <code className={className}>{children}</code>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/* ─── Decorative SVG ─── */
function DecoSVG({
  svgRef,
  dotRef,
  ringRef,
  lineHRef,
  lineVRef,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onClick,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  dotRef: React.RefObject<SVGCircleElement | null>;
  ringRef: React.RefObject<SVGCircleElement | null>;
  lineHRef: React.RefObject<SVGLineElement | null>;
  lineVRef: React.RefObject<SVGLineElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="s-hero-right"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <svg
        ref={svgRef}
        className="s-deco-svg"
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.15"/>
          </linearGradient>
          <linearGradient id="lg3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        <circle className="s-pulse-ring" cx="300" cy="300" r="268" stroke="url(#lg2)" strokeWidth="1.5"/>
        <circle className="s-pulse-ring" cx="300" cy="300" r="250" stroke="url(#lg1)" strokeWidth="1" style={{ animationDelay: "-2s" }}/>

        <g className="s-rotate-slow">
          <polygon points="300,32 349,42 393,71 424,115 435,165 424,215 393,259 349,288 300,298 251,288 207,259 176,215 165,165 176,115 207,71 251,42"
            stroke="url(#lg1)" strokeWidth="1.2" opacity="0.55"/>
          <line x1="300" y1="32"  x2="300" y2="568" stroke="url(#lg1)" strokeWidth="0.8" opacity="0.28"/>
          <line x1="32"  y1="300" x2="568" y2="300" stroke="url(#lg1)" strokeWidth="0.8" opacity="0.28"/>
          <line x1="87"  y1="87"  x2="513" y2="513" stroke="url(#lg2)" strokeWidth="0.7" opacity="0.22"/>
          <line x1="513" y1="87"  x2="87"  y2="513" stroke="url(#lg2)" strokeWidth="0.7" opacity="0.22"/>
        </g>

        <g className="s-rotate-reverse">
          <circle cx="300" cy="300" r="200" stroke="url(#lg1)" strokeWidth="1.1" opacity="0.48" strokeDasharray="5 9"/>
          <circle cx="300" cy="300" r="170" stroke="url(#lg2)" strokeWidth="0.9" opacity="0.38" strokeDasharray="3 7"/>
          <polygon points="300,100 315,185 390,140 345,210 440,210 370,260 440,310 345,310 390,380 315,335 300,420 285,335 210,380 255,310 160,310 230,260 160,210 255,210 210,140 285,185"
            stroke="url(#lg1)" strokeWidth="1.1" opacity="0.42"/>
        </g>

        <g className="s-rotate-med">
          <circle cx="300" cy="300" r="130" stroke="url(#lg1)" strokeWidth="1.2" opacity="0.52"/>
          <polygon points="300,170 413,235 413,365 300,430 187,365 187,235" stroke="url(#lg2)" strokeWidth="1.3" opacity="0.48"/>
          <polygon points="300,215 373,257 373,343 300,385 227,343 227,257" stroke="url(#lg1)" strokeWidth="1" opacity="0.38"/>
          <line x1="300" y1="170" x2="300" y2="430" stroke="url(#lg2)" strokeWidth="0.8" opacity="0.32"/>
          <line x1="413" y1="235" x2="187" y2="365" stroke="url(#lg2)" strokeWidth="0.8" opacity="0.32"/>
          <line x1="413" y1="365" x2="187" y2="235" stroke="url(#lg2)" strokeWidth="0.8" opacity="0.32"/>
        </g>

        <g opacity="0.36">
          <circle cx="300" cy="220" r="80" stroke="url(#lg1)" strokeWidth="1.1"/>
          <circle cx="300" cy="380" r="80" stroke="url(#lg1)" strokeWidth="1.1"/>
          <circle cx="161" cy="300" r="80" stroke="url(#lg2)" strokeWidth="1.1"/>
          <circle cx="439" cy="300" r="80" stroke="url(#lg2)" strokeWidth="1.1"/>
          <circle cx="207" cy="247" r="80" stroke="url(#lg3)" strokeWidth="0.9"/>
          <circle cx="393" cy="247" r="80" stroke="url(#lg3)" strokeWidth="0.9"/>
          <circle cx="207" cy="353" r="80" stroke="url(#lg3)" strokeWidth="0.9"/>
          <circle cx="393" cy="353" r="80" stroke="url(#lg3)" strokeWidth="0.9"/>
        </g>

        <circle cx="300" cy="300" r="56" stroke="url(#lg1)" strokeWidth="1.5" opacity="0.58"/>
        <circle cx="300" cy="300" r="36" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.48"/>
        <circle cx="300" cy="300" r="6"  fill="url(#lg1)" opacity="0.75"/>
        <polygon points="300,264 321,306 279,306" stroke="url(#lg1)" strokeWidth="1.4" opacity="0.62"/>
        <polygon points="300,336 279,294 321,294" stroke="url(#lg2)" strokeWidth="1.4" opacity="0.52"/>

        <circle ref={dotRef}  id="mouseDot"   cx="300" cy="300" r="5"  fill="url(#lg1)" opacity="0" style={{ transition: "opacity 0.3s" }}/>
        <circle ref={ringRef} id="mouseRing"  cx="300" cy="300" r="28" stroke="url(#lg1)" strokeWidth="1" fill="none" opacity="0" style={{ transition: "opacity 0.3s" }}/>
        <line   ref={lineHRef} id="mouseLineH" x1="0" y1="300" x2="600" y2="300" stroke="url(#lg2)" strokeWidth="0.6" opacity="0" strokeDasharray="3 5"/>
        <line   ref={lineVRef} id="mouseLineV" x1="300" y1="0" x2="300" y2="600" stroke="url(#lg2)" strokeWidth="0.6" opacity="0" strokeDasharray="3 5"/>

        <g fill="url(#lg1)">
          <circle cx="300" cy="32"  r="3"   opacity="0.7"/>
          <circle cx="568" cy="300" r="3"   opacity="0.6"/>
          <circle cx="300" cy="568" r="3"   opacity="0.7"/>
          <circle cx="32"  cy="300" r="3"   opacity="0.6"/>
          <circle cx="440" cy="87"  r="2.2" opacity="0.5"/>
          <circle cx="513" cy="440" r="2.2" opacity="0.45"/>
          <circle cx="160" cy="513" r="2.2" opacity="0.5"/>
          <circle cx="87"  cy="160" r="2.2" opacity="0.45"/>
          <circle cx="413" cy="235" r="2.5" opacity="0.55"/>
          <circle cx="413" cy="365" r="2.5" opacity="0.5"/>
          <circle cx="187" cy="235" r="2.5" opacity="0.55"/>
          <circle cx="187" cy="365" r="2.5" opacity="0.5"/>
        </g>

        <g stroke="url(#lg2)" strokeWidth="1" opacity="0.35">
          <line x1="50"  y1="50"  x2="90"  y2="50"/>
          <line x1="50"  y1="50"  x2="50"  y2="90"/>
          <line x1="550" y1="50"  x2="510" y2="50"/>
          <line x1="550" y1="50"  x2="550" y2="90"/>
          <line x1="50"  y1="550" x2="90"  y2="550"/>
          <line x1="50"  y1="550" x2="50"  y2="510"/>
          <line x1="550" y1="550" x2="510" y2="550"/>
          <line x1="550" y1="550" x2="550" y2="510"/>
        </g>
      </svg>
    </div>
  );
}

/* ═══ Main Student Component ═══ */
export default function Student({ userId, onLogout }: { userId?: string; onLogout?: () => void }) {
  const [chatActive,     setChatActive]     = useState(false);
  const [conversations,  setConversations]  = useState<Conversation[]>(loadConversations);
  const [activeId,       setActiveId]       = useState<string | null>(loadActiveId);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);

  const chatBodyRef  = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const dotRef       = useRef<SVGCircleElement>(null);
  const ringRef      = useRef<SVGCircleElement>(null);
  const lineHRef     = useRef<SVGLineElement>(null);
  const lineVRef     = useRef<SVGLineElement>(null);
  const animFrameRef = useRef<number>(0);
  const targetRef    = useRef({ x: 300, y: 300 });
  const currentRef   = useRef({ x: 300, y: 300 });

  const activeConv = conversations.find(c => c.id === activeId);
  const messages   = activeConv?.messages ?? [];

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  /* init mermaid */
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });
  }, []);

  /* scroll to bottom */
  useEffect(() => {
    if (chatBodyRef.current)
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, loading]);

  /* ── SVG mouse tracking ── */
  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

  const animateMouse = useCallback(() => {
    const dot = dotRef.current, ring = ringRef.current;
    const lh  = lineHRef.current, lv  = lineVRef.current;
    if (!dot || !ring || !lh || !lv) return;
    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.1);
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.1);
    const { x, y } = currentRef.current;
    dot.setAttribute("cx", String(x));  dot.setAttribute("cy", String(y));
    ring.setAttribute("cx", String(x)); ring.setAttribute("cy", String(y));
    lh.setAttribute("y1", String(y));   lh.setAttribute("y2", String(y));
    lv.setAttribute("x1", String(x));   lv.setAttribute("x2", String(x));
    animFrameRef.current = requestAnimationFrame(animateMouse);
  }, []);

  function toSVGCoords(e: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 300, y: 300 };
    const r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (600 / r.width), y: (e.clientY - r.top) * (600 / r.height) };
  }
  function setOpacity(op: string) {
    if (dotRef.current)   dotRef.current.style.opacity   = op === "show" ? "0.8" : "0";
    if (ringRef.current)  ringRef.current.style.opacity  = op === "show" ? "0.5" : "0";
    if (lineHRef.current) lineHRef.current.style.opacity = op === "show" ? "0.3" : "0";
    if (lineVRef.current) lineVRef.current.style.opacity = op === "show" ? "0.3" : "0";
  }
  function handleHeroMouseEnter()                  { setOpacity("show"); animateMouse(); }
  function handleHeroMouseLeave()                  { setOpacity("hide"); cancelAnimationFrame(animFrameRef.current); }
  function handleHeroMouseMove(e: React.MouseEvent) {
    const p = toSVGCoords(e);
    targetRef.current = p;
    const d = Math.sqrt((p.x - 300) ** 2 + (p.y - 300) ** 2);
    ringRef.current?.setAttribute("r", String(Math.max(18, 28 - d * 0.04)));
  }
  function handleHeroClick(e: React.MouseEvent) {
    const svg = svgRef.current; if (!svg) return;
    const p = toSVGCoords(e);
    const ripple = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ripple.setAttribute("cx", String(p.x)); ripple.setAttribute("cy", String(p.y));
    ripple.setAttribute("r", "4"); ripple.setAttribute("fill", "none");
    ripple.setAttribute("stroke", "url(#lg1)"); ripple.setAttribute("stroke-width", "1.5");
    ripple.setAttribute("opacity", "0.8");
    svg.appendChild(ripple);
    let r = 4, op = 0.8;
    const exp = setInterval(() => {
      r += 6; op -= 0.05;
      ripple.setAttribute("r", String(r));
      ripple.setAttribute("opacity", String(Math.max(0, op)));
      if (op <= 0) { clearInterval(exp); svg.removeChild(ripple); }
    }, 16);
  }

  /* ── Conversation management ── */
  function createConversation(firstMessage?: string): Conversation {
    const id   = uid();
    const conv: Conversation = { id, title: firstMessage?.slice(0, 20) || "新对话", messages: [] };
    const updated = [conv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setActiveId(id);
    saveActiveId(id);
    return conv;
  }

  function newChat() { createConversation(); }

  function switchConv(id: string) { setActiveId(id); saveActiveId(id); }

  function deleteConv(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    if (activeId === id) {
      const next = updated[0]?.id ?? null;
      setActiveId(next); saveActiveId(next);
    }
  }

  function goToChat() {
    if (!activeId) createConversation();
    setChatActive(true);
  }

  /* ── Send message ── */
  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    let convId = activeId;
    let convs  = conversations;

    if (!convId) {
      const c = createConversation(text);
      convId = c.id;
      convs  = [c, ...conversations];
    }

    const userMsg: Message = { id: uid(), role: "user", text };
    const convs1 = convs.map(c => {
      if (c.id !== convId) return c;
      const msgs  = [...c.messages, userMsg];
      const title = c.title === "新对话" ? text.slice(0, 20) : c.title;
      return { ...c, messages: msgs, title };
    });
    setConversations(convs1);
    saveConversations(convs1);
    setInput("");
    setLoading(true);

    try {
      const currentConv = convs1.find(c => c.id === convId);
      const res = await sendChatMessage({
        message:         text,
        conversation_id: currentConv?.difyConvId,
        user_id:         userId || "student",
      });
      const aiMsg: Message = { id: uid(), role: "ai", text: res.answer };
      const convs2 = convs1.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, aiMsg], difyConvId: res.conversation_id }
      );
      setConversations(convs2);
      saveConversations(convs2);
    } catch (err) {
      const errMsg: Message = { id: uid(), role: "ai", text: err instanceof Error ? err.message : "请求失败，请稍后重试" };
      const convs2 = convs1.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, errMsg] }
      );
      setConversations(convs2);
      saveConversations(convs2);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  }

  /* ── Render ── */
  return (
    <div className="student-page">

      {/* ── 导航栏 ── */}
      <nav className="s-nav">
        <div className="s-nav-logo">StudyAI</div>
        <div className="s-nav-actions">
          {userId && <span className="s-nav-user">{userId}</span>}
          {onLogout && <button className="s-nav-logout" onClick={onLogout}>退出</button>}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="s-hero">
        <div className="s-hero-left">
          <div className="s-hero-content">
            <div className="s-hero-badge">✦ AI 驱动的学习平台</div>
            <h1 className="s-hero-title">
              复习更聪明<br />
              考试更<span className="s-hero-title-gradient">自信</span>
            </h1>
            <ul className="s-hero-features">
              {["一站式无缝学习协作", "师生上下对齐目标", "全面激活学习与个人"].map(f => (
                <li key={f} className="s-hero-feature">
                  <span className="s-check">
                    <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                      <polyline points="2,6.5 5,9.5 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="s-btn-cta" onClick={goToChat}>
              开始复习 <span className="s-btn-arrow">→</span>
            </button>
          </div>
        </div>

        <DecoSVG
          svgRef={svgRef} dotRef={dotRef} ringRef={ringRef} lineHRef={lineHRef} lineVRef={lineVRef}
          onMouseEnter={handleHeroMouseEnter} onMouseLeave={handleHeroMouseLeave}
          onMouseMove={handleHeroMouseMove}   onClick={handleHeroClick}
        />
      </section>

      {/* ── 聊天页面 ── */}
      <div className={`s-chat-page${chatActive ? " active" : ""}`}>

        {/* 侧边栏 */}
        <aside className="s-sidebar">
          <div className="s-sidebar-logo">StudyAI</div>
          <button className="s-sidebar-new" onClick={newChat}>
            <span>＋</span> 新建对话
          </button>
          {conversations.length > 0 && (
            <>
              <div className="s-sidebar-section">历史对话</div>
              {conversations.map(c => (
                <div
                  key={c.id}
                  className={`s-conv-item${c.id === activeId ? " active" : ""}`}
                  onClick={() => switchConv(c.id)}
                >
                  <span className="s-conv-icon">💬</span>
                  <span className="s-conv-text">{c.title}</span>
                  <button className="s-conv-del" onClick={(e) => deleteConv(e, c.id)}>✕</button>
                </div>
              ))}
            </>
          )}
        </aside>

        {/* 主区域 */}
        <div className="s-chat-main">
          <header className="s-chat-header">
            <button className="s-chat-back" onClick={() => setChatActive(false)}>←</button>
            <div>
              <div className="s-chat-header-title">{activeConv?.title || "AI 复习助手"}</div>
              <div className="s-chat-header-sub">
                <span className="s-status-dot" /> AI 随时为你解答
              </div>
            </div>
          </header>

          <div className="s-chat-body" ref={chatBodyRef}>
            <div className="s-msg-time">今天</div>

            {/* 欢迎消息（无历史时显示） */}
            {messages.length === 0 && (
              <>
                <div className="s-msg-row ai">
                  <div className="s-msg-avatar ai">AI</div>
                  <div className="s-msg-bubble">你好！我是你的 AI 复习助手 👋<br />有什么知识点需要帮你梳理，或者想练习哪科题目？</div>
                </div>
                <div className="s-msg-row ai">
                  <div className="s-msg-avatar ai">AI</div>
                  <div className="s-msg-bubble">你可以直接问我概念、让我出题考你，或者把不懂的题目发给我分析～</div>
                </div>
              </>
            )}

            {/* 历史消息 */}
            {messages.map(msg => (
              <div key={msg.id} className={`s-msg-row ${msg.role}`}>
                <div className={`s-msg-avatar ${msg.role}`}>
                  {msg.role === "ai" ? "AI" : (userId?.[0]?.toUpperCase() ?? "S")}
                </div>
                <div className="s-msg-bubble">
                  {msg.role === "ai" ? <AiMessage text={msg.text} /> : msg.text}
                </div>
              </div>
            ))}

            {/* 打字动画 */}
            {loading && (
              <div className="s-msg-row ai">
                <div className="s-msg-avatar ai">AI</div>
                <div className="s-msg-bubble">
                  <div className="s-typing-bubble">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="s-chat-footer">
            <div className="s-input-wrap">
              <textarea
                className="s-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题，按 Enter 发送…"
                rows={1}
              />
              <button
                className="s-send-btn"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
              >↑</button>
            </div>
            <div className="s-chat-hint">AI 回答仅供参考，请结合教材理解</div>
          </footer>
        </div>

      </div>
    </div>
  );
}
