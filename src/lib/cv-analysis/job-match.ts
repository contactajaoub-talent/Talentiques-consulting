import type { JobMatchObservations } from './types.ts';

const ratio = (part: number, total: number) =>
  total > 0 ? Math.max(0, Math.min(1, part / total)) : 0;

export function calculateJobMatch(observations: JobMatchObservations | null) {
  if (!observations) return null;

  const breakdown = {
    requiredSkills: Math.round(ratio(observations.required_skills_detected, observations.required_skills_total) * 50),
    responsibilities: Math.round(ratio(observations.responsibilities_matched, observations.responsibilities_total) * 25),
    experienceRelevance: Math.round(Math.max(0, Math.min(1, observations.experience_relevance)) * 15),
    keywords: Math.round(ratio(observations.keywords_detected, observations.keywords_total) * 10),
  };

  return {
    total: Math.max(0, Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0))),
    breakdown,
  };
}
