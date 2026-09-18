// hooks/useAdminPartnerActivityStream.ts
"use client";

import { useEffect } from "react";
import { notifyDesktop } from "@/utils/electronNotify";

type PartnerActivityEvent =
  | { type: "customer_created"; partnerName: string; customerName: string }
  | { type: "loan_created"; partnerName: string; customerName: string };

function buildMessage(event: PartnerActivityEvent): string | null {
  switch (event.type) {
    case "customer_created":
      return `Partner ${event.partnerName} created a new customer: ${event.customerName}`;
    case "loan_created":
      return `Partner ${event.partnerName} created a new loan for ${event.customerName}`;
    default:
      return null;
  }
}

const MIN_RETRY_MS = 2000;
const MAX_RETRY_MS = 30_000;

// Streams partner-activity events (a partner creating a customer/loan) from
// GET /notifications/stream and relays each one into a native Windows
// notification via the existing Electron bridge (notifyDesktop). Only ever
// connects when `enabled` and running inside Electron — a plain browser
// session never opens this connection at all.
export function useAdminPartnerActivityStream(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !window.electronAPI) return;

    const controller = new AbortController();
    let stopped = false;
    let retryDelay = MIN_RETRY_MS;

    const connectOnce = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
      const response = await fetch(`${base}/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Notification stream failed: ${response.status}`);
      }

      retryDelay = MIN_RETRY_MS;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!stopped) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;

          try {
            const event = JSON.parse(line.slice(6)) as PartnerActivityEvent;
            const message = buildMessage(event);
            if (message) notifyDesktop("LMS Finance", message);
          } catch {
            // Malformed event — ignore and keep reading the stream.
          }
        }
      }
    };

    const loop = async () => {
      while (!stopped) {
        try {
          await connectOnce();
        } catch {
          // Connection dropped or failed to open — fall through to retry.
        }
        if (stopped) return;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
      }
    };

    loop();

    return () => {
      stopped = true;
      controller.abort();
    };
  }, [enabled]);
}
