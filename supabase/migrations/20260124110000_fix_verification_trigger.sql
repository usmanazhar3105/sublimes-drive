-- Migration: Fix Verification Trigger Roles
-- Description: Updates the trigger function to use underscores (garage_owner) instead of hyphens, preventing constraint violations.

CREATE OR REPLACE FUNCTION update_profile_role_on_verification_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If verification is approved, update user's role
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE profiles
    SET role = CASE
      WHEN NEW.verification_type = 'vehicle' THEN 'car_owner'   -- Fixed: car-owner -> car_owner
      WHEN NEW.verification_type = 'garage' THEN 'garage_owner' -- Fixed: garage-owner -> garage_owner
      WHEN NEW.verification_type = 'vendor' THEN 'vendor'       -- Valid
      ELSE role
    END,
    -- Also update sub_role to match, ensuring consistency
    sub_role = CASE
      WHEN NEW.verification_type = 'vehicle' THEN 'car_owner'
      WHEN NEW.verification_type = 'garage' THEN 'garage_owner'
      WHEN NEW.verification_type = 'vendor' THEN 'vendor'
      ELSE sub_role
    END,
    verification_status = 'approved',
    is_verified = true,
    verified_at = NOW(),
    updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
