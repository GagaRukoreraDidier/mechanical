"use client";

/**
 * Customer Messages page
 *
 * Displays conversations the customer has with admin or providers
 * through the MHSG platform messaging layer.
 */

import { useState } from "react";
import useSWR from "swr";
import PageHeading from "@/components/layout/PageHeading";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { MessageCircle, Send, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_name: string;
  sender_role: string;
  body: string;
  created_at: string;
  is_read: boolean;
  request_id?: string;
  request_ref?: string;
}

interface Thread {
  thread_id: string;
  with_user: string;
  with_role: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  request_ref?: string;
  messages: Message[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CustomerMessagesPage() {
  const { data: threads, isLoading } = useSWR<Thread[]>("/api/v1/messaging/threads/");
  const [selected, setSelected] = useState<Thread | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const filtered = (threads ?? []).filter(
    (t) =>
      t.with_user.toLowerCase().includes(search.toLowerCase()) ||
      (t.request_ref ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!draft.trim() || !selected) return;
    // POST /api/v1/messaging/threads/{thread_id}/messages/
    setDraft("");
  };

  return (
    <div className="space-y-5">
      <PageHeading
        title="Messages"
        subtitle="Your conversations with MHSG administrators and service providers."
        icon={<MessageCircle className="w-5 h-5" style={{ color: "#23A6BD" }} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 520 }}>
        {/* Thread list */}
        <Card className="lg:col-span-1 flex flex-col p-0 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search conversations…"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              <div className="p-6 text-center text-[13px] text-gray-400">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-gray-400">
                No conversations yet.
              </div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.thread_id}
                  onClick={() => setSelected(t)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-[#f5f6f8] transition-colors",
                    selected?.thread_id === t.thread_id && "bg-[#f0fafc]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#010313] truncate">
                        {t.with_user}
                      </p>
                      {t.request_ref && (
                        <p className="text-[11px] text-[#1a6c80] truncate">
                          Re: {t.request_ref}
                        </p>
                      )}
                      <p className="text-[12px] text-gray-500 truncate mt-0.5">
                        {t.last_message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] text-gray-400">
                        {timeAgo(t.last_message_at)}
                      </span>
                      {t.unread_count > 0 && (
                        <span
                          className="text-[10px] font-bold text-white rounded-full px-1.5 py-0.5 tabular-nums"
                          style={{ backgroundColor: "#23A6BD" }}
                        >
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message pane */}
        <Card className="lg:col-span-2 flex flex-col p-0 overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageCircle className="w-10 h-10" />}
                title="Select a conversation"
                description="Choose a thread from the left to view and reply to messages."
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-semibold"
                  style={{ backgroundColor: "#23A6BD" }}
                >
                  {selected.with_user.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#010313]">
                    {selected.with_user}
                  </p>
                  <p className="text-[11px] text-gray-500 capitalize">
                    {selected.with_role.replace(/_/g, " ")}
                    {selected.request_ref && ` · ${selected.request_ref}`}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {(selected.messages ?? []).length === 0 ? (
                  <p className="text-center text-[13px] text-gray-400 mt-8">
                    No messages in this thread yet.
                  </p>
                ) : (
                  selected.messages.map((m) => {
                    const isMe = m.sender_role === "customer";
                    return (
                      <div
                        key={m.id}
                        className={cn("flex", isMe ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[72%] rounded-2xl px-4 py-2.5",
                            isMe
                              ? "text-[#010313] rounded-br-sm"
                              : "bg-white border border-gray-200 text-[#010313] rounded-bl-sm"
                          )}
                          style={isMe ? { backgroundColor: "#d0f1f7" } : undefined}
                        >
                          <p className="text-[13px] leading-relaxed">{m.body}</p>
                          <p className="text-[11px] text-gray-500 mt-1 text-right">
                            {timeAgo(m.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compose */}
              <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message… (Enter to send)"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-[13px] text-[#010313] focus:outline-none focus:border-[#23A6BD] transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="self-end px-4 py-2 rounded-xl text-[#010313] text-[13px] font-semibold disabled:opacity-40 transition-opacity"
                  style={{ backgroundColor: "#23A6BD" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
