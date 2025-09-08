import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Smile, Send } from "lucide-react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onSend: () => Promise<void> | void;
  placeholder?: string;
  className?: string;
};

export default function ChatInput({
  value,
  disabled,
  onChange,
  onSend,
  placeholder,
  className,
}: ChatInputProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Close picker when clicking outside
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (e.target instanceof Node && containerRef.current.contains(e.target)) return;
      setShowPicker(false);
    }
    if (showPicker) document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [showPicker]);

  const insertAtCaret = (text: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange((value ?? "") + text);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? start;
    const next = (value ?? "").slice(0, start) + text + (value ?? "").slice(end);
    onChange(next);
    queueMicrotask(() => {
      try {
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      } catch {}
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!value.trim() || disabled) return;
        await onSend();
      }}
      className={className}
    >
      <div ref={containerRef} className="relative flex items-center rounded-full border ps-4 pe-1 py-1 bg-background">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? t("chat.placeholder")}
          rows={1}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!value.trim() || disabled) return;
              await onSend();
            }
          }}
          className="flex-1 bg-transparent resize-none outline-none border-0 h-10 leading-6 text-sm ps-0 pe-0"
        />
        <div className="flex items-center gap-1 ms-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="emoji picker"
              onClick={() => setShowPicker((s) => !s)}
              className="rounded-full"
              aria-expanded={showPicker}
              aria-haspopup="dialog"
            >
              <Smile className="size-5" />
            </Button>
            {showPicker && (
              <div className="absolute z-50 end-0 bottom-full mb-2 shadow-sm rounded-xl overflow-hidden border bg-background">
                <EmojiPicker
                  onEmojiClick={(emoji) => {
                    insertAtCaret(emoji.emoji);
                    setShowPicker(false);
                  }}
                  autoFocusSearch={false}
                  width={320}
                  height={380}
                  skinTonesDisabled
                  lazyLoadEmojis
                  emojiStyle={EmojiStyle.APPLE}
                />
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !value.trim()}
            className="rounded-full"
            title={t("chat.send")}
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}

