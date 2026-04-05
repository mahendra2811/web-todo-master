# Supabase Storage

## What is it?
> Supabase Storage is an S3-compatible file storage service integrated with your Supabase project. It supports buckets (public/private), file upload/download, and storage policies (like RLS but for files). It also includes on-the-fly image transformations.

## Why do we need it?
> Our Todo app needs avatar uploads for user profiles. Storage provides a secure way to upload, store, and serve user images with per-user access control — users can only access their own avatar.

## How it works (under the hood)

### Buckets
A bucket is a container for files (like an S3 bucket):
- **Public buckets** — Files are accessible via a public URL (no auth needed)
- **Private buckets** — Files require a signed URL or authenticated request

### Storage Policies
Like RLS for database tables, storage policies control who can read/write files:
```sql
-- Users can upload to their own folder
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```
The convention: store files in `{user_id}/filename.ext` folders, then use `storage.foldername()` to check ownership.

### Upload Pattern
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });
```

### Download / Get URL
```typescript
// Public bucket — direct URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-id/avatar.png');

// Private bucket — signed URL (expires)
const { data } = await supabase.storage
  .from('avatars')
  .createSignedUrl('user-id/avatar.png', 3600); // 1 hour
```

### Image Transformations
Supabase can resize/transform images on the fly:
```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-id/avatar.png', {
    transform: { width: 200, height: 200, resize: 'cover' },
  });
```

## Implementation in our project

**Avatar upload flow (Settings page):**
1. User selects an image file
2. Upload to `avatars/{user_id}/avatar.{ext}`
3. Get the public URL
4. Update `profiles.avatar_url` with the URL

**Storage bucket:** `avatars` (private, with policies)

## Supabase Dashboard Steps

1. Go to **Storage** in the Dashboard
2. Click **New bucket** -> Name: `avatars`, Public: OFF
3. Go to **Policies** for the bucket
4. Create policies for SELECT, INSERT, UPDATE, DELETE
5. Each policy checks: `auth.uid()::text = (storage.foldername(name))[1]`

## Common Mistakes & Gotchas

1. **Public vs private bucket confusion** — Public means anyone can read. For user avatars, use private + signed URLs or public with unique filenames.
2. **Not setting upsert: true** — Without it, re-uploading the same filename fails.
3. **Missing storage policies** — Like RLS, if policies don't exist, access is denied.
4. **Large file uploads** — Set a max file size in your policies or client-side validation.
5. **Cache invalidation** — Browsers cache images. Use `cacheControl` or append a timestamp to URLs.

## Key Takeaways

- Storage buckets are like S3 buckets — public or private
- Storage policies work like RLS but for file access
- Organize files in `{user_id}/` folders for per-user access control
- Use `upsert: true` for file replacement
- Image transformations (resize, crop) are built-in and on-the-fly

## Further Reading

- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
