import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { Button } from "../ui/button";
import { Smile } from "lucide-react";

type EmojiPickerButtonProps = {
  onPick: (emoji: string) => void;
  className?: string;
  disabled?: boolean;
};

export default function EmojiPickerButton({ onPick, className, disabled }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (e.target instanceof Node && containerRef.current.contains(e.target)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        title="emoji picker"
      >
        <Smile className="size-5" />
      </Button>
      {open && (
        <div className="absolute z-50 end-0 bottom-full mb-2 shadow-sm rounded-xl overflow-hidden border bg-background">
          <EmojiPicker
            onEmojiClick={(emoji) => {
              onPick(emoji.emoji);
              setOpen(false);
            }}
            autoFocusSearch={false}
            width={320}
            height={380}
            skinTonesDisabled
            lazyLoadEmojis
            previewConfig={{showPreview:false}}
            emojiStyle={EmojiStyle.APPLE}
          />
        </div>
      )}
    </div>
  );
}

