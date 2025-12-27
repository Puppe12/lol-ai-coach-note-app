"use client";

import { GoalsData } from "../lib/types";

type GoalsDisplayProps = {
  data: GoalsData;
};

export default function GoalsDisplay({ data }: GoalsDisplayProps) {
  if (!data) return null;

  return (
    <div className="mt-4 p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
      <h2 className="font-bold text-lg text-[var(--sage-dark)] mb-6">
        GOALS & TRAINING PLAN
      </h2>

      {/* IMPROVEMENT AREAS */}
      {data.improvementAreas.length > 0 && (
        <section className="mt-6">
          <h3 className="font-bold text-lg mb-3">IMPROVEMENT AREAS</h3>
          <ul>
            {data.improvementAreas.map((area, i) => (
              <li key={i} className="text-sm mb-1">
                {i + 1}. {area}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* RECOMMENDED GOALS */}
      {data.recommendedGoals.length > 0 && (
        <section className="mt-6">
          <h3 className="font-bold text-lg mb-3">RECOMMENDED GOALS</h3>

          {data.recommendedGoals.map((g, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold">
                {i + 1}. {g.goal}
              </p>
              <p className="text-sm opacity-80 mt-1">{g.reasoning}</p>
            </div>
          ))}
        </section>
      )}

      {/* SESSION FOCUS */}
      {data.suggestions.length > 0 && (
        <section className="mt-6">
          <h3 className="font-bold text-lg mb-3">SESSION FOCUS</h3>

          {data.suggestions.map((s, i) => (
            <div key={i} className="mb-3">
              <p className="text-sm">
                {i + 1}. {s.suggestion}
              </p>
              <p className="text-xs opacity-60 ml-4">Supports goal: {s.goal}</p>
            </div>
          ))}
        </section>
      )}

      {/* LONG TERM GOALS */}
      {data.longTermGoals.length > 0 && (
        <section className="mt-6">
          <h3 className="font-bold text-lg mb-3">LONG-TERM GOALS</h3>
          <ul>
            {data.longTermGoals.map((goal, i) => (
              <li key={i} className="text-sm mb-1">
                {i + 1}. {goal}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* SKILL PLAN */}
      <section className="mt-8">
        <h3 className="font-bold text-lg mb-4">SKILL DEVELOPMENT PLAN</h3>

        {(
          [
            ["LANING PHASE", data.skillPlan.laning],
            ["MIDGAME", data.skillPlan.midgame],
            ["MACRO PLAY", data.skillPlan.macro],
            ["MECHANICS", data.skillPlan.mechanics],
          ] as const
        ).map(([title, items]) =>
          items.length > 0 ? (
            <div key={title} className="mt-4 ml-4">
              <h4 className="font-semibold mb-2">{title}</h4>
              <ul className="ml-2">
                {items.map((item, i) => (
                  <li key={i} className="text-sm mb-1">
                    {i + 1}. {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        )}
      </section>
    </div>
  );
}
