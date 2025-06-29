/*
  # Storage Setup for Petition Files

  1. Helper Functions
    - `check_petition_file_access` - Validates user access to petition files
    - `log_petition_file_operation` - Audit logging for file operations
    - `setup_petition_storage_policies` - Documentation function for storage setup

  2. Important Notes
    - Storage bucket and policies must be created through Supabase Dashboard
    - This migration only creates helper functions for the storage system
    - No direct modifications to storage schema tables

  3. Manual Setup Required
    - Create 'petition-files' bucket in Supabase Dashboard
    - Configure storage policies as documented below
*/

-- Create a helper function to check petition file access
CREATE OR REPLACE FUNCTION check_petition_file_access(file_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  petition_num text;
  has_access boolean := false;
BEGIN
  -- Get current user
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extract petition number from filename (format: P-YYYY/NNNNN-filename.ext)
  petition_num := split_part(file_name, '-', 1) || '-' || split_part(split_part(file_name, '-', 2), '/', 1) || '/' || split_part(split_part(file_name, '-', 2), '/', 2);
  
  -- Check if user has access to this petition
  SELECT EXISTS (
    SELECT 1 FROM petitions p
    WHERE p.petition_number = petition_num
    AND (
      p.created_by = user_id OR 
      p.assigned_to = user_id OR
      EXISTS (
        SELECT 1 FROM users u1, users u2
        WHERE u1.id = user_id 
        AND u2.id = p.created_by 
        AND u1.station_id = u2.station_id
      ) OR
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id 
        AND u.role IN ('Admin', 'SP')
      )
    )
  ) INTO has_access;
  
  RETURN has_access;
END $$;

-- Create a function to log file operations for audit purposes
CREATE OR REPLACE FUNCTION log_petition_file_operation(
  operation_type text,
  file_name text,
  file_size bigint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log file operations for audit purposes
  INSERT INTO ai_analysis_logs (
    analysis_type,
    input_data,
    processed_by,
    processing_time
  ) VALUES (
    operation_type,
    jsonb_build_object(
      'file_name', file_name,
      'file_size', file_size,
      'timestamp', NOW()
    ),
    auth.uid(),
    NOW()
  );
EXCEPTION
  WHEN others THEN
    -- Silently handle logging errors to not break file operations
    NULL;
END $$;

-- Create a documentation function for storage setup
CREATE OR REPLACE FUNCTION setup_petition_storage_policies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'Storage bucket and policies must be configured through Supabase Dashboard. See migration comments for details.';
END $$;

-- Create a function to validate file uploads
CREATE OR REPLACE FUNCTION validate_petition_file(
  file_name text,
  file_size bigint,
  mime_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  allowed_types text[] := ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];
  max_size bigint := 10485760; -- 10MB
BEGIN
  -- Check file size
  IF file_size > max_size THEN
    RETURN false;
  END IF;
  
  -- Check mime type
  IF NOT (mime_type = ANY(allowed_types)) THEN
    RETURN false;
  END IF;
  
  -- Check file name is not empty
  IF file_name IS NULL OR trim(file_name) = '' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END $$;

-- Add a column to track file uploads in petitions table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'petitions' AND column_name = 'file_attachments'
  ) THEN
    ALTER TABLE petitions ADD COLUMN file_attachments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create an index for better petition number lookups
CREATE INDEX IF NOT EXISTS idx_petition_number_lookup ON petitions(petition_number);

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION check_petition_file_access(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION log_petition_file_operation(text, text, bigint) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION validate_petition_file(text, bigint, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION setup_petition_storage_policies() TO authenticated, service_role;

/*
  MANUAL SETUP REQUIRED IN SUPABASE DASHBOARD:

  1. Create Storage Bucket:
     - Name: petition-files
     - Public: false
     - File size limit: 10MB
     - Allowed MIME types: 
       * application/pdf
       * application/vnd.openxmlformats-officedocument.wordprocessingml.document  
       * text/plain
       * image/jpeg
       * image/png

  2. Create Storage Policies for 'petition-files' bucket:

     Policy 1: "Service role full access"
     - Target roles: service_role
     - Allowed operations: All (SELECT, INSERT, UPDATE, DELETE)
     - Policy definition: bucket_id = 'petition-files'

     Policy 2: "Authenticated users can upload files"
     - Target roles: authenticated
     - Allowed operations: INSERT
     - Policy definition: bucket_id = 'petition-files'

     Policy 3: "Users can read accessible petition files"
     - Target roles: authenticated
     - Allowed operations: SELECT
     - Policy definition: bucket_id = 'petition-files' AND check_petition_file_access(name)

     Policy 4: "Users can update their petition files"
     - Target roles: authenticated
     - Allowed operations: UPDATE
     - Policy definition: bucket_id = 'petition-files' AND check_petition_file_access(name)

     Policy 5: "Users can delete their petition files"
     - Target roles: authenticated
     - Allowed operations: DELETE
     - Policy definition: bucket_id = 'petition-files' AND check_petition_file_access(name)

  3. Enable Row Level Security on storage.objects (should be enabled by default)
*/