-- =====================================================
-- SUBLIMES DRIVE: CONFIG SYSTEM SEED DATA
-- Minimal production-ready seeds for zero-hardcode system
-- =====================================================

-- Temporarily disable audit triggers during seed data insertion
ALTER TABLE core_app_config DISABLE TRIGGER audit_core_app_config;
ALTER TABLE feature_flags DISABLE TRIGGER audit_feature_flags;
ALTER TABLE design_tokens DISABLE TRIGGER audit_design_tokens;

-- =====================================================
-- 1. CORE APP CONFIGURATION
-- =====================================================

INSERT INTO core_app_config (key, value, scope, description, data_type) VALUES
-- Brand & Identity
('app.name', '"Sublimes Drive"', 'global', 'Application name', 'string'),
('app.tagline', '"The Ultimate Car Enthusiast Community"', 'global', 'Application tagline', 'string'),
('app.version', '"1.0.0"', 'global', 'Current app version', 'string'),
('app.environment', '"production"', 'global', 'Current environment', 'string'),

-- Localization
('app.default_locale', '"en"', 'global', 'Default locale', 'string'),
('app.supported_locales', '["en", "ar", "zh-CN"]', 'global', 'Supported locales', 'json'),
('app.fallback_locale', '"en"', 'global', 'Fallback locale when translation missing', 'string'),
('app.timezone', '"Asia/Dubai"', 'global', 'Default timezone', 'string'),

-- Theme & UI
('ui.theme.default', '"light"', 'global', 'Default theme mode', 'string'),
('ui.theme.light_palette', '"warm_greige"', 'global', 'Active light mode palette: warm_greige|neutral_slate|soft_taupe', 'string'),
('ui.theme.allow_user_override', 'true', 'global', 'Allow users to override theme', 'boolean'),

-- Brand Colors (constant across themes)
('brand.color.primary', '"#D4AF37"', 'global', 'Primary brand gold color', 'string'),
('brand.color.primary_dark', '"#C19B2E"', 'global', 'Darker gold for hover states', 'string'),
('brand.color.black', '"#0B0B0B"', 'global', 'Brand black', 'string'),

-- Platform Configuration
('platform.mobile.enabled', 'true', 'platform', 'Enable mobile experience', 'boolean'),
('platform.desktop.enabled', 'true', 'platform', 'Enable desktop experience', 'boolean'),

-- Social Links
('social.instagram', '"https://instagram.com/sublimesdrive"', 'global', 'Instagram URL', 'url'),
('social.twitter', '"https://twitter.com/sublimesdrive"', 'global', 'Twitter URL', 'url'),
('social.facebook', '"https://facebook.com/sublimesdrive"', 'global', 'Facebook URL', 'url'),
('social.youtube', '"https://youtube.com/@sublimesdrive"', 'global', 'YouTube URL', 'url'),

-- SEO & Meta
('seo.site_name', '"Sublimes Drive"', 'global', 'Site name for SEO', 'string'),
('seo.twitter_handle', '"@sublimesdrive"', 'global', 'Twitter handle for cards', 'string'),
('seo.og_type', '"website"', 'global', 'Default OG type', 'string'),

-- Feature Limits
('limits.upload.max_size_mb', '10', 'global', 'Max file upload size in MB', 'number'),
('limits.upload.allowed_types', '["image/jpeg", "image/png", "image/webp", "image/gif"]', 'global', 'Allowed upload MIME types', 'json'),
('limits.post.max_images', '10', 'global', 'Max images per post', 'number'),
('limits.listing.max_images', '20', 'global', 'Max images per listing', 'number'),

-- Contact & Support
('contact.support_email', '"support@sublimesdrive.com"', 'global', 'Support email', 'string'),
('contact.phone', '"+971-4-XXX-XXXX"', 'global', 'Contact phone', 'string'),
('contact.address', '"Dubai, UAE"', 'global', 'Business address', 'string')

ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 2. FEATURE FLAGS
-- =====================================================

INSERT INTO feature_flags (key, description, enabled, category, targeting) VALUES
-- Core Features
('marketplace.enabled', 'Enable marketplace functionality', TRUE, 'marketplace', '{}'),
('community.enabled', 'Enable community posts and interactions', TRUE, 'community', '{}'),
('garage_hub.enabled', 'Enable garage hub features', TRUE, 'garage', '{}'),
('events.enabled', 'Enable events and meetups', TRUE, 'events', '{}'),
('offers.enabled', 'Enable promotional offers system', TRUE, 'offers', '{}'),
('messaging.enabled', 'Enable direct messaging', TRUE, 'general', '{}'),
('wallet.enabled', 'Enable wallet and XP system', TRUE, 'general', '{}'),
('notifications.enabled', 'Enable notifications', TRUE, 'general', '{}'),
('leaderboard.enabled', 'Enable leaderboard', TRUE, 'general', '{}'),
('daily_challenges.enabled', 'Enable daily challenges', TRUE, 'general', '{}'),

-- Advanced Features
('ai_chat.enabled', 'Enable AI chat assistant', FALSE, 'general', '{"roles": ["admin"]}'),
('import_car.enabled', 'Enable import your car feature', TRUE, 'general', '{}'),
('repair_bid.enabled', 'Enable repair bid system', TRUE, 'garage', '{}'),
('social_login.google', 'Enable Google social login', FALSE, 'general', '{}'),
('social_login.apple', 'Enable Apple social login', FALSE, 'general', '{}'),

-- Marketplace Features
('marketplace.boost_listings', 'Enable listing boost feature', TRUE, 'marketplace', '{}'),
('marketplace.featured_listings', 'Enable featured listings', TRUE, 'marketplace', '{}'),
('marketplace.auto_approval', 'Auto-approve listings (bypass moderation)', FALSE, 'marketplace', '{"roles": ["admin"]}'),

-- Admin Features
('admin.analytics', 'Enable admin analytics dashboard', TRUE, 'admin', '{}'),
('admin.user_management', 'Enable admin user management', TRUE, 'admin', '{}'),
('admin.content_moderation', 'Enable content moderation tools', TRUE, 'admin', '{}'),

-- Experimental
('experiment.new_search_ui', 'New search UI experiment', FALSE, 'general', '{"rollout_percentage": 0}'),
('experiment.dark_mode_default', 'Dark mode by default experiment', FALSE, 'general', '{"rollout_percentage": 0}')

ON CONFLICT (key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 3. DESIGN TOKENS - LIGHT MODE (WARM GREIGE - DEFAULT)
-- =====================================================

INSERT INTO design_tokens (token, mode, palette, value, group_name, subgroup, description) VALUES
-- Colors - Background
('color.background.canvas', 'light', 'warm_greige', '#ECE9E6', 'color', 'background', 'Main canvas background'),
('color.background.card', 'light', 'warm_greige', '#F7F6F3', 'color', 'background', 'Card background'),
('color.background.sidebar', 'light', 'warm_greige', '#DDD8D3', 'color', 'background', 'Sidebar background'),
('color.background.input', 'light', 'warm_greige', '#FAFAFA', 'color', 'background', 'Input field background'),
('color.background.hover', 'light', 'warm_greige', '#E5E2DF', 'color', 'background', 'Hover state background'),

-- Colors - Text
('color.text.primary', 'light', 'warm_greige', '#1F1F1F', 'color', 'text', 'Primary text color'),
('color.text.secondary', 'light', 'warm_greige', '#4A4A4A', 'color', 'text', 'Secondary text color'),
('color.text.tertiary', 'light', 'warm_greige', '#737373', 'color', 'text', 'Tertiary/muted text'),

-- Colors - Border
('color.border.default', 'light', 'warm_greige', '#D4D0CC', 'color', 'border', 'Default border color'),
('color.border.light', 'light', 'warm_greige', '#E5E5E5', 'color', 'border', 'Light border color'),

-- Colors - Brand
('color.brand.primary', 'light', 'warm_greige', '#D4AF37', 'color', 'brand', 'Primary brand color (gold)'),
('color.brand.hover', 'light', 'warm_greige', '#C19B2E', 'color', 'brand', 'Brand color hover state'),
('color.brand.black', 'light', 'warm_greige', '#0B0B0B', 'color', 'brand', 'Brand black'),

-- Colors - Semantic
('color.success', 'light', 'warm_greige', '#10B981', 'color', 'semantic', 'Success color'),
('color.error', 'light', 'warm_greige', '#EF4444', 'color', 'semantic', 'Error color'),
('color.warning', 'light', 'warm_greige', '#F59E0B', 'color', 'semantic', 'Warning color'),
('color.info', 'light', 'warm_greige', '#3B82F6', 'color', 'semantic', 'Info color')

ON CONFLICT (token, mode, palette) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 3B. DESIGN TOKENS - LIGHT MODE (NEUTRAL SLATE)
-- =====================================================

INSERT INTO design_tokens (token, mode, palette, value, group_name, subgroup, description) VALUES
-- Colors - Background
('color.background.canvas', 'light', 'neutral_slate', '#E8E9EB', 'color', 'background', 'Main canvas background'),
('color.background.card', 'light', 'neutral_slate', '#F1F2F4', 'color', 'background', 'Card background'),
('color.background.sidebar', 'light', 'neutral_slate', '#D1D3D6', 'color', 'background', 'Sidebar background'),
('color.background.input', 'light', 'neutral_slate', '#FAFAFA', 'color', 'background', 'Input field background'),
('color.background.hover', 'light', 'neutral_slate', '#E0E2E5', 'color', 'background', 'Hover state background'),

-- Colors - Text
('color.text.primary', 'light', 'neutral_slate', '#121212', 'color', 'text', 'Primary text color'),
('color.text.secondary', 'light', 'neutral_slate', '#5C5C5C', 'color', 'text', 'Secondary text color'),
('color.text.tertiary', 'light', 'neutral_slate', '#8B8B8B', 'color', 'text', 'Tertiary/muted text'),

-- Colors - Border
('color.border.default', 'light', 'neutral_slate', '#C8C8C8', 'color', 'border', 'Default border color'),
('color.border.light', 'light', 'neutral_slate', '#E0E0E0', 'color', 'border', 'Light border color'),

-- Colors - Brand (same across palettes)
('color.brand.primary', 'light', 'neutral_slate', '#D4AF37', 'color', 'brand', 'Primary brand color (gold)'),
('color.brand.hover', 'light', 'neutral_slate', '#C19B2E', 'color', 'brand', 'Brand color hover state'),
('color.brand.black', 'light', 'neutral_slate', '#0B0B0B', 'color', 'brand', 'Brand black'),

-- Colors - Semantic (same across palettes)
('color.success', 'light', 'neutral_slate', '#10B981', 'color', 'semantic', 'Success color'),
('color.error', 'light', 'neutral_slate', '#EF4444', 'color', 'semantic', 'Error color'),
('color.warning', 'light', 'neutral_slate', '#F59E0B', 'color', 'semantic', 'Warning color'),
('color.info', 'light', 'neutral_slate', '#3B82F6', 'color', 'semantic', 'Info color')

ON CONFLICT (token, mode, palette) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 3C. DESIGN TOKENS - LIGHT MODE (SOFT TAUPE GLOW)
-- =====================================================

INSERT INTO design_tokens (token, mode, palette, value, group_name, subgroup, description) VALUES
-- Colors - Background
('color.background.canvas', 'light', 'soft_taupe', '#E9E6E2', 'color', 'background', 'Main canvas background'),
('color.background.card', 'light', 'soft_taupe', '#F5F4F2', 'color', 'background', 'Card background'),
('color.background.sidebar', 'light', 'soft_taupe', '#D5D2CF', 'color', 'background', 'Sidebar background'),
('color.background.input', 'light', 'soft_taupe', '#FAFAFA', 'color', 'background', 'Input field background'),
('color.background.hover', 'light', 'soft_taupe', '#E1DED9', 'color', 'background', 'Hover state background'),

-- Colors - Text
('color.text.primary', 'light', 'soft_taupe', '#2C2C2C', 'color', 'text', 'Primary text color'),
('color.text.secondary', 'light', 'soft_taupe', '#6E6E6E', 'color', 'text', 'Secondary text color'),
('color.text.tertiary', 'light', 'soft_taupe', '#9A9A9A', 'color', 'text', 'Tertiary/muted text'),

-- Colors - Border
('color.border.default', 'light', 'soft_taupe', '#D0CCC7', 'color', 'border', 'Default border color'),
('color.border.light', 'light', 'soft_taupe', '#E5E3E0', 'color', 'border', 'Light border color'),

-- Colors - Brand (same across palettes)
('color.brand.primary', 'light', 'soft_taupe', '#D4AF37', 'color', 'brand', 'Primary brand color (gold)'),
('color.brand.hover', 'light', 'soft_taupe', '#C19B2E', 'color', 'brand', 'Brand color hover state'),
('color.brand.black', 'light', 'soft_taupe', '#0B0B0B', 'color', 'brand', 'Brand black'),

-- Colors - Semantic (same across palettes)
('color.success', 'light', 'soft_taupe', '#10B981', 'color', 'semantic', 'Success color'),
('color.error', 'light', 'soft_taupe', '#EF4444', 'color', 'semantic', 'Error color'),
('color.warning', 'light', 'soft_taupe', '#F59E0B', 'color', 'semantic', 'Warning color'),
('color.info', 'light', 'soft_taupe', '#3B82F6', 'color', 'semantic', 'Info color')

ON CONFLICT (token, mode, palette) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 4. DESIGN TOKENS - DARK MODE (ALL PALETTES USE SAME DARK)
-- =====================================================

INSERT INTO design_tokens (token, mode, palette, value, group_name, subgroup, description) VALUES
-- Colors - Background (Dark mode uses OKLCH values)
('color.background.canvas', 'dark', 'default', 'oklch(0.145 0 0)', 'color', 'background', 'Main canvas background'),
('color.background.card', 'dark', 'default', 'oklch(0.145 0 0)', 'color', 'background', 'Card background'),
('color.background.sidebar', 'dark', 'default', 'oklch(0.205 0 0)', 'color', 'background', 'Sidebar background'),
('color.background.input', 'dark', 'default', 'oklch(0.269 0 0)', 'color', 'background', 'Input field background'),
('color.background.hover', 'dark', 'default', 'oklch(0.269 0 0)', 'color', 'background', 'Hover state background'),

-- Colors - Text
('color.text.primary', 'dark', 'default', 'oklch(0.985 0 0)', 'color', 'text', 'Primary text color'),
('color.text.secondary', 'dark', 'default', 'oklch(0.708 0 0)', 'color', 'text', 'Secondary text color'),
('color.text.tertiary', 'dark', 'default', 'oklch(0.639 0 0)', 'color', 'text', 'Tertiary/muted text'),

-- Colors - Border
('color.border.default', 'dark', 'default', 'oklch(0.269 0 0)', 'color', 'border', 'Default border color'),
('color.border.light', 'dark', 'default', 'oklch(0.339 0 0)', 'color', 'border', 'Light border color'),

-- Colors - Brand
('color.brand.primary', 'dark', 'default', '#D4AF37', 'color', 'brand', 'Primary brand color (gold)'),
('color.brand.hover', 'dark', 'default', '#E5C158', 'color', 'brand', 'Brand color hover state'),
('color.brand.black', 'dark', 'default', '#0B0B0B', 'color', 'brand', 'Brand black'),

-- Colors - Semantic
('color.success', 'dark', 'default', '#10B981', 'color', 'semantic', 'Success color'),
('color.error', 'dark', 'default', 'oklch(0.396 0.141 25.723)', 'color', 'semantic', 'Error color'),
('color.warning', 'dark', 'default', '#F59E0B', 'color', 'semantic', 'Warning color'),
('color.info', 'dark', 'default', 'oklch(0.488 0.243 264.376)', 'color', 'semantic', 'Info color')

ON CONFLICT (token, mode, palette) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 5. DESIGN TOKENS - SPACING, RADIUS, SHADOWS (MODE-INDEPENDENT)
-- =====================================================

INSERT INTO design_tokens (token, mode, palette, value, group_name, subgroup, description) VALUES
-- Spacing
('space.xs', 'light', 'default', '0.25rem', 'space', NULL, 'Extra small spacing (4px)'),
('space.sm', 'light', 'default', '0.5rem', 'space', NULL, 'Small spacing (8px)'),
('space.md', 'light', 'default', '1rem', 'space', NULL, 'Medium spacing (16px)'),
('space.lg', 'light', 'default', '1.5rem', 'space', NULL, 'Large spacing (24px)'),
('space.xl', 'light', 'default', '2rem', 'space', NULL, 'Extra large spacing (32px)'),
('space.2xl', 'light', 'default', '3rem', 'space', NULL, '2X large spacing (48px)'),

-- Border Radius
('radius.sm', 'light', 'default', '0.375rem', 'radius', NULL, 'Small radius (6px)'),
('radius.md', 'light', 'default', '0.5rem', 'radius', NULL, 'Medium radius (8px)'),
('radius.lg', 'light', 'default', '0.625rem', 'radius', NULL, 'Large radius (10px)'),
('radius.xl', 'light', 'default', '0.875rem', 'radius', NULL, 'Extra large radius (14px)'),
('radius.full', 'light', 'default', '9999px', 'radius', NULL, 'Full/circle radius'),

-- Shadows
('shadow.sm', 'light', 'default', '0 1px 2px 0 rgb(0 0 0 / 0.05)', 'shadow', NULL, 'Small shadow'),
('shadow.md', 'light', 'default', '0 4px 6px -1px rgb(0 0 0 / 0.1)', 'shadow', NULL, 'Medium shadow'),
('shadow.lg', 'light', 'default', '0 10px 15px -3px rgb(0 0 0 / 0.1)', 'shadow', NULL, 'Large shadow'),
('shadow.xl', 'light', 'default', '0 20px 25px -5px rgb(0 0 0 / 0.1)', 'shadow', NULL, 'Extra large shadow')

ON CONFLICT (token, mode, palette) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 6. I18N STRINGS - NAVIGATION & CORE UI (ENGLISH)
-- =====================================================

INSERT INTO i18n_strings (key, locale, text, category, context) VALUES
-- Navigation
('nav.home', 'en', 'Home', 'navigation', '{}'),
('nav.marketplace', 'en', 'Marketplace', 'navigation', '{}'),
('nav.community', 'en', 'Community', 'navigation', '{}'),
('nav.garage_hub', 'en', 'Garage Hub', 'navigation', '{}'),
('nav.events', 'en', 'Events', 'navigation', '{}'),
('nav.offers', 'en', 'Offers', 'navigation', '{}'),
('nav.wallet', 'en', 'Wallet', 'navigation', '{}'),
('nav.profile', 'en', 'Profile', 'navigation', '{}'),
('nav.settings', 'en', 'Settings', 'navigation', '{}'),
('nav.messages', 'en', 'Messages', 'navigation', '{}'),
('nav.notifications', 'en', 'Notifications', 'navigation', '{}'),
('nav.leaderboard', 'en', 'Leaderboard', 'navigation', '{}'),
('nav.search', 'en', 'Search', 'navigation', '{}'),
('nav.more', 'en', 'More', 'navigation', '{}'),

-- Common CTAs
('cta.create_post', 'en', 'Create Post', 'cta', '{}'),
('cta.create_listing', 'en', 'Create Listing', 'cta', '{}'),
('cta.save', 'en', 'Save', 'cta', '{}'),
('cta.cancel', 'en', 'Cancel', 'cta', '{}'),
('cta.delete', 'en', 'Delete', 'cta', '{}'),
('cta.edit', 'en', 'Edit', 'cta', '{}'),
('cta.submit', 'en', 'Submit', 'cta', '{}'),
('cta.share', 'en', 'Share', 'cta', '{}'),
('cta.like', 'en', 'Like', 'cta', '{}'),
('cta.comment', 'en', 'Comment', 'cta', '{}'),
('cta.follow', 'en', 'Follow', 'cta', '{}'),
('cta.unfollow', 'en', 'Unfollow', 'cta', '{}'),
('cta.send_message', 'en', 'Send Message', 'cta', '{}'),
('cta.load_more', 'en', 'Load More', 'cta', '{}'),
('cta.view_all', 'en', 'View All', 'cta', '{}'),

-- Empty States
('empty.no_posts', 'en', 'No posts yet', 'empty_state', '{}'),
('empty.no_listings', 'en', 'No listings found', 'empty_state', '{}'),
('empty.no_events', 'en', 'No upcoming events', 'empty_state', '{}'),
('empty.no_messages', 'en', 'No messages', 'empty_state', '{}'),
('empty.no_notifications', 'en', 'No notifications', 'empty_state', '{}'),

-- Common Labels
('label.loading', 'en', 'Loading...', 'general', '{}'),
('label.error', 'en', 'Error', 'general', '{}'),
('label.success', 'en', 'Success', 'general', '{}'),
('label.search', 'en', 'Search', 'general', '{}'),
('label.filter', 'en', 'Filter', 'general', '{}'),
('label.sort', 'en', 'Sort', 'general', '{}')

ON CONFLICT (key, locale) DO UPDATE SET
  text = EXCLUDED.text,
  updated_at = NOW();

-- =====================================================
-- 7. I18N STRINGS - ARABIC (BASIC)
-- =====================================================

INSERT INTO i18n_strings (key, locale, text, category) VALUES
('nav.home', 'ar', 'الرئيسية', 'navigation'),
('nav.marketplace', 'ar', 'السوق', 'navigation'),
('nav.community', 'ar', 'المجتمع', 'navigation'),
('nav.garage_hub', 'ar', 'مركز الكراج', 'navigation'),
('nav.events', 'ar', 'الفعاليات', 'navigation'),
('nav.offers', 'ar', 'العروض', 'navigation'),
('nav.wallet', 'ar', 'المحفظة', 'navigation'),
('nav.profile', 'ar', 'الملف الشخصي', 'navigation'),
('cta.save', 'ar', 'حفظ', 'cta'),
('cta.cancel', 'ar', 'إلغاء', 'cta'),
('label.loading', 'ar', 'جاري التحميل...', 'general')

ON CONFLICT (key, locale) DO UPDATE SET
  text = EXCLUDED.text,
  updated_at = NOW();

-- =====================================================
-- 8. I18N STRINGS - CHINESE (BASIC)
-- =====================================================

INSERT INTO i18n_strings (key, locale, text, category) VALUES
('nav.home', 'zh-CN', '首页', 'navigation'),
('nav.marketplace', 'zh-CN', '市场', 'navigation'),
('nav.community', 'zh-CN', '社区', 'navigation'),
('nav.garage_hub', 'zh-CN', '车库中心', 'navigation'),
('nav.events', 'zh-CN', '活动', 'navigation'),
('nav.offers', 'zh-CN', '优惠', 'navigation'),
('nav.wallet', 'zh-CN', '钱包', 'navigation'),
('nav.profile', 'zh-CN', '个人资料', 'navigation'),
('cta.save', 'zh-CN', '保存', 'cta'),
('cta.cancel', 'zh-CN', '取消', 'cta'),
('label.loading', 'zh-CN', '加载中...', 'general')

ON CONFLICT (key, locale) DO UPDATE SET
  text = EXCLUDED.text,
  updated_at = NOW();

-- =====================================================
-- 9. SEO DEFAULTS (KEY ROUTES)
-- =====================================================

INSERT INTO seo_defaults (route, locale, title, description, keywords, robots) VALUES
('/', 'en', 'Sublimes Drive - The Ultimate Car Enthusiast Community', 
 'Join Sublimes Drive, the premier platform for car enthusiasts. Buy, sell, connect with garages, attend events, and more.',
 ARRAY['car community', 'automotive marketplace', 'car enthusiasts', 'Dubai cars', 'UAE automotive'],
 'index,follow'),

('/marketplace', 'en', 'Car Marketplace - Buy & Sell Cars | Sublimes Drive',
 'Browse thousands of cars for sale. Find your dream car or sell your vehicle in our trusted marketplace.',
 ARRAY['buy cars', 'sell cars', 'car marketplace', 'used cars', 'Dubai car sales'],
 'index,follow'),

('/community', 'en', 'Community - Connect with Car Enthusiasts | Sublimes Drive',
 'Join the conversation. Share your passion, post photos, and connect with fellow car enthusiasts.',
 ARRAY['car community', 'automotive forum', 'car enthusiasts', 'car social network'],
 'index,follow'),

('/garage-hub', 'en', 'Garage Hub - Find Trusted Auto Services | Sublimes Drive',
 'Discover verified garages and auto services. Get quotes, book appointments, and read reviews.',
 ARRAY['car garage', 'auto repair', 'car service', 'Dubai garages', 'vehicle maintenance'],
 'index,follow'),

('/events', 'en', 'Car Events & Meetups | Sublimes Drive',
 'Discover and attend exciting car events, meetups, and shows in your area.',
 ARRAY['car events', 'car meetups', 'automotive shows', 'car exhibitions', 'Dubai car events'],
 'index,follow')

ON CONFLICT (route, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 10. SYSTEM CONSTANTS
-- =====================================================

INSERT INTO system_constants (category, key, value, label, sort_order) VALUES
-- User Roles
('user_role', 'car_browser', 'car_browser', '{"en": "Car Browser", "ar": "متصفح السيارات", "zh-CN": "汽车浏览者"}', 1),
('user_role', 'car_owner', 'car_owner', '{"en": "Car Owner", "ar": "مالك السيارة", "zh-CN": "车主"}', 2),
('user_role', 'garage_owner', 'garage_owner', '{"en": "Garage Owner", "ar": "مالك الكراج", "zh-CN": "车库主"}', 3),
('user_role', 'vendor', 'vendor', '{"en": "Vendor", "ar": "بائع", "zh-CN": "供应商"}', 4),
('user_role', 'admin', 'admin', '{"en": "Admin", "ar": "مدير", "zh-CN": "管理员"}', 5),

-- Listing Status
('listing_status', 'draft', 'draft', '{"en": "Draft", "ar": "مسودة", "zh-CN": "草稿"}', 1),
('listing_status', 'pending', 'pending', '{"en": "Pending Approval", "ar": "في انتظار الموافقة", "zh-CN": "待批准"}', 2),
('listing_status', 'approved', 'approved', '{"en": "Approved", "ar": "معتمد", "zh-CN": "已批准"}', 3),
('listing_status', 'rejected', 'rejected', '{"en": "Rejected", "ar": "مرفوض", "zh-CN": "已拒绝"}', 4),
('listing_status', 'sold', 'sold', '{"en": "Sold", "ar": "مباع", "zh-CN": "已售"}', 5),
('listing_status', 'expired', 'expired', '{"en": "Expired", "ar": "منتهي", "zh-CN": "已过期"}', 6),

-- Vehicle Condition
('vehicle_condition', 'new', 'new', '{"en": "New", "ar": "جديد", "zh-CN": "新车"}', 1),
('vehicle_condition', 'used_excellent', 'used_excellent', '{"en": "Used - Excellent", "ar": "مستعمل - ممتاز", "zh-CN": "二手 - 优秀"}', 2),
('vehicle_condition', 'used_good', 'used_good', '{"en": "Used - Good", "ar": "مستعمل - جيد", "zh-CN": "二手 - 良好"}', 3),
('vehicle_condition', 'used_fair', 'used_fair', '{"en": "Used - Fair", "ar": "مستعمل - متوسط", "zh-CN": "二手 - 一般"}', 4)

ON CONFLICT (category, key) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  updated_at = NOW();

-- Re-enable audit triggers after seed data insertion
ALTER TABLE core_app_config ENABLE TRIGGER audit_core_app_config;
ALTER TABLE feature_flags ENABLE TRIGGER audit_feature_flags;
ALTER TABLE design_tokens ENABLE TRIGGER audit_design_tokens;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Config system seed data inserted successfully';
  RAISE NOTICE '📊 Inserted: App config, feature flags, design tokens (3 light palettes + dark mode)';
  RAISE NOTICE '🌍 Inserted: i18n strings (en, ar, zh-CN), SEO defaults, system constants';
  RAISE NOTICE '🎨 Light palettes: warm_greige (default), neutral_slate, soft_taupe';
  RAISE NOTICE '🔧 Next: Run application and access admin panel to manage configuration';
END $$;

