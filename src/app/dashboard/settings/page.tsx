'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { ExportImport } from '@/components/common/ExportImport';
import { AvatarPicker } from '@/components/common/AvatarPicker';
import { createClient } from '@/lib/supabase/client';
import { useUIStore, type Theme, type Density } from '@/stores/ui-store';
import { profileSchema, passwordChangeSchema } from '@/lib/validators/auth';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const density = useUIStore((s) => s.density);
  const setDensity = useUIStore((s) => s.setDensity);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetching, setProfileFetching] = useState(true);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load current profile
  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user!.id)
        .single();
      if (data) {
        setFullName(data.full_name || '');
        setAvatarId(data.avatar_url);
      }
      setProfileFetching(false);
    }
    loadProfile();
  }, [user, supabase]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const result = profileSchema.safeParse({ fullName });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarId })
        .eq('id', user.id);
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarId },
      });

      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const result = passwordChangeSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Profile Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-start gap-4 mb-4">
          <AvatarPicker value={avatarId} onChange={setAvatarId} />
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-900">
              {profileFetching ? 'Loading...' : fullName || 'No name set'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Pick an avatar</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Your name"
              disabled={profileFetching}
            />
          </div>
          <Button type="submit" loading={profileLoading}>Update Profile</Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Re-enter password"
            />
          </div>
          <Button type="submit" loading={passwordLoading} variant="secondary">Change Password</Button>
        </form>
      </div>

      {/* Appearance Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'auto'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
                    theme === t
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'auto' ? '🖥️ Auto' : t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout Density</label>
            <div className="flex gap-2">
              {(['compact', 'comfortable', 'spacious'] as Density[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors capitalize ${
                    density === d
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export/Import Section */}
      <ExportImport />

      {/* Keyboard Shortcuts */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Keyboard Shortcuts</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Search</span>
            <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">⌘K</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quick Add Todo</span>
            <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">⌘N</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Close Modal</span>
            <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
