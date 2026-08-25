"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

type Message = { role: "user" | "assistant"; content: string };

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === "true";

export default function AIChatWidget({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: dict.chat.greeting }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    if (!AI_ENABLED) {
      setMessages((prev) => [...prev, { role: "assistant", content: dict.chat.disabled }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-10),
          locale
        })
      });

      if (!res.ok) throw new Error("chat_failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: dict.chat.error }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={dict.chat.button_label}
        className="fixed bottom-5 start-5 z-50 flex items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.7 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <SparklesIcon />
        {dict.chat.button_label}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 start-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl2 border border-brand-100 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-brand-700 px-4 py-3 text-white">
              <div>
                <div className="text-sm font-bold">{dict.chat.panel_title}</div>
                <div className="text-xs text-white/75">{dict.chat.panel_subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl2 px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ms-auto bg-brand-600 text-white"
                      : "me-auto bg-brand-50 text-ink-900"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="me-auto max-w-[85%] rounded-xl2 bg-brand-50 px-3 py-2 text-sm text-ink-800/60">
                  {dict.chat.thinking}
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-brand-100 p-3">
              <input
                className="input"
                placeholder={dict.chat.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4 py-2.5">
                {dict.chat.send}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2l1.8 5.8L20 9.5l-6.2 1.7L12 17l-1.8-5.8L4 9.5l6.2-1.7L12 2Z" />
    </svg>
  );
}
