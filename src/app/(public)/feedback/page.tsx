'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const categories = ['UI/Design', 'Features', 'Performance', 'Other'];

export default function FeedbackPage() {
  const user = useAuthStore((s) => s.user);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState(categories[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!message.trim()) { toast.error('Please enter your feedback'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('feedback').insert({
        user_id: user?.id || null,
        rating,
        category,
        message,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="relative">
          {/* Simple celebration dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="absolute h-2 w-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'][i],
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s',
                }} />
            ))}
          </div>
          <span className="text-5xl">&#127881;</span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Thank You!</h2>
        <p className="mt-2 text-base text-gray-600">Your feedback helps us build a better SupaTodo.</p>
        <button onClick={() => { setSubmitted(false); setRating(0); setMessage(''); }}
          className="mt-6 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Submit more feedback
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Share Your Feedback</h1>
      <p className="mt-3 text-base text-gray-600">Your feedback helps us build a better SupaTodo.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className={`h-8 w-8 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors min-h-[44px] ${
                  category === c
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Tell us what you think..." required />
        </div>

        <button type="submit" disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]">
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
