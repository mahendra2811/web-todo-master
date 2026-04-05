'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import type { Metadata } from 'next';

const subjects = ['General Inquiry', 'Bug Report', 'Feature Request', 'Feedback', 'Complaint'];

export default function ContactPage() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('contact_messages').insert({
        name, email, subject, message,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Message sent! We\'ll get back to you soon.');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get in Touch</h1>
      <p className="mt-3 text-base text-gray-600">
        Have a question, suggestion, or just want to say hi? We&apos;d love to hear from you.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {sent ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <span className="text-4xl">&#9989;</span>
              <h2 className="mt-3 text-lg font-bold text-gray-900">Message Sent!</h2>
              <p className="mt-2 text-sm text-gray-600">We typically respond within 24 hours.</p>
              <button onClick={() => { setSent(false); setMessage(''); }}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Your name" required
                  defaultValue={user?.user_metadata?.full_name || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email || user?.email || ''} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Tell us what's on your mind..." required />
              </div>
              <button type="submit" disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Email</h3>
            <p className="mt-1 text-sm text-gray-600">support@supatodo.app</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Response Time</h3>
            <p className="mt-1 text-sm text-gray-600">We typically respond within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
