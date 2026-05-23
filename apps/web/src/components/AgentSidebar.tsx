"use client";

import React, { useState, useRef, useEffect } from "react";
import { History, Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = "";

  const parseInline = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);
    
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={idx}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={idx}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("[") && part.includes("](")) {
        const closeBracket = part.indexOf("]");
        const linkText = part.slice(1, closeBracket);
        const linkUrl = part.slice(closeBracket + 2, -1);
        return (
          <a
            key={idx}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="markdown-link"
          >
            {linkText}
          </a>
        );
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="markdown-list">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${i}`} className="markdown-pre">
            <code className={codeLanguage ? `language-${codeLanguage}` : ""}>
              {codeBlockContent.join("\n")}
            </code>
          </pre>
        );
        codeBlockContent = [];
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (bulletMatch) {
      const contentText = bulletMatch[2];
      currentList.push(
        <li key={`li-${i}`} className="markdown-li">
          {parseInline(contentText)}
        </li>
      );
      continue;
    } else {
      flushList(i);
    }

    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      elements.push(
        <Tag key={`h-${i}`} className={`markdown-h${level}`}>
          {parseInline(headerText)}
        </Tag>
      );
      continue;
    }

    if (line.trim() === "") {
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="markdown-p">
        {parseInline(line)}
      </p>
    );
  }

  flushList(lines.length);

  return <div className="markdown-body">{elements}</div>;
}

export function AgentSidebar({ projectId = "", environmentId = "" }: { projectId?: string; environmentId?: string } = {}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to SignalHog! I'm your AI workspace assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const newMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          projectId,
          environmentId
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content || "" }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting to my brain right now. Please check if the API is running."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <aside className="agent-sidebar">
      <div className="agent-inner">
        <header className="agent-header">
          <div className="agent-status-dot" />
          <span className="agent-name">SignalHog AI</span>
          <div className="agent-controls">
            <button className="icon-btn" title="History">
              <History size={14} />
            </button>
          </div>
        </header>

        <div className="agent-chat">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              <Markdown content={m.content} />
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble system typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <footer className="agent-footer">
          <div className="suggestion-row">
            <button className="suggest-chip" onClick={() => sendMessage("Project status")}>
              <Sparkles size={10} style={{ marginRight: 4 }} />
              Status
            </button>
            <button className="suggest-chip" onClick={() => sendMessage("Analyze funnels")}>Funnels</button>
            <button className="suggest-chip" onClick={() => sendMessage("Create flag")}>New Flag</button>
          </div>
          <div className="agent-input-wrap">
            <input
              type="text"
              className="agent-input"
              placeholder="Ask SignalHog AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            />
            <button
              className="agent-send-btn"
              onClick={() => sendMessage(input)}
              disabled={isTyping || !input.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        </footer>
      </div>

      <style jsx>{`
       
        .agent-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .agent-header {
          height: 56px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--color-border);
          background: rgba(255,255,255,0.01);
        }
        .agent-status-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(74, 222, 128, 0.5);
        }
        .agent-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
          flex: 1;
        }
        .agent-chat {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: var(--color-border) transparent;
        }
        .chat-bubble {
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.5;
          max-width: 90%;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-bubble.assistant,
        .chat-bubble.system {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text);
          align-self: flex-start;
          border-bottom-left-radius: 2px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .chat-bubble.user {
          background: var(--color-brand);
          color: black;
          align-self: flex-end;
          border-bottom-right-radius: 2px;
          box-shadow: 0 4px 12px rgba(0, 199, 151, 0.2);
        }

        /* Markdown styling */
        .markdown-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .markdown-list {
          list-style-type: disc;
          padding-left: 18px;
          margin: 4px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .markdown-li {
          line-height: 1.5;
        }
        .markdown-p {
          margin: 0;
          line-height: 1.5;
        }
        .markdown-link {
          color: var(--color-brand);
          text-decoration: underline;
        }
        .chat-bubble.user .markdown-link {
          color: #000;
          font-weight: 600;
        }
        .markdown-body strong {
          font-weight: 600;
          color: inherit;
        }
        .markdown-body em {
          font-style: italic;
        }
        .markdown-body code {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .chat-bubble.user code {
          background: rgba(0, 0, 0, 0.1);
        }
        .markdown-pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 10px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 6px 0;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .markdown-pre code {
          background: none;
          padding: 0;
          font-size: 0.85em;
        }
        .markdown-h1, .markdown-h2, .markdown-h3, .markdown-h4, .markdown-h5, .markdown-h6 {
          font-weight: 700;
          margin-top: 8px;
          margin-bottom: 4px;
          color: inherit;
        }
        .markdown-h1 { font-size: 1.2em; }
        .markdown-h2 { font-size: 1.15em; }
        .markdown-h3 { font-size: 1.0em; }
        .markdown-h4, .markdown-h5, .markdown-h6 { font-size: 0.95em; }
        .typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          width: fit-content;
        }
        .dot {
          width: 4px;
          height: 4px;
          background: var(--color-muted);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .agent-footer {
          padding: 20px 16px;
          border-top: 1px solid var(--color-border);
          background: rgba(255,255,255,0.01);
        }
        .suggestion-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .suggestion-row::-webkit-scrollbar { display: none; }
        .suggest-chip {
          white-space: nowrap;
          padding: 6px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          font-size: 11px;
          color: var(--color-muted);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        .suggest-chip:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--color-muted);
          color: var(--color-text);
          transform: translateY(-1px);
        }
        .agent-input-wrap {
          display: flex;
          gap: 10px;
          background: #000;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 6px 10px;
          align-items: center;
          transition: border-color 0.2s;
        }
        .agent-input-wrap:focus-within {
          border-color: var(--color-brand);
        }
        .agent-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text);
          font-size: 13px;
          padding: 6px 0;
          outline: none;
        }
        .agent-send-btn {
          background: none;
          border: none;
          color: var(--color-brand);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .agent-send-btn:disabled {
          color: var(--color-muted);
          cursor: not-allowed;
        }
        .agent-send-btn:not(:disabled):hover {
          background: rgba(0, 199, 151, 0.1);
          transform: scale(1.05);
        }

        @media (max-width: 1200px) {
          .agent-sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
