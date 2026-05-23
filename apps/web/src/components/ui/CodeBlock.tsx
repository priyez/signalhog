"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
};

export function CodeBlock({ code, language = "javascript", showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple regex-based syntax highlighter
  const highlight = (text: string) => {
    if (!text) return "";
    
    // Keywords
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"(.*?)"/g, '<span style="color: #98c379">"$1"</span>') // Strings
      .replace(/'(.*?)'/g, '<span style="color: #98c379">\'$1\'</span>') // Strings
      .replace(/\b(import|from|const|new|await|function|return|export|default|if|else)\b/g, '<span style="color: #c678dd">$1</span>') // Keywords
      .replace(/\b(FlagsProvider|FlagsClient|createClient|isEnabled|init|useFlags)\b/g, '<span style="color: #61afef">$1</span>') // Functions/Classes
      .replace(/\/\/(.*)/g, '<span style="color: #5c6370; font-style: italic">//$1</span>'); // Comments

    return html;
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang-label">{language}</span>
        <button className={`copy-button ${copied ? "copied" : ""}`} onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="code-container">
        {showLineNumbers && (
          <div className="line-numbers">
            {code.split("\n").map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <pre className="code-pre">
          <code 
            dangerouslySetInnerHTML={{ __html: highlight(code) }}
          />
        </pre>
      </div>

      <style jsx>{`
        .code-block-wrapper {
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          font-family: var(--font-mono);
          position: relative;
        }
        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .code-lang-label {
          font-size: 11px;
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .copy-button {
          background: none;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .copy-button:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }
        .copy-button.copied {
          color: var(--color-brand);
        }
        .code-container {
          display: flex;
          overflow: auto;
          max-height: 400px;
        }
        .line-numbers {
          padding: 16px 12px;
          background: rgba(0,0,0,0.2);
          color: rgba(255,255,255,0.2);
          text-align: right;
          font-size: 12px;
          user-select: none;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .code-pre {
          margin: 0;
          padding: 16px;
          font-size: 13px;
          line-height: 1.6;
          color: #abb2bf;
          flex: 1;
        }
        code {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
