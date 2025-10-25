import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { saveSurveyAnswers } from "../../services/experimentService";
import { useNavigate } from "react-router";
import { useExperiment } from "../../context/ExperimentContext";
import { surveyGroups } from "../../lib/surveyConfig";

type FormValues = Record<string, number | string> & {
  gender?: string;
  age?: number;
};

export default function SurveyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { experimentId } = useExperiment();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {},
  });

  const submit = async (data: FormValues) => {
    try {
      const userId =
        (typeof window !== "undefined" && localStorage.getItem("userId")) ||
        "anonymous";
      await saveSurveyAnswers(
        userId,
        data as Record<string, unknown>,
        experimentId
      );
      navigate("/user/thank-you");
    } catch (e) {
      console.error("Failed to save survey answers", e);
      alert(t("survey.saveFailed"));
    }
  };

  // Use the extracted survey configuration
  const groups = useMemo(() => surveyGroups, []);

  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === groups.length - 1; // last groups page includes demographics
  const goNext = () => {
    // Validate current page required answers
    const pageItems = groups[currentStep]?.items ?? [];
    const values = getValues();
    const missing: string[] = [];
    for (const q of pageItems) {
      const v = values[q.name as keyof FormValues];
      if (v == null || v === "") missing.push(q.i18nKey);
    }
    if (missing.length > 0) {
      const lines = missing.map((k) => `- ${t(k as any)}`).join("\n");
      alert(`${t("survey.validationMissing")}\n${lines}`);
      return;
    }
    if (!isLastStep) setCurrentStep((s) => s + 1);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          {currentStep === 0 ? (
            <CardTitle style={{ marginBottom: "20px" }}>
              {t("survey.title")}
            </CardTitle>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-8">
          {groups.map((g, gi) => {
            if (gi !== currentStep) return null;
            return (
              <section key={gi} className="space-y-4">
                <div className="space-y-3">
                  {g.items.map((q) => (
                    <LikertRow
                      key={q.name}
                      name={q.name}
                      label={t(q.i18nKey as any)}
                      leftLabel={t(q.leftKey as any)}
                      rightLabel={t(q.rightKey as any)}
                      scale={q.scale}
                      register={register}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {isLastStep && (
            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">
                    {t("survey.gender")}
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={(field.value as string) ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("survey.chooseOption")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">
                            {t("survey.genderFemale")}
                          </SelectItem>
                          <SelectItem value="male">
                            {t("survey.genderMale")}
                          </SelectItem>
                          <SelectItem value="prefer_not_say">
                            {t("survey.genderPreferNotSay")}
                          </SelectItem>
                          <SelectItem value="other">
                            {t("survey.genderOther")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {t("survey.age")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    {...register("age")}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                <div className="mb-1">{t("survey.finalThanks")}</div>
                <div>{t("survey.finalInstruction")}</div>
              </div>
            </section>
          )}
        </CardContent>
        <CardFooter className="w-full gap-2">
          {!isLastStep ? (
            <Button
              style={{ cursor: "pointer" }}
              onClick={goNext}
              className="ms-auto"
              disabled={isSubmitting}
            >
              {t("survey.next")}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(submit)}
              className="ms-auto"
              disabled={isSubmitting}
            >
              {t("survey.submit")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function LikertRow({
  name,
  label,
  leftLabel,
  rightLabel,
  scale,
  register,
}: {
  name: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  scale: number;
  register: ReturnType<typeof useForm>["register"];
}) {
  const options = Array.from({ length: scale }, (_, i) => i + 1);
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium mb-3">{label}</div>
      <div className="flex items-center justify-center align-middle gap-1 flex-nowrap">
        <div className="text-xs text-muted-foreground shrink-0 text-start whitespace-nowrap me-1">
          {leftLabel}
        </div>
        <div className="flex items-center justify-center gap-3 mx-[10px]">
          {options.map((n) => (
            <label
              key={n}
              className="inline-flex flex-col items-center text-xs"
            >
              <input
                type="radio"
                value={n}
                {...register(name, { required: false })}
                className="size-4 accent-primary"
              />
              <span className="mt-1 opacity-70">{n}</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground shrink-0 text-end whitespace-nowrap ms-1">
          {rightLabel}
        </div>
      </div>
    </div>
  );
}
