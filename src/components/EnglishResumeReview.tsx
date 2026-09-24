'use client';
import { useState, type FormEvent } from 'react';
export default function EnglishResumeReview() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<Array<{ label: string; found: boolean; advice: string }> | null>(null);
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult([
      { label: 'Experience section', found: /\b(experience|employment|work history)\b/i.test(text), advice: 'Use a clear heading and explain your contribution in each relevant role.' },
      { label: 'Education section', found: /\b(education|qualifications|degree|university)\b/i.test(text), advice: 'Include relevant qualifications and dates, using concise, recognisable labels.' },
      { label: 'Skills section', found: /\b(skills|technologies|expertise|competencies)\b/i.test(text), advice: 'Include skills relevant to the role that you can support with examples.' },
      { label: 'Evidence of results', found: /\d+\s*(%|percent|users|customers|clients|hours|days|projects|people)\b/i.test(text), advice: 'Describe the outcome of your work. Add accurate numbers where they help explain the impact.' },
      { label: 'Contact email', found: /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text), advice: 'Make sure employers can reach you and that your contact details are current.' },
    ]);
  }
  return <div data-clarity-mask="true"><form onSubmit={review} className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><label htmlFor="resume-text" className="text-lg font-bold">Paste your resume text</label><p className="mt-3 text-sm leading-6 text-slate-600">This check runs only in your browser. Your resume is not uploaded or saved. Remove any information you do not want to include.</p><textarea id="resume-text" value={text} onChange={e => { setText(e.target.value); setResult(null); }} required minLength={50} maxLength={30000} rows={12} className="mt-5 w-full rounded-xl border border-slate-300 bg-white p-4 text-sm" placeholder="Paste at least 50 characters…" /><button className="mt-5 rounded-full bg-[#0683C9] px-6 py-3 font-bold text-white">Review the basics</button><button type="button" onClick={() => { setText(''); setResult(null); }} className="ml-4 px-4 py-3 text-sm font-semibold">Clear</button></form>{result && <section aria-live="polite" className="mt-8"><h2 className="text-2xl font-bold">Your structure checklist</h2><p className="mt-3 text-sm leading-6 text-slate-600">These keyword-based checks cannot assess your experience, formatting or suitability for a role. They are not an ATS score or a hiring prediction.</p><ul className="mt-5 space-y-4">{result.map(item => <li key={item.label} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold">{item.label} <span className="ml-2 text-sm font-normal text-[#0683C9]">{item.found ? 'Signal found' : 'Worth checking'}</span></h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.advice}</p></li>)}</ul></section>}</div>;
}
