/**
 * Migration: Enable Required Extensions
 * 
 * Enables UUID generation and other required extensions
 * 
 * Date: 2025-11-01
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional crypto functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20241101205000_enable_extensions completed successfully';
END $$;
