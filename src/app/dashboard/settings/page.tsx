'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Your name"
            />
          </div>
          <Button type="submit" loading={loading}>
            Update
          </Button>
        </form>
      </div>
    </div>
  );
}
