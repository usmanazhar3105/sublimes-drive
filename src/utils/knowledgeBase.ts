export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
  isPublished: boolean;
  priority: number;
}

export const knowledgeBase: KnowledgeBaseItem[] = [
  // Getting Started
  {
    id: 'get-verified',
    title: 'How to Get Verified',
    content: `Getting verified on Sublimes Drive gives you credibility and access to exclusive features. Here's how to get verified:

**For Car Owners:**
1. Complete your profile with accurate information
2. Upload clear photos of your car (front, back, interior, engine bay)
3. Provide vehicle registration documents (Mulkiya)
4. Submit Emirates ID for identity verification
5. Wait 24-48 hours for review

**For Garage Owners:**
1. Submit business license and trade license
2. Provide facility photos and certifications
3. Upload professional credentials
4. Complete business verification process
5. Pass quality assessment

**Benefits of Verification:**
• Verified badge on your profile
• Higher listing visibility
• Access to premium features
• Increased trust from community
• 100 XP bonus
• Priority customer support

**Required Documents:**
• Emirates ID (mandatory)
• Car registration (for car owners)
• Business license (for garages)
• Professional certifications (for garages)

**Tips for Faster Verification:**
• Ensure all photos are clear and well-lit
• Upload documents in PDF or high-quality image format
• Complete all profile sections
• Respond quickly to verification requests`,
    category: 'Getting Started',
    tags: ['verification', 'account', 'documents', 'profile', 'identity'],
    views: 12500,
    helpful: 98,
    lastUpdated: '2024-09-15',
    isPublished: true,
    priority: 1
  },
  {
    id: 'complete-profile',
    title: 'Complete Your Profile',
    content: `A complete profile increases your credibility and helps you connect with the right community members.

**Essential Profile Information:**
• Profile photo (clear, professional)
• Full name and location
• Bio describing your car interests
• Car details (make, model, year)
• Contact preferences

**Profile Tips:**
• Use a clear profile photo
• Write an engaging bio
• List your car(s) accurately
• Set privacy preferences
• Enable notifications

**Profile Sections:**
1. **Basic Info:** Name, location, join date
2. **Bio:** Tell your car story
3. **Cars:** Your vehicle collection
4. **Preferences:** Privacy and notification settings
5. **Verification:** Upload required documents

**Benefits of Complete Profile:**
• Better community connections
• Higher trust score
• More listing visibility
• Access to exclusive events
• 50 XP bonus for completion

**Privacy Settings:**
• Control who can message you
• Set profile visibility
• Manage notification preferences
• Choose information sharing level`,
    category: 'Getting Started',
    tags: ['profile', 'setup', 'personal', 'information', 'privacy'],
    views: 8200,
    helpful: 94,
    lastUpdated: '2024-09-10',
    isPublished: true,
    priority: 2
  },

  // Marketplace
  {
    id: 'post-car-listing',
    title: 'How to Post a Car Listing',
    content: `Create attractive car listings that sell faster with these step-by-step instructions.

**Step-by-Step Guide:**
1. **Navigate to Marketplace** → Click "Create Listing"
2. **Choose Category:** Select "Cars" or "Car Parts")
3. **Add Vehicle Details:**
   • Make and model
   • Year and mileage
   • Engine specifications
   • Transmission type
   • Fuel type
   • Body condition

4. **Upload Photos (Minimum 5):**
   • Exterior front, back, sides
   • Interior dashboard and seats
   • Engine bay
   • Any damages or special features
   • Documents (registration, service history)

5. **Set Pricing:**
   • Research market prices
   • Set competitive price
   • Consider negotiation room
   • Add payment preferences

6. **Location & Contact:**
   • Set viewing location
   • Add contact preferences
   • Set availability times

7. **Review & Submit:**
   • Double-check all information
   • Submit for admin review
   • Wait for approval (2-4 hours)

**Photo Guidelines:**
• Take photos in good lighting
• Clean the car before photographing
• Show all angles and details
• Include any modifications
• Highlight special features

**Pricing Tips:**
• Research similar listings
• Consider car condition
• Factor in market demand
• Be realistic with expectations
• Leave room for negotiation

**Boost Options:**
• Featured listing (top of results)
• Highlighted in search
• Social media promotion
• Extended listing duration`,
    category: 'Marketplace',
    tags: ['listing', 'sell', 'car', 'marketplace', 'photos'],
    views: 15000,
    helpful: 96,
    lastUpdated: '2024-09-20',
    isPublished: true,
    priority: 1
  },
  {
    id: 'post-auto-parts',
    title: 'How to Post Auto Parts',
    content: `Sell your car parts quickly with detailed listings that attract buyers.

**Creating Parts Listings:**
1. **Select "Auto Parts"** category
2. **Choose Part Type:**
   • Engine components
   • Body parts
   • Interior accessories
   • Electronics
   • Wheels and tires
   • Performance parts

3. **Add Detailed Information:**
   • Part name and OEM number
   • Compatible car models
   • Condition (new, used, refurbished)
   • Installation requirements
   • Warranty information

4. **Photo Requirements:**
   • Clear photos from multiple angles
   • Show part numbers/labels
   • Include original packaging if available
   • Demonstrate condition clearly

5. **Pricing and Location:**
   • Set competitive prices
   • Include shipping options
   • Specify pickup locations
   • Add payment methods

**Part Categories:**
• **Engine:** Filters, belts, gaskets
• **Body:** Bumpers, panels, lights
• **Interior:** Seats, dashboard, trim
• **Electronics:** Audio, navigation, sensors
• **Performance:** Exhaust, suspension, turbo
• **Wheels:** Rims, tires, accessories

**Buyer Communication:**
• Respond quickly to inquiries
• Provide additional photos if requested
• Be honest about condition
• Offer inspection opportunities
• Arrange safe meeting locations`,
    category: 'Marketplace',
    tags: ['parts', 'auto parts', 'sell', 'components', 'marketplace'],
    views: 6800,
    helpful: 92,
    lastUpdated: '2024-09-18',
    isPublished: true,
    priority: 2
  },

  // Garage Hub
  {
    id: 'create-garage-listing',
    title: 'Create Garage Listing',
    content: `Set up your garage profile to attract customers and grow your business.

**Garage Registration Process:**
1. **Verification Required:** Complete garage owner verification first
2. **Business Information:**
   • Garage name and location
   • Business license number
   • Contact information
   • Operating hours
   • Services offered

3. **Service Categories:**
   • General maintenance
   • Engine repair
   • Body work
   • Electrical services
   • AC repair
   • Tire services
   • Performance tuning

4. **Facility Information:**
   • Number of service bays
   • Equipment available
   • Specialized tools
   • Certifications held
   • Staff qualifications

5. **Pricing Structure:**
   • Service rates
   • Labor charges
   • Diagnostic fees
   • Parts markup
   • Warranty terms

**Required Documentation:**
• Business/Trade license
• Municipality permits
• Insurance certificates
• Staff certifications
• Equipment certifications

**Photo Requirements:**
• Facility exterior and interior
• Service bays and equipment
• Staff at work
• Completed projects
• Certifications and awards

**Profile Optimization:**
• Complete all sections
• Add detailed service descriptions
• Upload high-quality photos
• Set competitive pricing
• Respond quickly to inquiries

**Marketing Features:**
• Featured garage placement
• Customer review system
• Before/after photo gallery
• Special offers and promotions
• Social media integration`,
    category: 'Garage Hub',
    tags: ['garage', 'business', 'services', 'registration', 'verification'],
    views: 4200,
    helpful: 89,
    lastUpdated: '2024-09-16',
    isPublished: true,
    priority: 1
  },
  {
    id: 'garage-verification',
    title: 'Garage Verification Process',
    content: `Professional verification ensures quality service providers on our platform.

**Verification Requirements:**
1. **Business Documentation:**
   • Valid trade license
   • Municipality NOC
   • Business registration
   • Tax registration (if applicable)

2. **Facility Inspection:**
   • On-site verification visit
   • Equipment assessment
   • Safety compliance check
   • Service capability evaluation

3. **Professional Credentials:**
   • Staff certifications
   • Technical qualifications
   • Experience documentation
   • Training certificates

4. **Insurance & Compliance:**
   • Public liability insurance
   • Workers' compensation
   • Environmental compliance
   • Safety certifications

**Verification Process:**
1. **Submit Application:** Complete online form with documents
2. **Document Review:** Admin reviews submitted documents (2-3 days)
3. **Site Inspection:** Scheduled facility visit (1 week)
4. **Quality Assessment:** Service standards evaluation
5. **Final Approval:** Verification badge granted

**Verification Levels:**
• **Basic Verified:** Documents approved
• **Premium Verified:** Facility inspected
• **Elite Verified:** Full quality assessment passed

**Benefits of Verification:**
• Verified garage badge
• Higher search ranking
• Customer trust increase
• Access to repair bid system
• Marketing feature eligibility
• Priority customer support

**Maintaining Verification:**
• Annual renewal required
• Ongoing quality monitoring
• Customer feedback reviews
• Compliance updates
• Continuous improvement`,
    category: 'Garage Hub',
    tags: ['verification', 'garage', 'business', 'compliance', 'quality'],
    views: 3600,
    helpful: 91,
    lastUpdated: '2024-09-14',
    isPublished: true,
    priority: 2
  },

  // Repair Bid System
  {
    id: 'how-repair-bids-work',
    title: 'How Repair Bids Work',
    content: `Connect with verified garages through our competitive bidding system.

**For Car Owners:**

**1. Post Repair Request:**
• Describe the problem in detail
• Upload clear photos/videos
• Set preferred location/timing
• Specify budget range (optional)

**2. Receive Bids:**
• Verified garages submit bids
• Compare prices and services
• Review garage ratings/reviews
• Ask questions to garages

**3. Select Garage:**
• Choose the best offer
• Confirm appointment
• Secure payment in escrow
• Schedule service

**4. Service Completion:**
• Garage completes work
• Inspect and approve work
• Payment released automatically
• Leave review and rating

**For Garage Owners:**

**1. Browse Requests:**
• View repair requests in your area
• Filter by service type
• Check customer requirements
• Assess job complexity

**2. Submit Competitive Bids:**
• Provide detailed quote
• Explain repair process
• Mention warranties offered
• Set realistic timelines

**3. Win Jobs:**
• Customer selects your bid
• Coordinate with customer
• Schedule service appointment
• Begin repair work

**Bid Components:**
• Labor cost breakdown
• Parts cost estimate
• Timeline for completion
• Warranty terms
• Payment schedule

**Success Tips:**
• Respond quickly to requests
• Provide detailed explanations
• Offer competitive pricing
• Maintain high ratings
• Communicate professionally

**Payment Protection:**
• Escrow system protects both parties
• Payment released after completion
• Dispute resolution available
• Secure transaction processing`,
    category: 'Repair Bid',
    tags: ['repair', 'bid', 'garage', 'service', 'payment'],
    views: 9500,
    helpful: 94,
    lastUpdated: '2024-09-19',
    isPublished: true,
    priority: 1
  },
  {
    id: 'buy-bid-credits',
    title: 'Buy Bid Credits',
    content: `Garage owners need bid credits to participate in the repair bid system.

**What are Bid Credits?**
Bid credits are virtual currency that garage owners use to submit bids on repair requests. Each bid requires credits to ensure serious participation.

**Credit Packages:**
• **Starter Pack:** 50 credits - AED 99
• **Professional:** 150 credits - AED 249
• **Business:** 300 credits - AED 449
• **Enterprise:** 600 credits - AED 799

**Credit Usage:**
• Standard bid: 1 credit
• Priority bid: 2 credits
• Express bid: 3 credits
• Premium showcase: 5 credits

**How to Purchase:**
1. **Go to Bid Wallet** in your garage dashboard
2. **Select Package:** Choose credits package
3. **Payment Method:** Card, bank transfer, or digital wallet
4. **Instant Activation:** Credits available immediately
5. **Receipt:** Email confirmation sent

**Credit Benefits:**
• No expiry date
• Transferable between jobs
• Refundable for winning bids
• Bulk purchase discounts
• Priority support included

**Payment Methods:**
• Credit/Debit cards (Visa, Mastercard)
• Bank transfer (instant verification)
• Apple Pay / Google Pay
• PayPal (select regions)

**Credit Management:**
• Real-time credit balance
• Usage history tracking
• Low balance notifications
• Auto-reload options
• Monthly usage reports

**Refund Policy:**
• Unused credits: Full refund within 30 days
• Winning bids: Credits refunded automatically
• System errors: Immediate credit restoration
• Account closure: Pro-rated refund available

**Tips for Credit Efficiency:**
• Start with smaller packages
• Monitor usage patterns
• Use priority bids strategically
• Focus on high-value jobs
• Build reputation for better success rates`,
    category: 'Repair Bid',
    tags: ['credits', 'payment', 'garage', 'bid', 'wallet'],
    views: 2800,
    helpful: 87,
    lastUpdated: '2024-09-12',
    isPublished: true,
    priority: 3
  },

  // Boosts & Promotion
  {
    id: 'how-boost-works',
    title: 'How Boost Works',
    content: `Increase your listing visibility and sell faster with our boost features.

**Boost Types:**

**1. Featured Listing (AED 49/week):**
• Top placement in search results
• Golden highlight border
• "Featured" badge
• 5x more visibility
• Priority in recommendations

**2. Urgent Sale (AED 29/week):**
• Red "Urgent" badge
• Highlighted in urgent section
• Push notifications to followers
• Social media promotion
• 3x more inquiries

**3. Premium Gallery (AED 39/week):**
• Up to 20 photos (vs standard 10)
• HD photo optimization
• Video upload capability
• 360° view support
• Professional photo review

**4. Social Boost (AED 25/week):**
• Shared on our social media
• Instagram story features
• TikTok video creation
• YouTube shorts inclusion
• Cross-platform promotion

**Boost Combinations:**
• **Power Pack:** All boosts + 20% discount
• **Quick Sale:** Featured + Urgent + Social
• **Premium Pack:** Featured + Gallery + Social
• **Starter Boost:** Any single boost feature

**How to Boost:**
1. **From Your Listing:** Click "Boost This Listing"
2. **Choose Boost Type:** Select features you want
3. **Set Duration:** 1 week to 4 weeks options
4. **Payment:** Secure checkout process
5. **Instant Activation:** Boost starts immediately

**Boost Analytics:**
• View count increases
• Inquiry rate improvements
• Click-through statistics
• Performance comparisons
• ROI calculations

**Best Practices:**
• Boost during peak times (weekends)
• Combine with price reductions
• Update photos before boosting
• Respond quickly to increased inquiries
• Monitor performance metrics

**Success Stories:**
• Average 5x more views with Featured
• 3x more inquiries with Urgent badge
• 40% faster sales with Premium Gallery
• 60% more social engagement with Social Boost

**Money-Back Guarantee:**
• No increase in views within 48 hours
• Technical issues affecting boost
• Unsatisfied with boost performance
• Full refund within 7 days`,
    category: 'Boosts & Promotion',
    tags: ['boost', 'promotion', 'featured', 'visibility', 'marketing'],
    views: 7200,
    helpful: 92,
    lastUpdated: '2024-09-17',
    isPublished: true,
    priority: 1
  },
  {
    id: 'featured-placement',
    title: 'Featured Placement',
    content: `Get maximum visibility with featured placement in search results.

**Featured Placement Benefits:**
• **Top Position:** Always appear first in search results
• **Golden Border:** Eye-catching highlight design
• **Featured Badge:** Credibility and attention booster
• **5x Visibility:** Dramatically increased view counts
• **Priority Alerts:** Notifications to interested buyers

**How Featured Works:**
1. **Search Priority:** Your listing appears before all others
2. **Category Dominance:** Featured in relevant categories
3. **Mobile Optimization:** Prominent display on mobile apps
4. **Desktop Placement:** Premium position on web platform
5. **Recommendation Engine:** Included in AI suggestions

**Pricing Structure:**
• **1 Week:** AED 49 (most popular)
• **2 Weeks:** AED 89 (15% savings)
• **3 Weeks:** AED 119 (25% savings)
• **4 Weeks:** AED 149 (35% savings)

**Performance Metrics:**
• **View Increase:** Average 500% more views
• **Inquiry Rate:** 300% more messages/calls
• **Sale Speed:** 60% faster sales completion
• **Price Achievement:** 95% of asking price average

**Target Audience:**
• **High-Value Cars:** Luxury and sports vehicles
• **Quick Sales:** Time-sensitive sellers
• **Business Sellers:** Dealers and importers
• **Competitive Markets:** Popular car categories

**Optimization Tips:**
• **Professional Photos:** High-quality images essential
• **Competitive Pricing:** Market-appropriate prices
• **Complete Details:** All specifications filled
• **Quick Response:** Fast reply to inquiries
• **Regular Updates:** Keep listing information current

**Feature Comparison:**
• **Standard Listing:** Random position, basic visibility
• **Featured Listing:** Top position, enhanced visibility
• **Premium Featured:** Top position + additional benefits

**ROI Analysis:**
• **Investment:** AED 49 per week
• **Average Sale:** 40% faster completion
• **Price Premium:** 5-10% higher selling prices
• **Time Savings:** Less time managing inquiries
• **Stress Reduction:** Faster, smoother sales process

**Success Guarantee:**
• Minimum 3x view increase or money back
• Technical support throughout boost period
• Performance monitoring and optimization
• Customer success team assistance`,
    category: 'Boosts & Promotion',
    tags: ['featured', 'placement', 'search', 'priority', 'visibility'],
    views: 4500,
    helpful: 89,
    lastUpdated: '2024-09-15',
    isPublished: true,
    priority: 2
  },

  // Payments & Billing
  {
    id: 'payment-methods',
    title: 'Payment Methods',
    content: `We support multiple secure payment options for your convenience.

**Accepted Payment Methods:**

**Credit/Debit Cards:**
• Visa (all variants)
• Mastercard (all variants)
• American Express
• Discover
• Local UAE bank cards

**Digital Wallets:**
• Apple Pay
• Google Pay
• Samsung Pay
• PayPal (select services)

**Bank Transfers:**
• ADCB, Emirates NBD, FAB
• Instant verification
• Same-day processing
• Bulk payment options

**Alternative Methods:**
• Cash payments (meetup locations)
• Bank drafts (high-value transactions)
• Cryptocurrency (Bitcoin, Ethereum)
• Corporate accounts

**Payment Security:**
• **PCI DSS Compliant:** Industry-standard security
• **SSL Encryption:** All transactions encrypted
• **Fraud Protection:** Advanced fraud detection
• **3D Secure:** Additional authentication layer
• **Dispute Resolution:** Chargeback protection

**Service-Specific Payments:**

**Listing Payments:**
• One-time listing fees
• Boost and promotion charges
• Featured placement costs
• Premium gallery upgrades

**Subscription Services:**
• Monthly premium memberships
• Annual plan discounts
• Auto-renewal options
• Pause/cancel anytime

**Repair Bid Payments:**
• Escrow-protected transactions
• Milestone-based payments
• Automatic release system
• Dispute resolution support

**Import Car Services:**
• Deposit requirements
• Progress-based payments
• Final payment on delivery
• International wire transfers

**Currency Support:**
• UAE Dirham (AED) - Primary
• US Dollar (USD)
• Euro (EUR)
• British Pound (GBP)
• Saudi Riyal (SAR)

**Payment Processing:**
• **Instant:** Card payments, digital wallets
• **Same Day:** Bank transfers within UAE
• **1-2 Days:** International transfers
• **Manual Review:** High-value transactions

**Receipt Management:**
• Email receipts for all transactions
• PDF invoice generation
• Transaction history access
• Expense tracking tools
• Tax documentation support`,
    category: 'Payments & Billing',
    tags: ['payment', 'billing', 'cards', 'security', 'methods'],
    views: 5600,
    helpful: 93,
    lastUpdated: '2024-09-18',
    isPublished: true,
    priority: 1
  },

  // XP System
  {
    id: 'xp-system-guide',
    title: 'XP System Guide',
    content: `Earn Experience Points (XP) and unlock rewards through platform activities.

**How to Earn XP:**

**Daily Activities:**
• **Login Daily:** +5 XP per day
• **Profile Update:** +10 XP
• **Post in Community:** +10 XP per post
• **Comment on Posts:** +3 XP per comment
• **Like/React:** +1 XP per reaction

**Engagement Activities:**
• **Receive Post Likes:** +5 XP per like
• **Get Comments:** +3 XP per comment
• **Share Content:** +8 XP per share
• **Follow Users:** +2 XP per follow
• **Get Followed:** +5 XP per follower

**Platform Milestones:**
• **Complete Profile:** +50 XP (one-time)
• **Get Verified:** +100 XP (one-time)
• **First Listing:** +25 XP (one-time)
• **First Sale:** +50 XP (one-time)
• **Join Community:** +15 XP per community

**Community Events:**
• **Attend Meetup:** +25 XP per event
• **Organize Meetup:** +50 XP per event
• **Win Contest:** +100 XP per win
• **Feature in Newsletter:** +75 XP
• **Community Moderator:** +200 XP (monthly)

**Business Activities:**
• **Create Listing:** +15 XP per listing
• **Successful Sale:** +30 XP per sale
• **Five-Star Review:** +20 XP per review
• **Garage Service:** +40 XP per service
• **Repair Bid Win:** +35 XP per job

**Level System:**
• **Level 1:** 0-99 XP (Newcomer)
• **Level 2:** 100-299 XP (Member)
• **Level 3:** 300-599 XP (Active Member)
• **Level 4:** 600-999 XP (Trusted Member)
• **Level 5:** 1000-1999 XP (Expert)
• **Level 6:** 2000-3999 XP (Elite)
• **Level 7:** 4000-7999 XP (Master)
• **Level 8:** 8000+ XP (Legend)

**Level Benefits:**
• **Higher Search Ranking:** Better listing visibility
• **Priority Support:** Faster customer service
• **Exclusive Events:** Access to VIP meetups
• **Special Badges:** Unique profile recognition
• **Discount Perks:** Reduced listing fees
• **Early Access:** New features first

**XP Multipliers:**
• **Weekend Events:** 2x XP on weekends
• **Special Occasions:** 3x XP during holidays
• **Premium Members:** 1.5x XP multiplier
• **Verified Users:** 1.25x XP bonus
• **Community Champions:** 2x social XP

**Tracking Your Progress:**
• **Profile Dashboard:** View current XP and level
• **Activity History:** See all XP-earning activities
• **Next Level Preview:** Requirements for advancement
• **Leaderboards:** Compare with other users
• **Achievement Badges:** Visual progress markers`,
    category: 'Getting Started',
    tags: ['xp', 'experience', 'points', 'levels', 'rewards'],
    views: 11000,
    helpful: 95,
    lastUpdated: '2024-09-20',
    isPublished: true,
    priority: 1
  },

  // Import Car Service
  {
    id: 'import-car-guide',
    title: 'Import Car Guide',
    content: `Complete guide to importing your Chinese car to the UAE.

**Import Process Overview:**
1. **Pre-Import Planning**
2. **Documentation Preparation**
3. **Shipping Coordination**
4. **Customs Clearance**
5. **RTA Registration**
6. **Insurance & Final Steps**

**Step 1: Pre-Import Planning**
• **Car Eligibility:** Check if your car meets UAE import requirements
• **Age Restrictions:** Maximum 5 years old for most vehicles
• **Emissions Standards:** Euro 4 or higher required
• **Safety Features:** Ensure compliance with UAE safety standards

**Step 2: Required Documents**
• **Original Invoice:** Purchase receipt from China
• **Export Certificate:** Chinese customs clearance
• **Manufacturer COC:** Certificate of Conformity
• **Shipping Documents:** Bill of lading, packing list
• **Insurance Papers:** Marine insurance certificate

**Step 3: Shipping Options**
• **Container Shipping:** Safest, most common method
• **Roll-on/Roll-off:** More economical option
• **Shared Container:** Cost-effective for single cars
• **Express Shipping:** Faster but more expensive

**Step 4: UAE Customs Process**
• **Customs Declaration:** Submit import documents
• **Duty Calculation:** Based on car value and specifications
• **Inspection:** Physical vehicle examination
• **Payment:** Customs duties and fees
• **Release Order:** Vehicle cleared for collection

**Step 5: RTA Registration**
• **Technical Inspection:** Safety and emissions testing
• **Plate Number:** Choose from available options
• **Registration Fee:** Based on car value
• **Insurance:** Mandatory third-party minimum
• **Final Registration:** Receive registration card

**Cost Breakdown:**
• **Shipping:** $800-2000 USD depending on method
• **Customs Duty:** 5% of car value
• **Registration:** AED 420-2000 (value-based)
• **Inspection:** AED 170
• **Insurance:** AED 500-3000 annually
• **Service Fees:** AED 300-800

**Timeline:**
• **Shipping:** 15-30 days from China
• **Customs Clearance:** 3-7 days
• **RTA Registration:** 1-3 days
• **Total Process:** 20-40 days

**Our Import Services:**
• **Document Assistance:** Help with paperwork
• **Shipping Coordination:** Trusted logistics partners
• **Customs Clearance:** Expert handling
• **RTA Support:** Registration assistance
• **Insurance Guidance:** Best coverage options
• **Full-Service Package:** End-to-end support

**Common Challenges:**
• **Document Translation:** Chinese to English/Arabic
• **Specification Conversion:** Metric to local standards
• **Compliance Issues:** Meeting UAE requirements
• **Hidden Costs:** Unexpected fees and charges
• **Time Delays:** Weather, port congestion

**Success Tips:**
• Start process early (2-3 months ahead)
• Use experienced import agents
• Budget for unexpected costs
• Keep all original documents
• Choose reputable shipping companies
• Consider full-service packages

**Support Contact:**
• Import Specialist: +971 50 353 0121
• Email: import@sublimesdrive.com
• WhatsApp: Available 24/7
• Office Hours: 9 AM - 6 PM, Sun-Thu`,
    category: 'Import Services',
    tags: ['import', 'car', 'china', 'customs', 'registration'],
    views: 3400,
    helpful: 88,
    lastUpdated: '2024-09-16',
    isPublished: true,
    priority: 2
  },

  // Additional comprehensive articles
  {
    id: 'seller-hub-guide',
    title: 'Bulk Packages & Analytics',
    content: `Unlock powerful selling tools with our Seller Hub features.

**Bulk Listing Packages:**
• **Starter Package:** 5 listings - AED 99
• **Professional:** 15 listings - AED 249 
• **Business:** 50 listings - AED 599
• **Enterprise:** 100 listings - AED 999

**Analytics Dashboard:**
Track your listing performance with detailed insights:

• **View Analytics:** Daily, weekly, monthly views
• **Inquiry Tracking:** Messages and calls received
• **Conversion Rates:** Views to inquiries ratio
• **Best Performing:** Top listings by engagement
• **Market Insights:** Compare with similar listings

**Performance Optimization:**
• **Photo Quality Score:** AI-powered photo analysis
• **Title Optimization:** SEO suggestions for better visibility
• **Price Recommendations:** Market-based pricing advice
• **Listing Health:** Complete profile recommendations

**Seller Tools:**
• **Quick Repost:** Repost expired listings instantly
• **Bulk Edit:** Update multiple listings at once
• **Auto-Refresh:** Keep listings active automatically
• **Social Sharing:** Cross-post to social platforms

**Success Metrics:**
• Average 40% more inquiries with bulk packages
• 60% faster sales with analytics optimization
• 25% higher selling prices with proper optimization`,
    category: 'Seller Hub',
    tags: ['seller', 'bulk', 'analytics', 'performance', 'optimization'],
    views: 2100,
    helpful: 91,
    lastUpdated: '2024-09-20',
    isPublished: true,
    priority: 2
  },
  {
    id: 'offers-deals-guide',
    title: 'How Offers Work',
    content: `Discover exclusive offers and deals on Sublimes Drive.

**Types of Offers:**
• **Welcome Offers:** New user discounts
• **Loyalty Rewards:** Regular user benefits
• **Seasonal Deals:** Holiday and event specials
• **Flash Sales:** Limited-time promotions
• **Bulk Discounts:** Volume-based savings

**How to Find Offers:**
1. **Offers Page:** Browse all current deals
2. **Email Notifications:** Personalized offers
3. **Push Notifications:** Flash sale alerts
4. **Social Media:** Exclusive social deals
5. **Loyalty Dashboard:** Member-only offers

**Redeem Process:**
1. **Find Offer:** Browse available deals
2. **Check Eligibility:** Verify requirements
3. **Apply Code:** Use promo code at checkout
4. **Confirm Savings:** See discount applied
5. **Complete Purchase:** Enjoy your savings

**Offer Categories:**
• **Listing Discounts:** Reduced posting fees
• **Boost Promotions:** Discounted visibility boosts
• **Service Deals:** Garage service savings
• **Import Offers:** Car import discounts
• **Premium Features:** Free upgrades

**Voucher System:**
• **Digital Vouchers:** Instant redemption
• **Gift Vouchers:** Share with friends
• **Bulk Vouchers:** Business discounts
• **Referral Credits:** Earn through referrals

**Terms & Conditions:**
• Valid for limited time only
• Cannot be combined with other offers
• Subject to availability
• Non-transferable unless specified
• See individual offer terms`,
    category: 'Offers & Deals',
    tags: ['offers', 'deals', 'discounts', 'vouchers', 'promotions'],
    views: 3800,
    helpful: 89,
    lastUpdated: '2024-09-19',
    isPublished: true,
    priority: 2
  },
  {
    id: 'community-guidelines',
    title: 'Community Guidelines',
    content: `Creating a respectful and engaging community for all car enthusiasts.

**Community Rules:**
1. **Be Respectful:** Treat all members with courtesy
2. **Stay On Topic:** Keep discussions car-related
3. **No Spam:** Avoid repetitive or promotional posts
4. **Original Content:** Share your own photos and experiences
5. **Help Others:** Answer questions and provide assistance

**Posting Guidelines:**
• **High-Quality Photos:** Clear, well-lit images
• **Descriptive Titles:** Clear and informative
• **Proper Categories:** Post in relevant communities
• **No Duplicate Posts:** Avoid cross-posting same content
• **Constructive Comments:** Add value to discussions

**Community Features:**
• **BMW Enthusiasts:** Dedicated BMW community
• **BYD Owners:** Electric vehicle discussions
• **Geely Community:** Chinese car owners
• **Track Day Group:** Racing and performance
• **Meetup Organizers:** Event planning hub

**Moderation:**
• **Community Moderators:** Volunteer helpers
• **Report System:** Flag inappropriate content
• **Warning System:** Three-strike policy
• **Appeal Process:** Contest moderation decisions
• **Ban Appeals:** Request account restoration

**Earning XP in Communities:**
• **Create Posts:** +10 XP per post
• **Receive Likes:** +5 XP per like
• **Comments:** +3 XP per comment
• **Share Posts:** +8 XP per share
• **Help Others:** Bonus XP for helpful answers

**Best Practices:**
• **Engage Regularly:** Daily participation recommended
• **Share Knowledge:** Help newcomers
• **Organize Events:** Create meetups and gatherings
• **Document Journeys:** Share car modification progress
• **Build Connections:** Network with fellow enthusiasts`,
    category: 'Community',
    tags: ['community', 'guidelines', 'rules', 'engagement', 'moderation'],
    views: 4500,
    helpful: 94,
    lastUpdated: '2024-09-18',
    isPublished: true,
    priority: 1
  }
];

export const getKnowledgeBaseByCategory = (category: string): KnowledgeBaseItem[] => {
  return knowledgeBase.filter(item => item.category === category && item.isPublished);
};

export const searchKnowledgeBase = (query: string): KnowledgeBaseItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return knowledgeBase.filter(item => 
    item.isPublished && (
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.content.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  );
};

export const getPopularArticles = (limit: number = 6): KnowledgeBaseItem[] => {
  return knowledgeBase
    .filter(item => item.isPublished)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

export const getFeaturedArticles = (): KnowledgeBaseItem[] => {
  return knowledgeBase
    .filter(item => item.isPublished && item.priority === 1)
    .sort((a, b) => b.views - a.views);
};