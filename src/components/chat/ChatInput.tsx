import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Smile, Send } from "lucide-react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";

type ChatInputProps = {
  disabled?: boolean;
  onSend: (message: string, options?: { asAdmin?: boolean }) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  withEmojy?: boolean;
  showAdminSwitch?: boolean;
};

export default function ChatInput({
  disabled,
  onSend,
  placeholder,
  className,
  withEmojy = true,
  showAdminSwitch = false,
}: ChatInputProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [sendAsAdmin, setSendAsAdmin] = useState(false);

  type FormValues = { text: string };
  const { register, handleSubmit, setValue, watch, reset,formState } = useForm<FormValues>({
    defaultValues: { text: "" },
  });
  const watchedText = watch("text");


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
    const current = watchedText ?? "";
    if (!el) {
      setValue("text", current + text, { shouldDirty: true });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? start;
    const next = current.slice(0, start) + text + current.slice(end);
    setValue("text", next, { shouldDirty: true });
    queueMicrotask(() => {
      try {
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      } catch {}
    });
  };

  const onSubmit = async () => {
    const v = (watchedText ?? "").trim();
    if (!v || disabled) return;
    reset({ text: "" });
    await onSend(v, { asAdmin: showAdminSwitch ? sendAsAdmin : false });
    setShowPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className={className}>
      <div
        ref={containerRef}
        className="relative flex items-center rounded-full border ps-4 pe-1 py-1 bg-background"
      >
        {(() => {
          const { ref, ...field } = register("text");
          return (
            <textarea
              {...field}
              ref={(el) => {
                (ref as (instance: HTMLTextAreaElement | null) => void)(el);
                textareaRef.current = el;
              }}
              placeholder={placeholder ?? t("chat.placeholder")}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
              className="flex-1 bg-transparent resize-none outline-none border-0 h-10 leading-6 text-sm ps-0 pe-0"
            />
          );
        })()}
        <div className="flex items-center gap-1 ms-2">
          <div className="relative">
            {withEmojy && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title={t("chat.emojiPicker", { defaultValue: "emoji picker" })}
                onClick={() => setShowPicker((s) => !s)}
                className="rounded-full"
                aria-expanded={showPicker}
                aria-haspopup="dialog"
              >
                <Smile className="size-5" />
              </Button>
            )}
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
          {showAdminSwitch && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground me-1 select-none">
              <span>{sendAsAdmin ? t("admin.admin", { defaultValue: "Admin" }) : t("common.user", { defaultValue: "User" })}</span>
              <Switch
                checked={sendAsAdmin}
                onCheckedChange={setSendAsAdmin}
                aria-label="Send as admin"
              />
            </label>
          )}
          <Button
            type="submit"
            size="icon"
            disabled={
              disabled || !(watchedText ?? "").trim() || formState.isSubmitting
            }
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
