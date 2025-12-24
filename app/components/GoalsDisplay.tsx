"use client";

type GoalsData = {
  improvementAreas?: string[];
  recommendedGoals?: string[];
  sessionFocus?: string[];
  longTermGoals?: string[];
  skillPlan?: {
    laning?: string[];
    midgame?: string[];
    macro?: string[];
    mechanics?: string[];
  };
};

type GoalsDisplayProps = {
  data: GoalsData;
};

export default function GoalsDisplay({ data }: GoalsDisplayProps) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-sm">
      <h2 className="font-bold text-lg text-[var(--sage-dark)] mb-6">
        GOALS & TRAINING PLAN
      </h2>

      {/* Main sections */}
      {data.improvementAreas && data.improvementAreas.length > 0 && (
        <Section title="IMPROVEMENT AREAS" items={data.improvementAreas} />
      )}

      {data.recommendedGoals && data.recommendedGoals.length > 0 && (
        <Section title="RECOMMENDED GOALS" items={data.recommendedGoals} />
      )}

      {data.sessionFocus && data.sessionFocus.length > 0 && (
        <Section title="SESSION FOCUS" items={data.sessionFocus} />
      )}

      {data.longTermGoals && data.longTermGoals.length > 0 && (
        <Section title="LONG-TERM GOALS" items={data.longTermGoals} />
      )}

      {/* Skill Plan section */}
      {data.skillPlan && Object.keys(data.skillPlan).length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg text-[var(--sage-dark)] mb-4">
            SKILL DEVELOPMENT PLAN
          </h3>

          {data.skillPlan.laning && data.skillPlan.laning.length > 0 && (
            <Section
              title="LANING PHASE"
              items={data.skillPlan.laning}
              isSubsection
            />
          )}

          {data.skillPlan.midgame && data.skillPlan.midgame.length > 0 && (
            <Section
              title="MIDGAME"
              items={data.skillPlan.midgame}
              isSubsection
            />
          )}

          {data.skillPlan.macro && data.skillPlan.macro.length > 0 && (
            <Section
              title="MACRO PLAY"
              items={data.skillPlan.macro}
              isSubsection
            />
          )}

          {data.skillPlan.mechanics && data.skillPlan.mechanics.length > 0 && (
            <Section
              title="MECHANICS"
              items={data.skillPlan.mechanics}
              isSubsection
            />
          )}
        </div>
      )}
    </div>
  );
}

type SectionProps = {
  title: string;
  items: string[];
  isSubsection?: boolean;
};

function Section({ title, items, isSubsection = false }: SectionProps) {
  return (
    <div className={isSubsection ? "mt-4" : "mt-6"}>
      <h4
        className={`font-bold ${isSubsection ? "text-base mt-4 mb-2 ml-4" : "text-lg mb-3"}`}
      >
        {title}
      </h4>
      <ul className={isSubsection ? "ml-6" : "ml-0"}>
        {items.map((item, index) => (
          <li
            key={index}
            className="text-sm text-[var(--foreground)] mb-1 leading-relaxed"
          >
            {index + 1}. {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
