-- Freya Tiny 2: RLS and Seed Freya
-- Ensure Freya profile exists
INSERT INTO public.profiles(id, email, full_name, username, role)
VALUES ('d8c1f7a7-9c89-4090-a0a6-b310120b190c', 'freya@sublimesdrive.com', 'Freya', 'freya', 'ai_agent')
ON CONFLICT (id) DO UPDATE SET role='ai_agent', email='freya@sublimesdrive.com';

-- Seed Freya agent
INSERT INTO public.ai_agents_freya(id, profile_id, name, handle, email, is_enabled)
VALUES (
  'd8c1f7a7-9c89-4090-a0a6-b310120b190c',
  'd8c1f7a7-9c89-4090-a0a6-b310120b190c',
  'Freya',
  '@freya',
  'freya@sublimesdrive.com',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET name='Freya', handle='@freya', email='freya@sublimesdrive.com', is_enabled=TRUE;

-- Global settings
INSERT INTO public.ai_agent_settings_freya(agent_id, community_id, language_default, max_comment_len, rate_per_min, rate_per_hour, rate_per_day, is_enabled)
VALUES ('d8c1f7a7-9c89-4090-a0a6-b310120b190c', NULL, 'en', 900, 6, 60, 500, TRUE)
ON CONFLICT (agent_id, community_id) DO NOTHING;
