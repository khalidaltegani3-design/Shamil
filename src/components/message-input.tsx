"use client";

import type { Message } from "@/lib/types";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  chatId: string;
  onSendMessage: (chatId: string, content: string, quotedMessage?: Message) => void;
  quotedMessage?: Message;
  clearQuotedMessage: () => void;
}

export default function MessageInput({ chatId, onSendMessage, quotedMessage, clearQuotedMessage }: MessageInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const emojis = ['😀', '😂', '😍', '🤔', '😢', '🔥', '❤️', '👍', '🙏', '🎉'];

  const handleSend = () => {
    if (inputValue.trim() || quotedMessage) {
      onSendMessage(chatId, inputValue, quotedMessage);
      setInputValue("");
      clearQuotedMessage();
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  React.useEffect(() => {
    if (quotedMessage) {
        inputRef.current?.focus();
    }
  }, [quotedMessage]);

  return (
    <div className="flex flex-col gap-2">
      {quotedMessage && (
        <div className="flex items-center justify-between bg-primary/10 p-2 rounded-md border-l-4 border-primary">
          <div className="flex-1 truncate">
            <p className="font-semibold text-primary text-sm">Replying to {quotedMessage.sender.name}</p>
            <p className="text-sm text-muted-foreground truncate">{quotedMessage.content}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearQuotedMessage}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-start gap-2">
        <Textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-background focus-visible:ring-1"
          rows={1}
        />
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setInputValue(prev => prev + emoji)}
                    className="text-xl p-1 rounded-md hover:bg-accent transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button onClick={handleSend} size="icon" disabled={!inputValue.trim() && !quotedMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
