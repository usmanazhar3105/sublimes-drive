-- Create default email templates (8 templates)
-- Date: 2025-01-08

-- Insert default email templates if they don't exist
INSERT INTO public.email_templates (template_key, name, subject, body_html, body_text, variables)
VALUES
  (
    'signup_welcome',
    'Signup Welcome',
    'Welcome to Sublimes Drive, {{name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Sublimes Drive!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Thank you for joining Sublimes Drive - the premier platform for Chinese car enthusiasts in the UAE!</p>
      <p>Get started by:</p>
      <ul>
        <li>Exploring our community</li>
        <li>Browsing the marketplace</li>
        <li>Connecting with other car enthusiasts</li>
      </ul>
      <a href="{{app_url}}" class="button">Get Started</a>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Welcome to Sublimes Drive, {{name}}! Thank you for joining. Visit {{app_url}} to get started.',
    '["name", "app_url"]'::jsonb
  ),
  (
    'email_verification',
    'Email Verification',
    'Verify your email address - Sublimes Drive',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="{{verification_url}}" class="button">Verify Email</a>
      <p>Or copy this link: {{verification_url}}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Hello {{name}}, Please verify your email: {{verification_url}}',
    '["name", "verification_url"]'::jsonb
  ),
  (
    'password_reset',
    'Password Reset',
    'Reset your password - Sublimes Drive',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <a href="{{reset_url}}" class="button">Reset Password</a>
      <p>Or copy this link: {{reset_url}}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Hello {{name}}, Reset your password: {{reset_url}}',
    '["name", "reset_url"]'::jsonb
  ),
  (
    'congratulations',
    'Congratulations',
    'Congratulations on your achievement, {{name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>{{message}}</p>
      <p>Keep up the great work!</p>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Congratulations {{name}}! {{message}}',
    '["name", "message"]'::jsonb
  ),
  (
    'referral_garage_owner',
    'Referral - Garage Owner',
    'You earned bid credits from a referral!',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Referral Bonus!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Great news! Someone signed up using your referral code.</p>
      <p>You have earned <strong>{{credits}} bid credits</strong> in your wallet!</p>
      <p>Keep sharing your referral code to earn more credits.</p>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Hello {{name}}, You earned {{credits}} bid credits from a referral!',
    '["name", "credits"]'::jsonb
  ),
  (
    'referral_car_owner',
    'Referral - Car Owner',
    'Welcome bonus from your referral!',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome Bonus!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Thank you for using a referral code to sign up!</p>
      <p>You have earned <strong>+{{xp}} XP</strong> as a welcome bonus!</p>
      <p>Start exploring and earn more rewards!</p>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Hello {{name}}, You earned +{{xp}} XP from your referral signup!',
    '["name", "xp"]'::jsonb
  ),
  (
    'payment_success',
    'Payment Success',
    'Payment successful - Invoice #{{invoice_number}}',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: #000; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .invoice { background: white; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Successful!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Your payment has been processed successfully.</p>
      <div class="invoice">
        <h3>Invoice Details</h3>
        <p><strong>Invoice #:</strong> {{invoice_number}}</p>
        <p><strong>Amount:</strong> AED {{amount}}</p>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Description:</strong> {{description}}</p>
      </div>
      <p>Thank you for your purchase!</p>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Payment successful. Invoice #{{invoice_number}}, Amount: AED {{amount}}',
    '["name", "invoice_number", "amount", "date", "description"]'::jsonb
  ),
  (
    'payment_failure',
    'Payment Failure',
    'Payment failed - Please try again',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Failed</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Unfortunately, your payment could not be processed.</p>
      <p><strong>Reason:</strong> {{reason}}</p>
      <p>Please try again or contact support if the issue persists.</p>
      <a href="{{retry_url}}" class="button">Try Again</a>
      <p>Best regards,<br>The Sublimes Drive Team</p>
    </div>
  </div>
</body>
</html>',
    'Payment failed. Reason: {{reason}}. Please try again: {{retry_url}}',
    '["name", "reason", "retry_url"]'::jsonb
  )
ON CONFLICT (template_key) DO NOTHING;

-- Create RPC function to send email using template
CREATE OR REPLACE FUNCTION public.fn_send_email_template(
  p_template_key TEXT,
  p_recipient_email TEXT,
  p_variables JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_subject TEXT;
  v_body_html TEXT;
  v_body_text TEXT;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM public.email_templates
  WHERE template_key = p_template_key
  AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found');
  END IF;

  -- Replace variables in subject
  v_subject := v_template.subject;
  FOR key, value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_subject := replace(v_subject, '{{' || key || '}}', value);
  END LOOP;

  -- Replace variables in HTML body
  v_body_html := v_template.body_html;
  FOR key, value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_body_html := replace(v_body_html, '{{' || key || '}}', value);
  END LOOP;

  -- Replace variables in text body
  v_body_text := v_template.body_text;
  FOR key, value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_body_text := replace(v_body_text, '{{' || key || '}}', value);
  END LOOP;

  -- TODO: Actually send email via SMTP or email service
  -- For now, just log it
  INSERT INTO public.email_deliveries (
    template_id,
    recipient_email,
    subject,
    body_html,
    body_text,
    status,
    sent_at
  ) VALUES (
    v_template.id,
    p_recipient_email,
    v_subject,
    v_body_html,
    v_body_text,
    'queued',
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'message', 'Email queued');
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_send_email_template(TEXT, TEXT, JSONB) TO authenticated;


