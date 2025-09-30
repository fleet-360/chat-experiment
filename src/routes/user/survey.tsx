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

type FormValues = Record<string, number | string> & {
  gender?: string;
  age?: number;
};

type LikertConfig = {
  name: string;
  i18nKey: string;
  scale: number; // e.g., 7
  leftKey: string;
  rightKey: string;
  defaultLabel: string;
  leftDefault: string;
  rightDefault: string;
};

type SemanticConfig = {
  name: string;
  i18nKey: string;
  scale: number; // e.g., 7
  leftKey: string;
  rightKey: string;
  defaultLabel: string;
  leftDefault: string;
  rightDefault: string;
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

  const likert = (
    name: string,
    i18nKey: string,
    leftKey: string,
    rightKey: string,
    defaultLabel: string,
    leftDefault: string,
    rightDefault: string,
    scale = 7
  ): LikertConfig => ({
    name,
    i18nKey,
    scale,
    leftKey,
    rightKey,
    defaultLabel,
    leftDefault,
    rightDefault,
  });

  const semantic = (
    name: string,
    i18nKey: string,
    leftKey: string,
    rightKey: string,
    defaultLabel: string,
    leftDefault: string,
    rightDefault: string,
    scale = 7
  ): SemanticConfig => ({
    name,
    i18nKey,
    scale,
    leftKey,
    rightKey,
    defaultLabel,
    leftDefault,
    rightDefault,
  });

  // Step definitions based on requested pages
  const groupCompetence = [
    semantic(
      "q6",
      "survey.q6",
      "survey.incapable",
      "survey.capable",
      "The group was incapable/capable",
      "Incapable",
      "Capable"
    ),
    semantic(
      "q7",
      "survey.q7",
      "survey.ineffective",
      "survey.effective",
      "The group worked ineffectively/effectively",
      "Ineffective",
      "Effective"
    ),
    semantic(
      "q8",
      "survey.q8",
      "survey.incompetent",
      "survey.competent",
      "The group was incompetent/competent",
      "Incompetent",
      "Competent"
    ),
  ];
  const groupWarmth = [
    semantic(
      "q9",
      "survey.q9",
      "survey.unfriendly",
      "survey.friendly",
      "The group felt unfriendly/friendly",
      "Unfriendly",
      "Friendly"
    ),
    semantic(
      "q10",
      "survey.q10",
      "survey.cold",
      "survey.warm",
      "The group seemed cold/warm",
      "Cold",
      "Warm"
    ),
    semantic(
      "q11",
      "survey.q11",
      "survey.unapproachable",
      "survey.approachable",
      "The group was unapproachable/approachable",
      "Unapproachable",
      "Approachable"
    ),
  ];
  const comfort = [
    likert(
      "q12",
      "survey.q12",
      "survey.notAtAll",
      "survey.extremely",
      "How comfortable did you feel communicating with the other members?",
      "Not at all",
      "Extremely"
    ),
  ];
  const expression = [
    likert(
      "q13",
      "survey.q13",
      "survey.notAtAll",
      "survey.extremely",
      "Were you able to express all of your ideas?",
      "Not at all",
      "Extremely"
    ),
    likert(
      "q14",
      "survey.q14",
      "survey.notAtAll",
      "survey.extremely",
      "How often did you not present an idea because you were worried about what your partners would comment on it?",
      "Not at all",
      "Extremely"
    ),
  ];
  const groupDynamics = [
    likert(
      "q15",
      "survey.q15",
      "survey.stronglyDisagree",
      "survey.stronglyAgree",
      "We showed positive attitudes towards one another.",
      "Strongly disagree",
      "Strongly agree"
    ),
    likert(
      "q27",
      "survey.q27",
      "survey.stronglyDisagree",
      "survey.stronglyAgree",
      "It is safe to take a risk on this team.",
      "Strongly disagree",
      "Strongly agree"
    ),
  ];
  const groupEval = [
    semantic(
      "q20",
      "survey.q20",
      "survey.disliked",
      "survey.liked",
      "I disliked this group/I liked this group.",
      "Disliked",
      "Liked"
    ),
    semantic(
      "q21",
      "survey.q21",
      "survey.notWorkAgain",
      "survey.workAgain",
      "I would not want to work with this group again/I would like to work with this group again.",
      "Would not work again",
      "Would work again"
    ),
  ];
  const playfulness = [
    likert(
      "q22",
      "survey.q22",
      "survey.stronglyDisagree",
      "survey.stronglyAgree",
      "I found the interaction playful.",
      "Strongly disagree",
      "Strongly agree"
    ),
    likert(
      "q23",
      "survey.q23",
      "survey.stronglyDisagree",
      "survey.stronglyAgree",
      "Participating in the task felt fun.",
      "Strongly disagree",
      "Strongly agree"
    ),
    likert(
      "q24",
      "survey.q24",
      "survey.stronglyDisagree",
      "survey.stronglyAgree",
      "Participating in the task aroused my imagination.",
      "Strongly disagree",
      "Strongly agree"
    ),
  ];
  const emojiUse = [
    likert(
      "q25",
      "survey.q25",
      "survey.notAtAll",
      "survey.veryOften",
      "To what extent do you generally use emojis in chat conversations?",
      "Not at all",
      "Very often"
    ),
  ];
  // q26 omitted from pages per requested structure

  // Pages structure per request (without titles displayed)
  const groups = useMemo(
    () => [
      { titleKey: "", titleDefault: "", items: playfulness }, // Page 1
      { titleKey: "", titleDefault: "", items: [...comfort, ...groupDynamics] }, // Page 2 (comfort + new risk-safety + attitudes)
      { titleKey: "", titleDefault: "", items: expression }, // Page 3
      { titleKey: "", titleDefault: "", items: groupEval }, // Page 4
      { titleKey: "", titleDefault: "", items: groupCompetence }, // Page 5
      { titleKey: "", titleDefault: "", items: groupWarmth }, // Page 6
      { titleKey: "", titleDefault: "", items: emojiUse }, // Page 7 includes demographics below
    ],
    []
  );

  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === groups.length - 1; // last groups page includes demographics
  const goBack = () => setCurrentStep((s) => Math.max(0, s - 1));
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
          <CardTitle style={{ marginBottom: "20px" }}>
            {t("survey.title")}
          </CardTitle>
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
          <Button onClick={goBack} variant="secondary" disabled={isSubmitting}>
            {t("survey.back")}
          </Button>
          {!isLastStep ? (
            <Button
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
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground w-28 shrink-0 text-start">
          {leftLabel}
        </div>
        <div className="flex items-center justify-center gap-3 flex-1">
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
        <div className="text-xs text-muted-foreground w-28 shrink-0 text-end">
          {rightLabel}
        </div>
      </div>
    </div>
  );
}
