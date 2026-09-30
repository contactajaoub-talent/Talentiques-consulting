import type { AtsBreakdown, CvObservations } from './types.ts';

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));
const ratio = (part: number, total: number) => clamp(part / Math.max(total, 1), 1);

export function calculateAtsReadiness(observations: CvObservations) {
  const { document, structure, experience, skills, contact, content } = observations;

  const parseability =
    ({ good: 10, partial: 6, poor: 0 }[document.extraction_quality]) +
    (document.layout_assessable
      ? ({ low: 5, medium: 3, high: 0 }[document.layout_risk])
      : 3) +
    ({ clear: 5, partial: 3, poor: 0 }[document.heading_clarity]);

  const structureScore =
    (structure.experience_section ? 4 : 0) +
    (structure.education_section ? 3 : 0) +
    (structure.skills_section ? 3 : 0) +
    (structure.summary_section ? 2 : 0) +
    (structure.languages_section ? 1 : 0) +
    (document.heading_clarity === 'clear' ? 2 : 0);

  const experienceScore = experience.positions_count === 0 ? 0 :
    ratio(experience.positions_with_dates, experience.positions_count) * 6 +
    ratio(experience.positions_with_bullets, experience.positions_count) * 6 +
    ratio(experience.action_oriented_bullets, experience.bullet_count) * 8;

  const impact =
    ratio(experience.quantified_bullets, experience.bullet_count) * 8 +
    ratio(experience.outcome_or_impact_bullets, experience.bullet_count) * 7;

  const skillsScore =
    (skills.explicit_section ? 5 : 0) +
    Math.min(skills.detected.length / 8, 1) * 5 +
    Math.min(skills.skills_supported_by_experience.length / 5, 1) * 5;

  const contactScore =
    (contact.email_present ? 2 : 0) +
    (contact.phone_present ? 2 : 0) +
    (contact.linkedin_present ? 1 : 0);

  const issuePoints = (count: number) => count === 0 ? 2 : count === 1 ? 1 : 0;
  const consistency =
    issuePoints(content.date_consistency_issue_count) +
    issuePoints(content.contradiction_count) +
    (content.language_issue_count <= 2 ? 1 : 0);

  const wordPoints = content.word_count >= 200 && content.word_count <= 800
    ? 3
    : (content.word_count >= 120 && content.word_count <= 1000 ? 2 : 1);
  const genericPoints = content.generic_phrase_count <= 2
    ? 2
    : (content.generic_phrase_count <= 5 ? 1 : 0);

  const breakdown: AtsBreakdown = {
    parseability: round(clamp(parseability, 20)),
    structure: round(clamp(structureScore, 15)),
    experience: round(clamp(experienceScore, 20)),
    impact: round(clamp(impact, 15)),
    skills: round(clamp(skillsScore, 15)),
    contact: round(clamp(contactScore, 5)),
    consistency: round(clamp(consistency, 5)),
    readability: round(clamp(wordPoints + genericPoints, 5)),
  };

  return {
    total: Math.round(clamp(Object.values(breakdown).reduce((sum, value) => sum + value, 0), 100)),
    breakdown,
  };
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
