"use client";

import { useState } from "react";
import { Mic, ImageIcon, ZoomIn } from "lucide-react";
import { Message } from "@/lib/supabase/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

function isInternalData(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  // Markdown code blocks (```json ... ``` or ``` ... ```)
  if (trimmed.startsWith("```")) return true;
  // Plain JSON object
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try { JSON.parse(trimmed); return true; } catch { /* not valid json */ }
  }
  return false;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === "outbound";
  const [imgExpanded, setImgExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const isImage = message.type === "image" || message.type === "imageMessage";
  const mediaProxyUrl = message.media_url
    ? `/api/media?url=${encodeURIComponent(message.media_url)}`
    : null;
  const isVoice = message.type === "ptt" || message.type === "audio";
  const hasMedia = !!message.media_url;

  // Don't show message text if it's raw JSON (webhook payload)
  const textContent = message.message && !isInternalData(message.message) ? message.message : null;

  return (
    <>
      <div
        className={cn(
          "flex animate-message-in",
          isOutbound ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[70%] rounded-2xl shadow-sm overflow-hidden",
            isImage && hasMedia ? "p-1" : "px-4 py-2.5",
            isOutbound
              ? "bg-[#8B1F1F] text-white rounded-tr-sm"
              : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
          )}
        >
          {/* Image message */}
          {isImage && hasMedia && (
            <div className="relative group">
              {!imgError ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaProxyUrl!}
                    alt="Image"
                    className="rounded-xl max-w-full max-h-64 object-cover cursor-pointer"
                    onClick={() => setImgExpanded(true)}
                    onError={() => setImgError(true)}
                  />
                  <button
                    onClick={() => setImgExpanded(true)}
                    className="absolute top-2 right-2 bg-black/40 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ZoomIn className="h-3.5 w-3.5 text-white" />
                  </button>
                </>
              ) : (
                <div className={cn(
                  "flex items-center justify-center gap-2 min-h-[80px] rounded-xl px-4",
                  isOutbound ? "bg-red-900/30 text-red-100" : "bg-slate-100 text-slate-400"
                )}>
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs italic">Média indisponible</span>
                </div>
              )}
              {textContent && (
                <p className={cn("text-sm px-3 py-1.5", isOutbound ? "text-white" : "text-slate-800")}>
                  {textContent}
                </p>
              )}
              <p className={cn("text-right text-[10px] px-2 pb-1.5 leading-none", isOutbound ? "text-red-100" : "text-slate-400")}>
                {formatRelativeTime(message.created_at)}
              </p>
            </div>
          )}

          {/* Image placeholder (no URL) */}
          {isImage && !hasMedia && (
            <div className={cn("flex items-center gap-2 text-sm", isOutbound ? "text-red-100" : "text-slate-400")}>
              <ImageIcon className="h-4 w-4" />
              <span className="italic">[Image]</span>
            </div>
          )}

          {/* Voice message */}
          {isVoice && (
            <div className="flex flex-col gap-1.5">
              {hasMedia && !audioError ? (
                <audio
                  controls
                  src={mediaProxyUrl!}
                  className="h-10 w-full min-w-[220px]"
                  onError={() => setAudioError(true)}
                />
              ) : (
                <div className={cn("flex items-center gap-2 text-sm", isOutbound ? "text-red-100" : "text-slate-400")}>
                  <Mic className="h-4 w-4" />
                  <span className="italic">{audioError ? "Audio indisponible" : "[Message vocal]"}</span>
                </div>
              )}
              <p className={cn("text-right text-[10px] leading-none", isOutbound ? "text-red-100" : "text-slate-400")}>
                {formatRelativeTime(message.created_at)}
              </p>
            </div>
          )}

          {/* Regular text (non-image, non-voice) */}
          {!isImage && (
            <>
              {textContent && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{textContent}</p>
              )}
              <p className={cn("text-right text-[10px] mt-1 leading-none", isOutbound ? "text-red-100" : "text-slate-400")}>
                {formatRelativeTime(message.created_at)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {imgExpanded && mediaProxyUrl && !imgError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImgExpanded(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaProxyUrl}
            alt="Image agrandie"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
