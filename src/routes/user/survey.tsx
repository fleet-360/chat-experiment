import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { saveSurveyAnswers } from "../../services/experimentService";
import { useNavigate } from "react-router";

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
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {},
  });

  const submit = async (data: FormValues) => {
    try {
      const userId = (typeof window !== "undefined" && localStorage.getItem("userId")) || "anonymous";
      await saveSurveyAnswers(userId, data as Record<string, unknown>);
      navigate("/user/thank-you");
    } catch (e) {
      console.error("Failed to save survey answers", e);
      alert("Failed to save. Please try again.");
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

  const ideaGen = [
    likert(
      "q1",
      "survey.q1",
      "survey.notAtAll",
      "survey.extremely",
      "Overall, to what degree did you feel your group came up with creative ideas?",
      "Not at all",
      "Extremely"
    ),
    likert(
      "q2",
      "survey.q2",
      "survey.notAtAll",
      "survey.extremely",
      "To what extent do you feel the group worked well together on generating ideas?",
      "Not at all",
      "Extremely"
    ),
    likert(
      "q3",
      "survey.q3",
      "survey.notAtAll",
      "survey.extremely",
      "To what extent do you feel the group gave you a chance to express yourself during the idea generation process?",
      "Not at all",
      "Extremely"
    ),
  ];
  const ideaSelect = [
    likert(
      "q4",
      "survey.q4",
      "survey.notAtAll",
      "survey.extremely",
      "To what extent did you think the idea selected by your group was the best one?",
      "Not at all",
      "Extremely"
    ),
    likert(
      "q5",
      "survey.q5",
      "survey.notAtAll",
      "survey.extremely",
      "How satisfied are you with your group’s idea selection performance?",
      "Not at all",
      "Extremely"
    ),
  ];
  const groupCompetence = [
    semantic("q6", "survey.q6", "survey.incapable", "survey.capable", "The group was incapable/capable", "Incapable", "Capable"),
    semantic("q7", "survey.q7", "survey.ineffective", "survey.effective", "The group worked ineffectively/effectively", "Ineffective", "Effective"),
    semantic("q8", "survey.q8", "survey.incompetent", "survey.competent", "The group was incompetent/competent", "Incompetent", "Competent"),
  ];
  const groupWarmth = [
    semantic("q9", "survey.q9", "survey.unfriendly", "survey.friendly", "The group felt unfriendly/friendly", "Unfriendly", "Friendly"),
    semantic("q10", "survey.q10", "survey.cold", "survey.warm", "The group seemed cold/warm", "Cold", "Warm"),
    semantic("q11", "survey.q11", "survey.unapproachable", "survey.approachable", "The group was unapproachable/approachable", "Unapproachable", "Approachable"),
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
    likert("q15", "survey.q15", "survey.stronglyDisagree", "survey.stronglyAgree", "We showed positive attitudes towards one another.", "Strongly disagree", "Strongly agree"),
    likert("q16", "survey.q16", "survey.stronglyDisagree", "survey.stronglyAgree", "We encouraged each other.", "Strongly disagree", "Strongly agree"),
    likert("q17", "survey.q17", "survey.stronglyDisagree", "survey.stronglyAgree", "One or two members tended to dominate the discussion.", "Strongly disagree", "Strongly agree"),
    likert("q18", "survey.q18", "survey.stronglyDisagree", "survey.stronglyAgree", "Even though we didn’t have total agreement, we did reach a kind of consensus that we all accept.", "Strongly disagree", "Strongly agree"),
    likert("q19", "survey.q19", "survey.stronglyDisagree", "survey.stronglyAgree", "I was happy with how our group interacted.", "Strongly disagree", "Strongly agree"),
  ];
  const groupEval = [
    semantic("q20", "survey.q20", "survey.disliked", "survey.liked", "I disliked this group/I liked this group.", "Disliked", "Liked"),
    semantic("q21", "survey.q21", "survey.notWorkAgain", "survey.workAgain", "I would not want to work with this group again/I would like to work with this group again.", "Would not work again", "Would work again"),
  ];
  const playfulness = [
    likert("q22", "survey.q22", "survey.stronglyDisagree", "survey.stronglyAgree", "I found the interaction playful.", "Strongly disagree", "Strongly agree"),
    likert("q23", "survey.q23", "survey.stronglyDisagree", "survey.stronglyAgree", "Participating in the task felt fun.", "Strongly disagree", "Strongly agree"),
    likert("q24", "survey.q24", "survey.stronglyDisagree", "survey.stronglyAgree", "Participating in the task aroused my imagination.", "Strongly disagree", "Strongly agree"),
  ];
  const emojiUse = [
    likert("q25", "survey.q25", "survey.notAtAll", "survey.veryOften", "To what extent do you generally use emojis in chat conversations?", "Not at all", "Very often"),
  ];
  const motivation = [
    likert("q26", "survey.q26", "survey.notAtAll", "survey.extremely", "To what extent was it important for you to perform well in this study?", "Not at all", "Extremely"),
  ];

  const groups = useMemo(
    () => [
      { titleKey: "survey.ideaGenTitle", titleDefault: "Idea generation process", items: ideaGen },
      { titleKey: "survey.ideaSelectTitle", titleDefault: "Idea selection process", items: ideaSelect },
      { titleKey: "survey.groupCompetenceTitle", titleDefault: "Group Competence", items: groupCompetence },
      { titleKey: "survey.groupWarmthTitle", titleDefault: "Group Warmth", items: groupWarmth },
      { titleKey: "survey.groupComfortTitle", titleDefault: "Comfort", items: comfort },
      { titleKey: "survey.groupExpressionTitle", titleDefault: "Expression", items: expression },
      { titleKey: "survey.groupDynamicsTitle", titleDefault: "Group dynamics", items: groupDynamics },
      { titleKey: "survey.groupEvalTitle", titleDefault: "Group evaluation", items: groupEval },
      { titleKey: "survey.playfulnessTitle", titleDefault: "Perceived playfulness", items: playfulness },
      { titleKey: "survey.emojiUseTitle", titleDefault: "Emoji use", items: emojiUse },
      { titleKey: "survey.motivationTitle", titleDefault: "Motivation", items: motivation },
    ],
    []
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("survey.title", { defaultValue: "Survey" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {groups.map((g, gi) => (
            <section key={gi} className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t(g.titleKey, { defaultValue: (g as any).titleDefault })}
              </h3>
              <div className="space-y-3">
                {g.items.map((q) => (
                  <LikertRow
                    key={q.name}
                    name={q.name}
                    label={t(q.i18nKey, { defaultValue: q.defaultLabel })}
                    leftLabel={t(q.leftKey, { defaultValue: q.leftDefault })}
                    rightLabel={t(q.rightKey, { defaultValue: q.rightDefault })}
                    scale={q.scale}
                    register={register}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t("survey.demographicsTitle", { defaultValue: "Demographics" })}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">
                  {t("survey.gender", {
                    defaultValue: "Please select your gender",
                  })}
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
                        <SelectValue
                          placeholder={t("survey.chooseOption", {
                            defaultValue: "Choose an option",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent >
                        <SelectItem value="female">
                          {t("survey.genderFemale", { defaultValue: "Female" })}
                        </SelectItem>
                        <SelectItem value="male">
                          {t("survey.genderMale", { defaultValue: "Male" })}
                        </SelectItem>
                        <SelectItem value="prefer_not_say">
                          {t("survey.genderPreferNotSay", {
                            defaultValue: "Prefer not to say",
                          })}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("survey.genderOther", { defaultValue: "Other" })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("survey.age", {
                    defaultValue: "Please indicate your age",
                  })}
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  {...register("age")}
                />
              </div>
            </div>
          </section>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit(submit)} className="ms-auto">
            {t("survey.submit", { defaultValue: "Submit" })}
          </Button>
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
            <label key={n} className="inline-flex flex-col items-center text-xs">
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
