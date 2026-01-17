// Utility functions for the offers system

export interface OfferPurchase {
  id: string;
  offerId: string;
  userId: string;
  userEmail: string;
  userName: string;
  offerTitle: string;
  amount: number;
  purchaseCode: string;
  purchaseDate: Date;
  isRedeemed: boolean;
  redeemedDate?: Date;
  paymentIntentId: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  type: 'offer_purchase' | 'general_purchase' | 'redemption_confirmation';
}

/**
 * Generate a unique purchase code for offers
 */
export const generateOfferPurchaseCode = (offerCategory?: string): string => {
  const prefix = 'SUB';
  const category = offerCategory ? offerCategory.slice(0, 3).toUpperCase().replace(/\s/g, '') : 'OFF';
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${prefix}-${category}-${year}-${timestamp}${random}`;
};

/**
 * Validate purchase code format
 */
export const validatePurchaseCode = (code: string): boolean => {
  const codePattern = /^SUB-[A-Z]{3}-\d{4}-\d{6}[A-Z0-9]{4}$/;
  return codePattern.test(code);
};

/**
 * Generate email content from template with variables
 */
export const generateEmailFromTemplate = (
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; htmlContent: string } => {
  let subject = template.subject;
  let htmlContent = template.htmlContent;

  // Replace all variables in subject and content
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
  });

  return { subject, htmlContent };
};

/**
 * Default email templates for different purchase types
 */
export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'offer_purchase_confirmation',
    name: 'Offer Purchase Confirmation',
    subject: 'Your Sublimes Drive Offer Purchase - {{offerTitle}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #0B1426; color: #E8EAED; padding: 30px 20px; text-align: center; }
          .logo { color: #D4AF37; font-size: 28px; font-weight: bold; margin: 0; }
          .tagline { margin: 5px 0 0 0; font-size: 14px; }
          .content { padding: 30px 20px; background: #ffffff; color: #333; }
          .offer-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .purchase-code { background: #D4AF37; color: #0B1426; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-family: monospace; }
          .steps { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Sublimes Drive</h1>
            <p class="tagline">Seamless Access</p>
          </div>
          
          <div class="content">
            <h2 style="color: #0B1426; margin-top: 0;">Thank you for your purchase!</h2>
            <p>Dear {{userName}},</p>
            <p>Your offer purchase has been confirmed successfully. Here are your purchase details:</p>
            
            <div class="offer-details">
              <h3 style="color: #D4AF37; margin-top: 0;">Offer Details</h3>
              <p><strong>Offer:</strong> {{offerTitle}}</p>
              <p><strong>Amount Paid:</strong> AED {{amount}}</p>
              <p><strong>Purchase Date:</strong> {{purchaseDate}}</p>
              <p><strong>Purchase Code:</strong> <span class="purchase-code">{{purchaseCode}}</span></p>
            </div>
            
            <div class="steps">
              <h3 style="color: #0B1426; margin-top: 0;">How to Redeem Your Offer</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li>Visit the service provider at their location</li>
                <li>Present your unique purchase code: <strong>{{purchaseCode}}</strong></li>
                <li>The provider will validate your code in their system</li>
                <li>Enjoy your discounted service!</li>
              </ol>
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Keep your purchase code safe - you'll need it to redeem the offer</li>
              <li>This offer is valid until {{validUntil}}</li>
              <li>Contact us if you have any issues with redemption</li>
            </ul>
            
            <p style="margin-top: 30px;">Thank you for choosing Sublimes Drive! We hope you enjoy your savings.</p>
            
            <p>Best regards,<br>The Sublimes Drive Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to {{userEmail}}. If you have any questions, please contact our support team.</p>
            <p>© 2024 Sublimes Drive. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: ['userName', 'offerTitle', 'amount', 'purchaseDate', 'purchaseCode', 'userEmail', 'validUntil'],
    type: 'offer_purchase',
  },
  {
    id: 'redemption_confirmation',
    name: 'Offer Redemption Confirmation',
    subject: 'Offer Redeemed Successfully - {{offerTitle}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #0B1426; color: #E8EAED; padding: 30px 20px; text-align: center; }
          .logo { color: #D4AF37; font-size: 28px; font-weight: bold; margin: 0; }
          .content { padding: 30px 20px; background: #ffffff; color: #333; }
          .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Sublimes Drive</h1>
            <p class="tagline">Seamless Access</p>
          </div>
          
          <div class="content">
            <div class="success-badge">✓ Offer Redeemed Successfully</div>
            
            <h2 style="color: #0B1426;">Great news, {{userName}}!</h2>
            <p>Your offer has been successfully redeemed at the service provider.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #D4AF37; margin-top: 0;">Redemption Details</h3>
              <p><strong>Offer:</strong> {{offerTitle}}</p>
              <p><strong>Redeemed on:</strong> {{redemptionDate}}</p>
              <p><strong>Service Provider:</strong> {{providerName}}</p>
              <p><strong>Location:</strong> {{providerLocation}}</p>
            </div>
            
            <p>We hope you enjoyed the service! Please consider leaving a review to help other car enthusiasts.</p>
            
            <p>Thank you for using Sublimes Drive!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Sublimes Drive. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: ['userName', 'offerTitle', 'redemptionDate', 'providerName', 'providerLocation'],
    type: 'redemption_confirmation',
  },
];

/**
 * Simulate sending email (in production, this would integrate with a real email service)
 */
export const sendOfferEmail = async (
  template: EmailTemplate,
  variables: Record<string, string>,
  recipientEmail: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate email content
    const { subject, htmlContent } = generateEmailFromTemplate(template, variables);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would use a service like SendGrid, AWS SES, etc.
    console.log('Email sent:', {
      to: recipientEmail,
      subject,
      htmlContent,
    });
    
    return {
      success: true,
      message: `Email sent successfully to ${recipientEmail}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email: ${error}`,
    };
  }
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (originalPrice: number, offerPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
};

/**
 * Format currency (AED)
 */
export const formatCurrency = (amount: number): string => {
  return `AED ${amount.toLocaleString()}`;
};

/**
 * Check if offer is still valid
 */
export const isOfferValid = (validUntil: string): boolean => {
  return new Date(validUntil) > new Date();
};

/**
 * Get days until expiry
 */
export const getDaysUntilExpiry = (validUntil: string): number => {
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Mock Stripe payment processing
 */
export const processStripePayment = async (
  amount: number,
  currency: string = 'aed',
  description: string
): Promise<{
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}> => {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate occasional payment failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Payment declined by bank');
    }
    
    // Generate mock payment intent ID
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      success: true,
      paymentIntentId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
};

/**
 * Service categories for offers
 */
export const serviceCategories = [
  'Oil Change',
  'AC Service',
  'Suspension',
  'Glass Service',
  'Tyres',
  'Brake Service',
  'Electrical',
  'Interior Cleaning',
  'Detailing',
  'Engine Service',
  'Bodywork',
  'Waxing',
  'Battery',
  'Transmission',
  'Paint Service',
  'Polishing',
  'Car Wash',
  'Maintenance',
  'Performance',
  'Repair',
];

/**
 * UAE Emirates for location filtering
 */
export const uaeEmirates = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];