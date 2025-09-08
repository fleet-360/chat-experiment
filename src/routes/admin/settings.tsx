import { useMemo, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ArrowLeft, Minus, Plus, Save } from "lucide-react";
import { Link } from "react-router";
import type { ChatGroupType, Experiment } from "../../types/app";
import EmojiPickerButton from "../../components/chat/EmojiPickerButton";
import { insertAtCaret as insertAtCaretUtil } from "../../components/chat/emojiUtils";
import { fromSeconds, toSeconds } from "../../lib/helpers/dateTime.helper";
import { useExperiment } from "../../context/ExperimentContext";

export type FormValues = {
  usersInGroup: number;
  totalDuration: string; // mm:ss
  messages: { groupType: ChatGroupType; message: string; at: string }[]; // at in mm:ss
  timers: { time: string }[]; // time in mm:ss
};


export default function AdminSettingsPage() {
  const experiment = useExperiment()
  const loaderDefaults = useMemo(() => formatSettings(experiment.data),[experiment.data]);
  const methods = useForm<FormValues>({
    defaultValues: loaderDefaults ?? {
      usersInGroup: 4,
      totalDuration: "10:00",
      messages: [],
      timers: [],
    },
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const messagesFa = useFieldArray({ control, name: "messages" });
  const timersFa = useFieldArray({ control, name: "timers" });

  const watchedTimers = watch("timers");
  const sumTimers = useMemo(
    () => (watchedTimers || []).reduce((acc, t) => acc + toSeconds(t.time), 0),
    [watchedTimers]
  );
  // derived total in seconds available from current form value

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const messageRefs = useMemo(() => [] as (HTMLInputElement | null)[], []);

  const onAddMessage = () =>
    messagesFa.append({ groupType: "emojy", message: "", at: "00:00" });
  const onAddTimer = () => timersFa.append({ time: "01:00" });

  const onSubmit = async (values: FormValues) => {
    setSaveMessage(null);
    const total = toSeconds(values.totalDuration);
    const sum = values.timers.reduce((acc, t) => acc + toSeconds(t.time), 0);
    if (sum !== total) {
      setSaveMessage(
        `Total timers (${fromSeconds(
          sum
        )}) must equal total duration (${fromSeconds(total)}).`
      );
      return;
    }

    setSaveMessage("Settings saved.");
  };
  
  return (
    <FormProvider {...methods}>
      <Card className="p-4 space-y-6 max-w-2xl m-auto overflow-visible">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/chat"
            className="inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium min-w-56">
                Participants per group
              </label>
              <input
                type="number"
                min={1}
                className="w-24 rounded-md border px-3 py-2 text-sm bg-background"
                {...register("usersInGroup", { valueAsNumber: true })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Each group includes the number shown above.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <label className="text-sm font-medium min-w-56">
                Total duration
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="mm:ss"
                className="w-24 rounded-md border px-3 py-2 text-sm bg-background"
                {...register("totalDuration")}
              />
              <span className="text-xs text-muted-foreground">e.g. 10:00</span>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Chat Messages plan</h2>
            <Card className="p-4 space-y-3 border rounded-md overflow-visible">
              {messagesFa.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[180px_1fr_120px_36px] items-center gap-2"
                >
                  <Select
                    value={watch(`messages.${idx}.groupType`) as ChatGroupType}
                    onValueChange={(v) =>
                      setValue(`messages.${idx}.groupType`, v as ChatGroupType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emojy">emoji group</SelectItem>
                      <SelectItem value="noEmojy">non emoji group</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="message"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      {...register(`messages.${idx}.message` as const)}
                   
                      ref={(el) => {
                        // let RHF handle ref
                        register(`messages.${idx}.message`).ref(el);
                        messageRefs[idx] = el;
                      }}
                    />
                    <EmojiPickerButton
                      onPick={(emoji) => {
                        const current = watch(`messages.${idx}.message`) ?? "";
                        const el = messageRefs[idx] ?? null;
                        const next = insertAtCaretUtil(el, current, emoji);
                        setValue(`messages.${idx}.message`, next, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="mm:ss"
                    className="w-[120px] rounded-md border px-3 py-2 text-sm bg-background"
                    {...register(`messages.${idx}.at` as const)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remove"
                    onClick={() => messagesFa.remove(idx)}
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
              ))}
              <div>
                <Button type="button" variant="outline" onClick={onAddMessage}>
                  <Plus className="size-4" /> Add new message
                </Button>
              </div>
            </Card>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Chat Timers plan</h2>
            <Card className="p-4 space-y-3 border rounded-md">
              {timersFa.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[180px_120px_36px] items-center gap-2"
                >
                  <div className="text-sm text-muted-foreground">Timer</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="mm:ss"
                    className="w-[120px] rounded-md border px-3 py-2 text-sm bg-background"
                    {...register(`timers.${idx}.time` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remove"
                    onClick={() => timersFa.remove(idx)}
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
              ))}
              <div>
                <Button type="button" variant="outline" onClick={onAddTimer}>
                  <Plus className="size-4" /> Add new timer
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Total timers must be {watch("totalDuration")} (current{" "}
                {fromSeconds(sumTimers)})
              </div>
            </Card>
          </section>

          {saveMessage && (
            <div className="text-sm text-muted-foreground">{saveMessage}</div>
          )}
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="min-w-40">
              <Save className="size-4" /> Save
            </Button>
          </div>
        </form>
      </Card>
    </FormProvider>
  );
}

// Route loader: fetch current experiment settings and map to RHF defaults
export function formatSettings(data : Experiment) {
 
    const settings = data?.settings || {};
    const usersInGroup = Number(settings?.usersInGroup ?? 4);
    const totalDuration = fromSeconds(Number(settings?.totalDuration ?? 600));
    const messagesArr: any[] = Array.isArray(data?.ChatMessagesplan)
      ? data.ChatMessagesplan
      : [];
    const timersArr: any[] = Array.isArray(data?.ChatTimersplan)
      ? data.ChatTimersplan
      : [];
    const messages = messagesArr.map((m) => ({
      groupType: (m?.groupType as ChatGroupType) ?? "emojy",
      message: String(m?.message ?? ""),
      at: fromSeconds(Number(m?.timeInChat ?? 0)),
    }));
    const timers = timersArr.map((t) => ({
      time: fromSeconds(Number(t?.time ?? 0)),
    }));
    const result: FormValues = {
      usersInGroup,
      totalDuration,
      messages,
      timers,
    };
    return result;

}
