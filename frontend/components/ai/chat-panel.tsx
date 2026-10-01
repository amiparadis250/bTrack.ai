"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertCircle, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

interface ChatMessage {
  role: "user" | "assistant" | "error";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "How much did I spend this month?",
  "What were my biggest expenses?",
  "Which month had the highest sales?",
  "Why did my profit change?",
  "Ni angahe nakoresheje muri uku kwezi?",
  "Ese ubucuruzi bwanjye bwunguka?",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setMessages((prev) => [
          ...prev,
          { role: "error", text: body?.error?.message ?? "The AI Assistant is temporarily unavailable." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: body.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "error", text: "Something went wrong. Please try again." }]);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => sendMessage(question)}
              className="rounded-full bg-chip-surface px-3 py-1.5 text-body-sm text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {question}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex items-start gap-2.5", message.role === "user" && "flex-row-reverse")}
            >
              {message.role !== "error" ? (
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    message.role === "user" ? "bg-primary-deep text-on-primary" : "bg-icon-chip text-primary"
                  )}
                >
                  {message.role === "user" ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
                </span>
              ) : (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-3.5" />
                </span>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-body-sm",
                  message.role === "user"
                    ? "bg-primary-deep text-on-primary"
                    : message.role === "error"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-chip-surface text-text-dark"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isSending ? <p className="text-caption text-text-muted">bTrack AI is thinking...</p> : null}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask bTrack AI..."
          className="h-12"
          disabled={isSending}
        />
        <Button type="submit" size="icon-lg" disabled={isSending || !input.trim()} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
