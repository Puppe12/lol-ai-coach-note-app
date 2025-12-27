export type RecommendedGoal = {
  goal: string;
  reasoning: string;
};

export type Suggestion = {
  goal: string;
  suggestion: string;
};

export type SkillPlan = {
  laning: string[];
  midgame: string[];
  macro: string[];
  mechanics: string[];
};

export type GoalsData = {
  improvementAreas: string[];
  recommendedGoals: RecommendedGoal[];
  suggestions: Suggestion[];
  longTermGoals: string[];
  skillPlan: SkillPlan;
};
