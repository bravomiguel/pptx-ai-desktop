"use client";

import { useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";

      // Calculate line height (approximation based on font size and padding)
      const lineHeight = 24; // Approximate line height in pixels
      const maxHeight = lineHeight * 9; // Maximum height for 9 lines

      // Set the height based on content, but cap it at maxHeight
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;

      // Add overflow scrolling if content exceeds maxHeight
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSendMessage?.(message);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex w-full pb-6 px-4 pt-3">
      <div className="max-w-3xl mx-auto w-full relative border border-gray-300 rounded-lg ring-offset-background transition-all focus-within:ring-2 focus-within:ring-gray-600">
        {/* Container for textarea and button */}
        <div className="relative p-2 pb-3">
          {/* Textarea with bottom padding for button */}
          <div className="pb-8">
            <Textarea
              placeholder="Ask a follow-up..."
              disabled={isLoading}
              className="px-2 shadow-none min-h-[24px] max-h-[216px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              style={{ overflowY: "auto" }}
            />
          </div>

          {/* Buttons positioned at the bottom right within the container */}
          <div className="absolute bottom-2 right-2 flex gap-2">
            {/* Paperclip button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full h-8 w-8 hover:bg-gray-100 flex items-center justify-center"
              onClick={() => {
                /* Handle attachment logic */
                console.log("Attachment button clicked");
              }}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Send/Stop button */}
            {isLoading ? (
              <Button
                onClick={() => {
                  /* Handle stop logic */
                }}
                className="rounded-full h-8 w-8 border bg-gray-900 hover:bg-gray-700 flex items-center justify-center"
              >
                <svg
                  className="absolute h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="rounded-full h-8 w-8 border bg-gray-900 hover:bg-gray-700 flex items-center justify-center"
                disabled={isLoading || !message.trim()}
              >
                <ArrowUp className="h-5 w-5 text-white" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
