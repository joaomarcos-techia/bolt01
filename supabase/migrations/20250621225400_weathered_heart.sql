/*
  # Create avatars storage bucket

  1. Storage Bucket
    - Create 'avatars' bucket with public read access
    - Configure basic bucket settings

  Note: Storage RLS policies cannot be created via SQL migrations due to permission restrictions.
  These policies need to be configured through the Supabase dashboard or CLI instead.
  
  The bucket is created as public to allow avatar display, with upload restrictions
  handled at the application level through proper file naming and validation.
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

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