/*
  # Create avatars storage bucket with proper configuration

  1. Storage Bucket
    - Create 'avatars' bucket with public read access
    - Configure file size limits and allowed file types

  2. Security
    - The bucket will be configured as public for read access
    - Upload restrictions will be handled at the application level
    - File naming convention: profile-photos/{user_id}-{timestamp}.{ext}

  Note: Storage RLS policies are managed through Supabase dashboard or CLI,
  not through SQL migrations due to permission restrictions.
*/

-- Create the avatars bucket if it doesn't exist
DO $$
BEGIN
  -- Check if bucket exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars', 
      'avatars', 
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
  END IF;
END $$;

-- Create a function to help with storage path validation (for application use)
CREATE OR REPLACE FUNCTION public.is_valid_avatar_path(file_path text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the file path follows the expected pattern
  RETURN file_path LIKE 'profile-photos/' || user_id::text || '-%';
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_valid_avatar_path(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_avatar_path(text, uuid) TO anon;