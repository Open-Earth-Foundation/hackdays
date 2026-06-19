"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Minimal markdown renderer for AI-generated content. Styling lives in
// globals.css under `.md`.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
