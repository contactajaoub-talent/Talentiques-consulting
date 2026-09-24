import type { StoreProductId } from './catalog';
export const productDetailsEN: Record<StoreProductId, { headline: string; problem: string; outcome: string; includes: string[]; benefits: string[]; steps: string[] }> = {
  tracker: {
    headline: 'A clearer next step. Every day of your job search.',
    problem: 'Applications spread across tabs, forgotten follow-ups and interview notes you cannot find: a busy search can quickly lose direction.',
    outcome: 'Bring your opportunities, contacts and next actions into one reusable workspace. Spend less time rebuilding your process and more time moving the right opportunities forward.',
    includes: ['Opportunity Tracker Pro — English edition', 'Application, follow-up and interview tracking', 'Dashboard with progress indicators', 'Recruiter and contact mini CRM', 'Opportunity scoring and prioritisation', 'Google Sheets and Google Calendar automation setup', 'Two premium guides: finding opportunities and managing follow-ups'],
    benefits: ['Know what needs your attention next', 'Keep recruiter conversations and deadlines together', 'Focus on opportunities that match your goals', 'Reuse the same system for your next career move'],
    steps: ['Download the English package from your secure access page.', 'Import the tracker into Google Sheets and follow the setup guide.', 'Add your target roles and set your next actions.', 'Review progress weekly and keep your follow-ups moving.'],
  },
  ats: {
    headline: 'Make your experience easier to understand.',
    problem: 'A strong background can be overlooked when a resume is hard to scan, generic or poorly structured.',
    outcome: 'Start with a clear, editable resume structure, then use the guides to turn your experience into relevant evidence. Build a consistent application across your resume and LinkedIn profile.',
    includes: ['Seven editable ATS-friendly resume templates — English edition', 'Complete resume writing guide', 'A method for tailoring your resume to a job description', 'LinkedIn profile guide included', 'Reusable files for future applications'],
    benefits: ['Present your experience in a readable structure', 'Choose relevant achievements for each role', 'Make your resume and LinkedIn profile consistent', 'Update your application without starting from scratch'],
    steps: ['Download your templates and guides.', 'Choose a layout that fits your experience.', 'Use the writing guide to explain your achievements clearly.', 'Tailor the content for each role and review the final document.'],
  },
  bundle: {
    headline: 'One system for your next career move.',
    problem: 'A good resume alone does not organise your search. A tracker alone does not strengthen your application. The work needs to connect.',
    outcome: 'Combine Opportunity Tracker Pro with ATS Resume System. Find and prioritise roles, tailor your application, and follow through with a practical routine you can keep using.',
    includes: ['Opportunity Tracker Pro — English edition', 'Dashboard, contact CRM and opportunity scoring', 'Two premium job-search and follow-up guides', 'Seven editable ATS-friendly resume templates', 'Complete resume writing guide', 'LinkedIn profile guide included'],
    benefits: ['Connect your application with your search process', 'Keep tools, contacts and next actions together', 'Get both systems for less than buying separately', 'Keep the files and reuse them as your career evolves'],
    steps: ['Download both resource packages from your access page.', 'Set up your tracker and define your target roles.', 'Build your resume and update your LinkedIn profile.', 'Apply, follow up and review your progress in one routine.'],
  },
};
