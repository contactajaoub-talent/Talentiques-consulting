export type ExperienceLevel =
  | 'student'
  | 'junior'
  | 'intermediate'
  | 'senior'
  | 'executive'
  | 'unknown';

export type CvIssue = {
  category: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  explanation: string;
  recommended_action: string;
  example_rewrite: string;
};

export type JobMatchObservations = {
  required_skills_total: number;
  required_skills_detected: number;
  responsibilities_total: number;
  responsibilities_matched: number;
  experience_relevance: number;
  keywords_total: number;
  keywords_detected: number;
  strengths: string[];
  gaps: string[];
};

export type CvObservations = {
  is_cv: boolean;
  language: 'fr' | 'en' | 'other';
  confidence: number;
  document: {
    extraction_quality: 'good' | 'partial' | 'poor';
    layout_assessable: boolean;
    layout_risk: 'low' | 'medium' | 'high';
    heading_clarity: 'clear' | 'partial' | 'poor';
  };
  candidate: {
    target_role_detected: string | null;
    experience_level: ExperienceLevel;
  };
  structure: {
    summary_section: boolean;
    experience_section: boolean;
    education_section: boolean;
    skills_section: boolean;
    languages_section: boolean;
  };
  contact: {
    email_present: boolean;
    phone_present: boolean;
    linkedin_present: boolean;
  };
  experience: {
    positions_count: number;
    positions_with_dates: number;
    positions_with_bullets: number;
    bullet_count: number;
    action_oriented_bullets: number;
    quantified_bullets: number;
    outcome_or_impact_bullets: number;
  };
  skills: {
    explicit_section: boolean;
    detected: string[];
    skills_supported_by_experience: string[];
  };
  content: {
    word_count: number;
    generic_phrase_count: number;
    language_issue_count: number;
    date_consistency_issue_count: number;
    contradiction_count: number;
  };
  strengths: string[];
  issues: CvIssue[];
  remove_or_reduce: string[];
  add_or_strengthen: string[];
  job_match_observations: JobMatchObservations | null;
};

export type AtsBreakdown = {
  parseability: number;
  structure: number;
  experience: number;
  impact: number;
  skills: number;
  contact: number;
  consistency: number;
  readability: number;
};

export type Recommendation = {
  offerId: string;
  offerName: string;
  href: string;
  reason: string;
  cta: string;
};

export type CvAnalysisResult = {
  atsReadiness: { total: number; breakdown: AtsBreakdown };
  jobMatch: { total: number; breakdown: Record<string, number> } | null;
  strengths: string[];
  priorities: CvIssue[];
  removeOrReduce: string[];
  addOrStrengthen: string[];
  rewrites: CvIssue[];
  esco: {
    used: boolean;
    occupation: string | null;
    skills: string[];
  };
  recommendation: Recommendation;
  profile: {
    experienceLevel: ExperienceLevel;
    currentStatus: string;
  };
  layoutAssessed: boolean;
  modelUsed: string;
  fallbackUsed: boolean;
};
