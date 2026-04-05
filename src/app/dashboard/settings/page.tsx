'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { profileSchema, passwordChangeSchema } from '@/lib/validators/auth';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetching, setProfileFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setAvatarUrl(data.avatar_url);
      }
      setProfileFetching(false);
    }
    loadProfile();
  }, [user, supabase]);

  function getInitials() {
    if (fullName.trim()) {
      return fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

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
      let newAvatarUrl = avatarUrl;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) {
          toast.error('Avatar upload failed: ' + uploadError.message);
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);
          newAvatarUrl = urlData.publicUrl;
        }
      }

      // Update profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: newAvatarUrl })
        .eq('id', user.id);
      if (error) throw error;

      // Sync auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: newAvatarUrl },
      });

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
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

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Profile Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-16 w-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center hover:ring-2 hover:ring-indigo-300 transition-all"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-indigo-600">
                {getInitials()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs opacity-0 hover:opacity-100">Edit</span>
            </div>
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {profileFetching ? 'Loading...' : fullName || 'No name set'}
            </p>
            <p className="text-xs text-gray-500">Click avatar to change</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
        </div>

        {/* Name Form */}
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
              disabled={profileFetching}
            />
          </div>
          <Button type="submit" loading={profileLoading}>
            Update Profile
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Re-enter password"
            />
          </div>
          <Button type="submit" loading={passwordLoading} variant="secondary">
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}
