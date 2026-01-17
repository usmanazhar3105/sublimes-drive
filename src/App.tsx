import { useState, useEffect, useRef } from 'react';
import './src/i18n/config'; // Initialize i18n
import { initSentry } from './utils/monitoring/sentry';
import { initAnalytics, trackPageView } from './utils/monitoring/analytics';
import { supabase } from './utils/supabase/client';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { ConsentBanner } from './components/ConsentBanner';
import { HomePage } from './components/HomePage_Wired';
import { CommunitiesPage } from './components/CommunitiesPage_Wired';
import { MarketplacePage } from './components/MarketplacePage_Wired';
import { GarageHubPage } from './components/GarageHubPage_Wired';
import { InstantMeetupPage } from './components/InstantMeetupPage_Wired';
import { ProfilePage } from './components/ProfilePage_Wired';
import { OffersPage } from './components/OffersPage_Wired';
import { PlaceYourAdPage } from './components/PlaceYourAdPage_Wired';
import { MyListingsPage } from './components/MyListingsPage_Wired';
import { MyPostsPage } from './components/MyPostsPage';
import { MyCommentsPage } from './components/MyCommentsPage_Wired';
import { RepairBidPage } from './components/RepairBidPage_Wired';
import { ImportYourCarPage } from './components/ImportYourCarPage_Wired';
import { LegalHubPage } from './components/LegalHubPage_Wired';
import { LeaderboardPage_Complete_Wired as LeaderboardPage } from './components/LeaderboardPage_Complete_Wired';
import { EventsPage } from './components/EventsPage_Wired';
import { SearchPage } from './components/SearchPage_Wired';
import { ServiceLogPage } from './components/ServiceLogPage';
import CommunityDebug from './pages/CommunityDebug';
import { CreatePostModal } from './components/CreatePostModal_Full';
import { ActionModal } from './components/ActionModal';
import { MoreModal } from './components/MoreModal';
import { CreateMeetupModal } from './components/CreateMeetupModal';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import FailsafeDataProbe from './components/FailsafeDataProbe';

// Enterprise Pages
import MFASetupPage from './components/auth/MFASetupPage';
import DeviceManagementPage from './components/auth/DeviceManagementPage';
import NotificationPreferencesPage from './components/NotificationPreferencesPage';
import DataExportPage from './components/DataExportPage';
import MaintenancePage from './components/MaintenancePage';

// Authentication Components
import { WelcomePage } from './components/auth/WelcomePage_Wired';
import { LoginPage } from './components/auth/LoginPage_Wired';
import { SignupPage } from './components/auth/SignupPage_Wired';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage_Wired';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage_Wired';
import { RoleSelectionPage } from './components/auth/RoleSelectionPage_Wired';
import { VerifyCarOwnerPage } from './components/auth/VerifyCarOwnerPage';
import { VerifyGarageOwnerPage } from './components/auth/VerifyGarageOwnerPage';
import { VerifyVendorPage_Wired } from './components/auth/VerifyVendorPage_Wired';

// Onboarding Components
import { OnboardingPage } from './components/onboarding/OnboardingPage';

// Profile Components
import { ProfileSettingsPage } from './components/profile/ProfileSettingsPage';
import { SavedPage } from './components/SavedPage_Wired';
import { MyOrdersPage } from './components/MyOrdersPage_Wired';
import { MyPackagesPage } from './components/MyPackagesPage_Wired';
import { MyBoostsPage } from './components/MyBoostsPage_Wired';
// Removed duplicate - using MyListingsPage_Wired on line 19

// Notification Components
import { NotificationsPage } from './components/notifications/NotificationsPage';

// Messaging Components
import { ConversationsPage } from './components/messaging/ConversationsPage';
import { ChatPage } from './components/messaging/ChatPage';

// Payment Components
import { ListingPaymentPage } from './components/payments/ListingPaymentPage';
import { StripePaymentPage } from './components/payments/StripePaymentPage_Wired';
import { PaymentSuccessPage } from './components/payments/PaymentSuccessPage';

// Listing Components
import { CreateCarListingPage } from './components/listings/CreateCarListingPage_FIXED_CHINESE_BRANDS';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Legal Components
import { TermsOfServicePage } from './components/legal/TermsOfServicePage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { RefundPolicyPage } from './components/legal/RefundPolicyPage';
import { AboutUsPage } from './components/legal/AboutUsPage';
import { FAQKnowledgeBasePage } from './components/legal/FAQKnowledgeBasePage';

// Chat Components
import { AIChatBot } from './components/chat/AIChatBot';
import { AIChatAssistantPage } from './components/chat/AIChatAssistantPage';

// Debug Component
import { DebugPage } from './components/DebugPage';
import { DiagnosticStartup } from './components/DiagnosticStartup';

// Phase 4 Enhanced Components
import { DailyChallengesPage } from './components/DailyChallengesPage';
import { WalletPage } from './components/WalletPage_Wired';
import { Shield } from 'lucide-react';
import { Button } from './components/ui/button';
import { useProfile } from './hooks';

export default function App() {
  // Check for environment variable errors
  const envError = typeof window !== 'undefined' ? (window as any).__ENV_ERROR__ : null;
  
  // Initialize currentPage from URL pathname
  const getInitialPage = () => {
    if (typeof window === 'undefined') return 'welcome';
    const path = window.location.pathname.slice(1); // Remove leading '/'
    return path || 'welcome';
  };
  
  const [isDark, setIsDark] = useState(true);
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [listingData, setListingData] = useState<any>(null);
  const [listingType, setListingType] = useState<'marketplace' | 'garage'>('marketplace');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [e2eRan, setE2ERan] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  
  // Ref to track if initial session has been handled to prevent redirect loops
  const initialSessionHandledRef = useRef(false);
  
  // Only load profile if authenticated (prevents unnecessary re-renders)
  const { profile } = useProfile();
  
  // Log app start only once
  useEffect(() => {
    console.log('🚀 Sublimes Drive App Starting...');
  }, []);
  
  // Show error screen if environment variables are missing
  if (envError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1426] text-white p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold mb-4 text-[#D4AF37]">⚠️ Configuration Error</h1>
          <p className="text-lg mb-4 text-red-400">{envError}</p>
          <div className="bg-[#1a1f2e] p-6 rounded-lg text-left mt-6">
            <h2 className="text-xl font-semibold mb-3">How to Fix:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Go to your Vercel Dashboard</li>
              <li>Select your project</li>
              <li>Go to <strong>Settings → Environment Variables</strong></li>
              <li>Add the following variables:</li>
            </ol>
            <div className="mt-4 p-4 bg-[#0B1426] rounded font-mono text-sm">
              <div className="mb-2">
                <span className="text-[#D4AF37]">VITE_SUPABASE_URL</span> = https://YOUR_PROJECT_ID.supabase.co
              </div>
              <div>
                <span className="text-[#D4AF37]">VITE_SUPABASE_ANON_KEY</span> = YOUR_SUPABASE_ANON_KEY
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              After adding the variables, redeploy your project in Vercel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle OAuth callback on mount (only run once)
  useEffect(() => {
    // Check for OAuth callback in URL hash
    const urlHash = window.location.hash;
    if (urlHash.includes('access_token') || urlHash.includes('type=recovery')) {
      console.log('🔄 Detected OAuth callback in URL, waiting for auth state change...');
      // Supabase will handle the callback via detectSessionInUrl
      // The auth state change handler will redirect to home
      // Don't update currentPage here, let the auth handler do it
      return;
    }
    
    // Check if we're on /home path after OAuth (pathname might be /home but currentPage is wrong)
    // Only update if there's actually a mismatch to prevent infinite loops
    // Use a ref to track if we've already synced
    const pathname = window.location.pathname;
    if (pathname === '/home' && currentPage !== 'home') {
      console.log('🔄 Detected /home path, syncing currentPage...');
      setCurrentPage('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - don't depend on currentPage to avoid loops

  // Sync URL with currentPage state
  useEffect(() => {
    // Don't update URL if we're handling an OAuth callback (has hash fragments)
    const urlHash = window.location.hash;
    const isOAuthCallback = urlHash.includes('access_token') || urlHash.includes('type=recovery');
    
    if (isOAuthCallback) {
      // Let Supabase handle the OAuth callback first
      return;
    }
    
    // Update URL when currentPage changes, but only if it's actually different
    const newPath = `/${currentPage}`;
    const currentPath = window.location.pathname;
    
    // Prevent unnecessary URL updates that could trigger redirect loops
    if (currentPath !== newPath) {
      // Use replaceState instead of pushState to avoid adding to history unnecessarily
      window.history.replaceState({}, '', newPath);
    }
  }, [currentPage]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Don't interfere with OAuth callbacks
      const urlHash = window.location.hash;
      const isOAuthCallback = urlHash.includes('access_token') || urlHash.includes('type=recovery');
      
      if (!isOAuthCallback) {
        const path = window.location.pathname.slice(1) || 'welcome';
        setCurrentPage(path);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize monitoring on app load
  useEffect(() => {
    try {
      initSentry();
      initAnalytics();
      console.log('✅ Enterprise monitoring initialized');
    } catch (error) {
      console.warn('⚠️ Monitoring initialization failed (non-critical):', error);
    }
  }, []);

  // Check authentication state on mount and handle auth state changes
  useEffect(() => {
    let mounted = true;
    
    try {
      // 🧪 COMPLETE TEST BYPASS: Mock authentication as car owner (NO SUPABASE REQUIRED)
      // Enable via: ?testBypass=true in URL, or VITE_TEST_BYPASS=true in .env.local, or localStorage.setItem('testBypass', 'true')
      const urlParams = new URLSearchParams(window.location.search);
      const testBypassFromUrl = urlParams.get('testBypass') === 'true';
      const testBypassFromEnv = import.meta.env.DEV && import.meta.env.VITE_TEST_BYPASS === 'true';
      const testBypassFromStorage = localStorage.getItem('testBypass') === 'true';
      const TEST_BYPASS_ENABLED = import.meta.env.DEV && (testBypassFromUrl || testBypassFromEnv || testBypassFromStorage);
      
      if (TEST_BYPASS_ENABLED) {
        console.log('🧪 TEST MODE: Complete auth bypass - Mocking car owner session (NO SUPABASE REQUIRED)');
        console.log('💡 To disable: Remove ?testBypass=true from URL or set localStorage.removeItem("testBypass")');
        
        // Create mock session and user
        const mockUserId = 'test-bypass-car-owner-id';
        const mockUser = {
          id: mockUserId,
          email: 'test-car-owner@sublimesdrive.com',
          user_metadata: {
            display_name: 'Test Car Owner',
            full_name: 'Test Car Owner'
          },
          app_metadata: {
            provider: 'test-bypass'
          }
        };
        
        const mockSession = {
          access_token: 'test-bypass-token',
          refresh_token: 'test-bypass-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser
        };
        
        // Store mock session in localStorage (Supabase format)
        localStorage.setItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token', JSON.stringify({
          access_token: mockSession.access_token,
          refresh_token: mockSession.refresh_token,
          expires_at: mockSession.expires_at,
          expires_in: mockSession.expires_in,
          token_type: mockSession.token_type,
          user: mockUser
        }));
        
        // Set authenticated state
        setIsAuthenticated(true);
        setCurrentPage('home');
        
        // Mock profile in global scope for hooks to access
        (window as any).__MOCK_PROFILE__ = {
          id: mockUserId,
          email: 'test-car-owner@sublimesdrive.com',
          display_name: 'Test Car Owner',
          full_name: 'Test Car Owner',
          role: 'user', // Car owner role
          username: 'testcarowner',
          avatar_url: null,
          wallet_balance: 1000,
          xp_points: 500,
          level: 5,
          created_at: new Date().toISOString()
        };
        
        console.log('✅ Test bypass: Mock car owner session created');
        console.log('   User ID:', mockUserId);
        console.log('   Email: test-car-owner@sublimesdrive.com');
        console.log('   Role: user (car owner)');
        
        // Remove testBypass from URL if present
        if (testBypassFromUrl) {
          urlParams.delete('testBypass');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
        }
        
        return; // Skip all Supabase auth checks
      }
      
      // Check if this is an OAuth callback - if so, wait for session to be processed
      const urlHash = window.location.hash;
      const isOAuthCallback = urlHash.includes('access_token') || urlHash.includes('type=recovery');
      
      if (isOAuthCallback) {
        console.log('🔄 OAuth callback detected, waiting for session to be established...');
        // Don't check session immediately - let Supabase process the callback first
        // The onAuthStateChange handler will handle the session
        return;
      }
      
      // Check initial session (only if not OAuth callback and not test bypass)
      if (!TEST_BYPASS_ENABLED) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!mounted) return;
          
          if (session) {
            setIsAuthenticated(true);
            // Only navigate to home if on welcome page (not login/signup - allow users to switch accounts)
            // Only update if not already on home to prevent loops
            if (currentPage === 'welcome') {
              setCurrentPage('home');
            }
            console.log('✅ User is authenticated:', session.user.email);
          } else {
            setIsAuthenticated(false);
            console.log('❌ No active session');
            // Only redirect to welcome if not already on an auth page and not on /home
            const authPages = ['welcome', 'login', 'signup', 'forgot-password', 'verify-email', 'role-selection'];
            if (!authPages.includes(currentPage) && currentPage !== 'home') {
              setCurrentPage('welcome');
            }
          }
        }).catch((error) => {
        if (!mounted) return;
        
        console.warn('⚠️ Failed to check session:', error.message);
        
        // Check if it's a critical "Failed to fetch" error
        if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
          console.error('🚨 CRITICAL: Supabase connection failed');
          console.log('👉 Redirecting to diagnostics page...');
          setCurrentPage('diagnostics');
          setAppError('Failed to connect to Supabase. Running diagnostics...');
        } else {
          console.warn('👉 This is likely a Supabase connection issue. Continuing anyway...');
        }
        setIsAuthenticated(false);
        });
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change:', event, session?.user?.email || 'no session');
        
        // Skip INITIAL_SESSION event if it has no session and we're on /home (likely OAuth callback in progress)
        if (event === 'INITIAL_SESSION' && !session && window.location.pathname === '/home') {
          console.log('⏳ Waiting for OAuth callback to complete...');
          return;
        }
        
        if (session) {
          setIsAuthenticated(true);
          console.log('✅ Auth state changed - User logged in:', session.user.email);
          
          // Handle OAuth callbacks (SIGNED_IN or SIGNED_UP from OAuth)
          if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
            // Check if this is an OAuth callback by looking at URL hash or pathname
            const urlHash = window.location.hash;
            const pathname = window.location.pathname;
            const isOAuthCallback = urlHash.includes('access_token') || 
                                   urlHash.includes('type=recovery') ||
                                   (pathname === '/home' && urlHash);
            
            // Always redirect to home (car owner dashboard) after successful OAuth login/signup
            if (isOAuthCallback || event === 'SIGNED_UP') {
              console.log('🔄 OAuth callback detected, redirecting to car owner dashboard (home)...');
              // Clear the hash from URL if present
              if (urlHash) {
                window.history.replaceState(null, '', '/home');
              }
              // Ensure we're on home page (car owner dashboard) - only if not already there
              if (currentPage !== 'home') {
                setCurrentPage('home');
              }
            } else if (currentPage === 'welcome' || currentPage === 'login' || currentPage === 'signup') {
              // Regular sign in from login page - redirect to car owner dashboard
              console.log('✅ Redirecting to car owner dashboard (home)...');
              if (currentPage !== 'home') {
                setCurrentPage('home');
              }
            }
          } else if (event === 'INITIAL_SESSION' && session) {
            // Initial session load - if we're on /home, stay there
            // Only handle INITIAL_SESSION once to prevent infinite loops
            if (!initialSessionHandledRef.current) {
              initialSessionHandledRef.current = true;
              // Only update if currentPage is not already 'home' to prevent infinite loops
              if (window.location.pathname === '/home' && currentPage !== 'home') {
                setCurrentPage('home');
              }
            }
          }
        } else {
          // Only set as logged out if it's an explicit SIGNED_OUT event
          // Don't set logged out on INITIAL_SESSION if we're on /home (OAuth might be processing)
          if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            console.log('❌ Auth state changed - User logged out');
            // Only navigate to welcome on explicit logout, not on initial load
            // Don't redirect if user is already on login page trying to log in
            if (currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'home') {
              setCurrentPage('welcome');
            }
          } else if (event === 'INITIAL_SESSION' && !session && window.location.pathname !== '/home') {
            // Only set logged out on INITIAL_SESSION if we're not on /home
            setIsAuthenticated(false);
            console.log('❌ No active session');
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ CRITICAL: Auth initialization failed:', error);
      console.log('🔄 App will continue with welcome screen...');
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentPage is intentionally not in deps to avoid infinite loops

  // Track page views
  useEffect(() => {
    trackPageView(`/${currentPage}`);
    console.log('📱 Rendering page:', currentPage);
  }, [currentPage]);

  // E2E harness: DISABLED due to schema cache issues
  // To re-enable, ensure database schema is refreshed first
  useEffect(() => {
    if (false && import.meta.env.DEV && !e2eRan) {
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          setE2ERan(true);
          const payload: any = {
            title: 'E2E Test Post',
            body: 'Hello from E2E harness',
            media: [],
          };
          // Prefer RPC function; fallback to direct insert
          try {
            const { data, error } = await supabase.rpc('fn_create_post', {
              p_title: payload.title,
              p_body: payload.body,
              p_community_id: null,
              p_media: payload.media,
            });
            if (error) throw error;
            toast.success('E2E create-post via RPC: success');
          } catch (_rpcErr) {
            const ins = await supabase.from('posts').insert({
              user_id: session.user.id,
              title: payload.title,
              body: payload.body,
              media: payload.media,
              created_at: new Date().toISOString(),
            }).select('*').single();
            if (ins.error) throw ins.error;
            toast.success('E2E create-post via direct insert: success');
          }
        } catch (err: any) {
          toast.error(`E2E create-post failed: ${err?.message || String(err)}`);
          console.error('E2E create-post error', err);
        }
      })();
    }
  }, [e2eRan]);

  useEffect(() => {
    // Set dark theme by default
    try {
      document.documentElement.classList.toggle('dark', isDark);
    } catch (error) {
      console.warn('Theme toggle error:', error);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handlePageChange = (page: string, data?: any) => {
    try {
      // Handle modal triggers
      if (page === 'create-post') {
        setIsCreatePostOpen(true);
        return; // Don't change page, just open modal
      }
      
      setIsLoading(true);
      setCurrentPage(page);
      
      // Handle data passing for payment flow and email verification
      if (data) {
        if (page === 'listing-payment') {
          setListingData(data.listingData);
          setListingType(data.listingType);
        } else if (page === 'stripe-payment' || page === 'payment-success') {
          setPaymentData(data);
        } else if (page === 'verify-email' && data.email) {
          setPendingVerificationEmail(data.email);
        }
      }
      
      // Reset loading after a brief delay
      setTimeout(() => setIsLoading(false), 100);
    } catch (error) {
      console.error('Page navigation error:', error);
      setIsLoading(false);
    }
  };

  const renderCurrentPage = () => {
    try {
      // Authentication Pages
      switch (currentPage) {
        case 'welcome':
          return <WelcomePage onNavigate={handlePageChange} />;
        case 'login':
          return <LoginPage onNavigate={handlePageChange} />;
        case 'signup':
          return <SignupPage onNavigate={handlePageChange} />;
        case 'forgot-password':
          return <ForgotPasswordPage onNavigate={handlePageChange} />;
        case 'verify-email':
          return <VerifyEmailPage onNavigate={handlePageChange} email={pendingVerificationEmail || undefined} />;
        case 'role-selection':
          return <RoleSelectionPage onNavigate={handlePageChange} />;
        case 'verify-car-owner':
          return <VerifyCarOwnerPage onNavigate={handlePageChange} />;
        case 'verify-garage-owner':
          return <VerifyGarageOwnerPage onNavigate={handlePageChange} />;
        case 'verify-vendor':
          return <VerifyVendorPage_Wired onNavigate={handlePageChange} onBack={() => handlePageChange('profile')} />;
        case 'onboarding':
          return <OnboardingPage onNavigate={handlePageChange} />;
        
        // Profile Pages
        case 'profile-settings':
          return <ProfileSettingsPage onNavigate={handlePageChange} />;
        case 'saved':
          return <SavedPage onNavigate={handlePageChange} />;
        case 'my-orders':
          return <MyOrdersPage onNavigate={handlePageChange} />;
        case 'my-packages':
          return <MyPackagesPage onNavigate={handlePageChange} />;
        case 'my-boosts':
          return <MyBoostsPage onNavigate={handlePageChange} />;
        case 'my-listings':
          return <MyListingsPage onNavigate={handlePageChange} />;
        
        // Notification Pages
        case 'notifications':
          return <NotificationsPage onNavigate={handlePageChange} />;
        
        // Messaging Pages
        case 'conversations':
          return <ConversationsPage onNavigate={handlePageChange} />;
        case 'chat':
          return <ChatPage onNavigate={handlePageChange} />;
        case 'ai-chat-assistant':
          return <AIChatAssistantPage onNavigate={handlePageChange} />;
        
        // Payment Pages
        
        // Listing Pages
        case 'create-car-listing':
          return <CreateCarListingPage onNavigate={handlePageChange} />;
        
        // Main App Pages
        case 'home':
          return <HomePage onNavigate={handlePageChange} onCreatePost={() => setIsCreatePostOpen(true)} />;
        case 'communities':
          return <CommunitiesPage onNavigate={handlePageChange} />;
        case 'my-posts':
          return <MyPostsPage onNavigate={handlePageChange} />;
        case 'my-comments':
          return <MyCommentsPage onNavigate={handlePageChange} />;
        case 'leaderboard':
          return <LeaderboardPage />;
        case 'service-log':
        return <ServiceLogPage />;
      case 'meetup':
          // 🔥 ROLE RESTRICTION: Garage owners cannot access Instant Meetup
          if (profile?.role === 'garage_owner') {
            return (
              <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
                <Shield className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground max-w-md">
                  Instant Meetup is not available for Garage Owner accounts. 
                  This feature is exclusively for car owners and browsers.
                </p>
                <Button onClick={() => setCurrentPage('home')} className="mt-4">
                  Go to Home
                </Button>
              </div>
            );
          }
          return <InstantMeetupPage />;
        case 'marketplace':
          return <MarketplacePage onNavigate={handlePageChange} />;
        case 'offers':
          return <OffersPage onNavigate={handlePageChange} />;
        case 'place-ad':
          return <PlaceYourAdPage onNavigate={handlePageChange} />;
        case 'listing-payment':
          return <ListingPaymentPage onNavigate={handlePageChange} listingData={listingData} listingType={listingType} />;
        case 'stripe-payment':
          return <StripePaymentPage onNavigate={handlePageChange} paymentData={paymentData} />;
        case 'payment-success':
          return <PaymentSuccessPage onNavigate={handlePageChange} paymentData={paymentData} />;
        case 'garage-hub':
          return <GarageHubPage onNavigate={handlePageChange} />;
        case 'repair-bid':
          return <RepairBidPage onNavigate={handlePageChange} />;
        case 'import-car':
          return <ImportYourCarPage onNavigate={handlePageChange} />;
        case 'legal-hub':
          return <LegalHubPage onNavigate={handlePageChange} />;
        case 'terms-of-service':
          return <TermsOfServicePage onNavigate={handlePageChange} />;
        case 'privacy-policy':
          return <PrivacyPolicyPage onNavigate={handlePageChange} />;
        case 'refund-policy':
          return <RefundPolicyPage onNavigate={handlePageChange} />;
        case 'about-us':
          return <AboutUsPage onNavigate={handlePageChange} />;
        case 'faq-knowledge-base':
          return <FAQKnowledgeBasePage onNavigate={handlePageChange} />;
        case 'events':
          return <EventsPage onNavigate={handlePageChange} />;
        case 'search':
          return <SearchPage onNavigate={handlePageChange} />;
        case 'profile':
          return <ProfilePage onNavigate={handlePageChange} />;
        case 'community-debug':
          return <CommunityDebug />;
        case 'admin':
          // Switch to dedicated admin mode
          setIsAdminMode(true);
          return <AdminDashboard 
            onExitAdmin={() => {
              setIsAdminMode(false);
              handlePageChange('home');
            }}
          />;
        case 'debug':
          return <DebugPage />;
        case 'diagnostics':
        case 'diagnostic':
          return <DiagnosticStartup />;
        case 'challenges':
          return <DailyChallengesPage />;
        case 'wallet':
          return <WalletPage />;
        
        // Enterprise Pages
        case 'mfa-setup':
        case 'settings/security/mfa':
          return <MFASetupPage />;
        case 'device-management':
        case 'settings/security/devices':
          return <DeviceManagementPage />;
        case 'notification-preferences':
        case 'settings/notifications':
          return <NotificationPreferencesPage />;
        case 'data-export':
        case 'settings/privacy/data':
          return <DataExportPage />;
        case 'maintenance':
          return <MaintenancePage />;
        
        default:
          return <WelcomePage onNavigate={handlePageChange} />;
      }
    } catch (error) {
      console.error('❌ RENDER ERROR:', error);
      setAppError(error instanceof Error ? error.message : 'Unknown error');
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0B1426] text-white p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl mb-4">⚠️ Rendering Error</h1>
            <p className="mb-4">Page: {currentPage}</p>
            <p className="text-red-400 mb-4">{appError}</p>
            <button 
              onClick={() => {
                setAppError(null);
                setCurrentPage('welcome');
              }}
              className="px-4 py-2 bg-[#D4AF37] text-black rounded"
            >
              Go to Welcome Page
            </button>
          </div>
        </div>
      );
    }
  };

  // Global error fallback
  if (appError && !currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1426] text-white p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl mb-4">❌ App Error</h1>
          <p className="text-red-400 mb-4">{appError}</p>
          <button 
            onClick={() => {
              setAppError(null);
              setCurrentPage('welcome');
              window.location.reload();
            }}
            className="px-4 py-2 bg-[#D4AF37] text-black rounded"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
  
  // Auth pages don't need the main app layout
  const isAuthPage = ['welcome', 'login', 'signup', 'forgot-password', 'verify-email', 'role-selection', 'verify-car-owner', 'verify-garage-owner', 'onboarding'].includes(currentPage);
  
  // Enterprise pages that should be full-screen (no layout)
  const isEnterpriseFullPage = ['mfa-setup', 'settings/security/mfa', 'device-management', 'settings/security/devices', 'notification-preferences', 'settings/notifications', 'data-export', 'settings/privacy/data', 'maintenance'].includes(currentPage);
  
  // Dedicated Admin Mode - Completely separate interface
  if (isAdminMode) {
    return (
      <AdminDashboard 
        onExitAdmin={() => {
          setIsAdminMode(false);
          handlePageChange('home');
        }}
      />
    );
  }
  
  // Enterprise full-page views (MFA, device management, etc.)
  if (isEnterpriseFullPage) {
    return (
      <>
        <div className="min-h-screen bg-[#0B1426] text-foreground">
          {renderCurrentPage()}
        </div>
        <ConsentBanner />
        <Toaster />
      </>
    );
  }
  
  // Auth pages don't need the main app layout
  if (isAuthPage) {
    return (
      <>
        <div className="min-h-screen bg-background text-foreground">
          {renderCurrentPage()}
        </div>
        <ConsentBanner />
        <Toaster />
      </>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Announcement Bar */}
      <AnnouncementBar />
      
      {/* Header */}
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onProfileClick={() => handlePageChange('profile')}
        onNavigate={handlePageChange}
      />
      
      <div className="flex h-[calc(100vh-120px)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentPage={currentPage} setCurrentPage={handlePageChange} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background pb-20 md:pb-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sublimes-gold)]"></div>
            </div>
          ) : (
            renderCurrentPage()
          )}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange}
        onCreatePost={() => setIsCreatePostOpen(true)}
      />
      
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => {
          setIsCreatePostOpen(false);
          // Broadcast event; listeners can refetch without full reload
          try { window.dispatchEvent(new CustomEvent('post-created')); } catch {}
        }}
      />

      {/* AI Chat Bot */}
      <AIChatBot onNavigate={handlePageChange} />

      {/* Consent Banner */}
      <ConsentBanner />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--sublimes-card-bg)',
            border: '1px solid var(--sublimes-border)',
            color: 'var(--sublimes-light-text)',
          },
        }}
      />
      
      {/* Diagnostic Components (only in dev) */}
      <FailsafeDataProbe />
    </div>
  );
}
