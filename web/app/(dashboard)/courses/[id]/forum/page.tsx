"use client";

import Button from "@/components/Button";
import api from "@/lib/api";
import parseErrorMessage from "@/lib/parseErrorMessage";
import { components } from "@universe/api-types";
import clsx from "clsx";
import { ArrowLeft, Bot, Send, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Message = components["schemas"]["ForumMessageResponse"];

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.isAiResponse;

  return (
    <div className={clsx("flex gap-3", isAI ? "flex-row" : "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={clsx(
          `
            flex size-8 shrink-0 items-center justify-center rounded-full
            text-xs font-bold
          `,
          isAI
            ? "bg-linear-to-br from-primary to-primary-light text-white"
            : "bg-accent/20 text-accent",
        )}
      >
        {isAI ? <Bot size={16} /> : <User size={14} />}
      </div>

      <div className={clsx("max-w-[70%]", !isAI && "flex flex-col items-end")}>
        {/* Author */}
        <p className="mb-1 text-xs text-muted">
          {isAI ? "UniVerse AI" : message.authorName}
        </p>

        {/* Bubble */}
        <div
          className={clsx(
            "rounded-2xl px-4 py-3 text-sm/relaxed shadow-sm",
            isAI
              ? `
                border border-primary/20 bg-linear-to-br from-primary/10
                to-primary-light/10 text-foreground
              `
              : "bg-primary text-white",
          )}
        >
          {message.content}
        </div>

        <p className="mt-0.5 text-[10px] text-muted">
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
      </div>
    </div>
  );
}

export default function CourseForum({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: messages,
    isLoading,
    refetch,
  } = api.useQuery("get", "/courses/{courseId}/forum/messages", {
    params: { path: { courseId } },
  });

  const sendMessage = api.useMutation(
    "post",
    "/courses/{courseId}/forum/messages",
    {
      onSuccess: () => {
        setContent("");
        setSending(false);
        refetch();
      },
      onError: (e) => {
        setSending(false);
        toast.error(parseErrorMessage(e, "Failed to send message"));
      },
    },
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    sendMessage.mutate({
      params: { path: { courseId } },
      body: { content: content.trim() },
    });
  };

  return (
    <div
      className={clsx(
        "flex flex-col",
        isEmbedded ? "h-[500px]" : "h-[calc(100vh-10rem)]",
      )}
    >
      {!isEmbedded && (
        <Link
          href={`/courses/${courseId}`}
          className="
            mb-4 inline-flex items-center gap-1.5 text-sm text-muted
            hover:text-foreground
          "
        >
          <ArrowLeft size={14} /> Back to Course
        </Link>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="
          flex size-10 items-center justify-center rounded-xl bg-linear-to-br
          from-primary to-primary-light text-white
        ">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-foreground">Course Forum</h2>
          <p className="text-xs text-muted">AI-powered discussion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="
        flex-1 overflow-y-auto rounded-2xl border border-border bg-white p-4
        shadow-sm
      ">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="
              size-7 animate-spin rounded-full border-2 border-border
              border-t-primary
            " />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="
            flex h-full flex-col items-center justify-center text-muted
          ">
            <Bot size={40} className="mb-3 text-primary/30" />
            <p className="text-sm font-semibold">No messages yet</p>
            <p className="text-xs">Start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="
          mt-3 flex gap-2 rounded-2xl border border-border bg-white p-3
          shadow-sm
        "
      >
        <input
          className="
            flex-1 bg-transparent px-2 text-sm text-foreground
            placeholder:text-muted
            focus:outline-none
          "
          placeholder="Ask a question or start a discussion…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={sending || !content.trim()}
          className="min-w-0! px-4! py-2!"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
