import type { Metadata } from "next";
import { ToolProvider } from "@/lib/tool/tool-context";
import "@/styles/tool.css";

export const metadata: Metadata = {
  title: "Unlock Funding — Climate Action Finance",
  description: "Connect cities with climate finance — match instruments, explore pooled deals.",
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tool-root">
      <ToolProvider>{children}</ToolProvider>
    </div>
  );
}
