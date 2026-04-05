import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SupaTodo',
  description: 'Privacy policy for SupaTodo. Learn how we handle your data.',
};

const sections = [
  {
    title: 'What We Collect',
    content: 'We collect the minimum data needed to provide our service: your email address, display name, and the todos/lists/tags you create. That\'s it. No tracking pixels, no analytics fingerprinting, no behavioral profiling.',
  },
  {
    title: 'How We Use It',
    content: 'Your data is used solely to provide the SupaTodo service — storing your tasks, syncing across devices, and enabling features like search and export. We do not analyze your task content for advertising or sell it to third parties.',
  },
  {
    title: 'What We Don\'t Do',
    content: 'We don\'t sell your data. We don\'t show ads. We don\'t track you across the internet. We don\'t share your information with data brokers. We don\'t use your task data to train AI models. Period.',
  },
  {
    title: 'Data Storage',
    content: 'Your data is stored securely in a PostgreSQL database hosted by Supabase. All data is encrypted in transit (HTTPS) and at rest. Access is controlled through Row-Level Security (RLS) policies, ensuring only you can access your data.',
  },
  {
    title: 'Data Export & Deletion',
    content: 'You can export all your data at any time from Settings in JSON format. To delete your account and all associated data, contact us at support@supatodo.app. We process deletion requests within 24 hours and permanently remove all your data from our systems.',
  },
  {
    title: 'Cookies',
    content: 'We use only essential cookies required for authentication and session management. No marketing cookies, no analytics cookies, no third-party tracking cookies.',
  },
  {
    title: 'Third Parties',
    content: 'We use Supabase for authentication and database hosting. Supabase processes data according to their privacy policy and GDPR compliance standards. No other third-party services have access to your data.',
  },
  {
    title: 'Contact',
    content: 'If you have questions about our privacy practices, please reach out at support@supatodo.app or visit our Contact page. We take your privacy seriously and are happy to answer any questions.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-gray-500">Last updated: April 2026</p>

      <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
        <p className="text-sm text-indigo-800 font-medium">
          TL;DR: We collect the minimum data needed. We don&apos;t sell, share, or monetize your data in any way.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-bold text-gray-900">{s.title}</h2>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
