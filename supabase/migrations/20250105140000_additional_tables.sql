-- Additional tables for complete admin functionality
CREATE TABLE IF NOT EXISTS public.push_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, body TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.ad_campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, budget NUMERIC, status TEXT DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.seo_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), page_key TEXT UNIQUE, meta_title TEXT, meta_description TEXT, keywords TEXT[], created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.security_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id), event_type TEXT, ip_address INET, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.push_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_push" ON public.push_templates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_ads" ON public.ad_campaigns FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_seo" ON public.seo_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_security" ON public.security_events FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

