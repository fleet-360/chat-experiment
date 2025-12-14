export type LikertConfig = {
  name: string;
  i18nKey: string;
  scale: number;
  leftKey: string;
  rightKey: string;
  leftDefault: string;
  rightDefault: string;
};

export type SemanticConfig = {
  name: string;
  i18nKey: string;
  scale: number;
  leftKey: string;
  rightKey: string;
  leftDefault: string;
  rightDefault: string;
};

export type SurveyGroup = {
  titleKey: string;
  titleDefault: string;
  items: (LikertConfig | SemanticConfig)[];
};

const likert = (
  name: string,
  i18nKey: string,
  leftKey: string,
  rightKey: string,
  leftDefault: string,
  rightDefault: string,
  scale = 7
): LikertConfig => ({
  name,
  i18nKey,
  scale,
  leftKey,
  rightKey,
  leftDefault,
  rightDefault,
});

const semantic = (
  name: string,
  i18nKey: string,
  leftKey: string,
  rightKey: string,
  leftDefault: string,
  rightDefault: string,
  scale = 7
): SemanticConfig => ({
  name,
  i18nKey,
  scale,
  leftKey,
  rightKey,
  leftDefault,
  rightDefault,
});

// Step definitions based on requested pages
const groupCompetence = [
  // semantic(
  //   "q6",
  //   "survey.q6",
  //   "survey.incapable",
  //   "survey.capable",
  //   "Incapable",
  //   "Capable"
  // ),
  semantic(
    "q7",
    "survey.q7",
    "survey.ineffective",
    "survey.effective",
    "Ineffective",
    "Effective"
  ),
  semantic(
    "q8",
    "survey.q8",
    "survey.incompetent",
    "survey.competent",
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
    "Unfriendly",
    "Friendly"
  ),
  semantic("q10", "survey.q10", "survey.cold", "survey.warm", "Cold", "Warm"),
  // semantic(
  //   "q11",
  //   "survey.q11",
  //   "survey.unapproachable",
  //   "survey.approachable",
  //   "Unapproachable",
  //   "Approachable"
  // ),
];

const comfort = [
  likert(
    "q12",
    "survey.q12",
    "survey.notAtAll",
    "survey.extremely",
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
    "Not at all",
    "Extremely"
  ),
  likert(
    "q14",
    "survey.q14",
    "survey.notAtAll",
    "survey.extremely",
    "Not at all",
    "Extremely"
  ),
];

const groupDynamics = [
  likert(
    "q27",
    "survey.q27",
    "survey.stronglyDisagree",
    "survey.stronglyAgree",
    "Strongly disagree",
    "Strongly agree"
  ),
  likert(
    "q15",
    "survey.q15",
    "survey.stronglyDisagree",
    "survey.stronglyAgree",
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
    "Disliked",
    "Liked"
  ),
  semantic(
    "q21",
    "survey.q21",
    "survey.notWorkAgain",
    "survey.workAgain",
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
    "Strongly disagree",
    "Strongly agree"
  ),
  likert(
    "q23",
    "survey.q23",
    "survey.stronglyDisagree",
    "survey.stronglyAgree",
    "Strongly disagree",
    "Strongly agree"
  ),
  likert(
    "q24",
    "survey.q24",
    "survey.stronglyDisagree",
    "survey.stronglyAgree",
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
    "Not at all",
    "Very often"
  ),
];

// Pages structure per request (without titles displayed)
export const surveyGroups: SurveyGroup[] = [
  { titleKey: "", titleDefault: "", items: playfulness }, // Page 6 - commented out

  { titleKey: "", titleDefault: "", items: [...comfort, ...groupDynamics] }, // Page 1
  { titleKey: "", titleDefault: "", items: expression }, // Page 2
  { titleKey: "", titleDefault: "", items: groupEval }, // Page 3
  { titleKey: "", titleDefault: "", items: groupCompetence }, // Page 4
  { titleKey: "", titleDefault: "", items: groupWarmth }, // Page 5
  { titleKey: "", titleDefault: "", items: emojiUse }, // Page 6
];

// Helper function to get all question names in order
export function getSurveyQuestionNames(): string[] {
  const names: string[] = [];
  for (const group of surveyGroups) {
    for (const item of group.items) {
      names.push(item.name);
    }
  }
  // Add demographics
  names.push("gender", "age");
  return names;
}
