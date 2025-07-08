"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "@/components/chat-input"
import {
  Plus,
  Clock,
  MoreHorizontal,
  User,
  ChevronDown,
} from "lucide-react"

interface ChatSidebarProps {
  selectedFile: File | null;
}

export default function ChatSidebar({ selectedFile }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  // Auto-scroll to bottom on first load and when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r bg-background flex flex-col h-full">
      {/* Chat Header - Fixed at top */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <h2 className="text-sm font-medium truncate flex-1">Presentation Viewer Discussion</h2>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Clock className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Flex container with auto overflow for messages */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Chat Messages - Scrollable area */}
        <ScrollArea 
          className="flex-1 px-4 overflow-auto" 
          ref={scrollAreaRef}
          onScroll={(e) => {
            const target = e.currentTarget;
            const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 30;
            setShowScrollButton(isScrolledUp);
          }}
        >
          <div className="space-y-4">
            {/* Example Messages */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Make a ui as per the attached screenshot. in the viewing pane on the right, I want this to be for
                  viewing pdf presentations, with a vertically laid out page thumbnails for navigation, like the
                  second screenshot. Except thumbnails should be on the right hand side. Use dummy pictures for now
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                v0
              </div>
              <div className="flex-1">
                <p className="text-sm mb-3">
                  I&apos;ll create a PDF presentation viewer interface based on your screenshots. The layout will have a
                  main viewing area on the left and thumbnail navigation on the right side, similar to the v0
                  interface structure but adapted for PDF presentations.
                </p>
              </div>
            </div>

            {/* Dynamic Messages from State */}
            {messages.map((msg, index) => (
              <div key={index} className="flex gap-3">
                {msg.type === 'user' ? (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                    v0
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={() => scrollToBottom()}
            size="icon"
            className="absolute bottom-4 right-4 rounded-full h-10 w-10 bg-black text-white hover:bg-gray-800 shadow-lg z-10"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div>
        {!selectedFile && (
          <div className="px-4 py-3 text-sm text-muted-foreground text-center bg-muted/20">
            Please select a PowerPoint file to start chatting
          </div>
        )}
        <ChatInput 
          isLoading={false}
          disabled={!selectedFile}
          onSendMessage={(message) => {
            // Dummy handler logic - will be implemented later
            console.log("Message sent:", message);
            setMessages([...messages, { type: 'user', content: message }]);
            // Simulate AI response
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: "This is a placeholder response. The actual implementation will come later." 
              }]);
              // Auto-scroll to bottom after adding new message
              setTimeout(scrollToBottom, 100);
            }, 1000);
          }}
        />
      </div>
    </div>
  )
} 