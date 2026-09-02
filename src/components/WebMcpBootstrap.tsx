"use client";

import { useEffect, useState } from "react";
import { registerWebMcpTools } from "@/lib/webmcp/register-tools";

export function WebMcpBootstrap() {
  const [status, setStatus] = useState<"idle" | "ready" | "unavailable">("idle");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const result = await registerWebMcpTools();
      if (cancelled) return;
      setStatus(result.available ? "ready" : "unavailable");
    }

    run();

    // Some hosts attach modelContext after load
    const timer = window.setInterval(() => {
      if (status === "ready") return;
      registerWebMcpTools().then((result) => {
        if (!cancelled && result.available) setStatus("ready");
      });
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [status]);

  return (
    <span className="sr-only" data-webmcp={status} aria-hidden>
      WebMCP {status}
    </span>
  );
}
