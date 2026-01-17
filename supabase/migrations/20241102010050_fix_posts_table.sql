-- Add missing columns to posts table if they don't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Make title NOT NULL after adding it
UPDATE posts SET title = 'Untitled Post' WHERE title IS NULL;
ALTER TABLE posts ALTER COLUMN title SET NOT NULL;
