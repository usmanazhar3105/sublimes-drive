import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { useRole } from '../hooks/useRole';
import { Card, CardContent, CardHeader } from './ui/card';

export function DebugPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [bannerData, setBannerData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  
  const { role, isAdmin, isEditor, loading: roleLoading } = useRole();

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    try {
      // 1. Check auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setError(`Auth Error: ${authError.message}`);
        return;
      }
      setAuthUser(user);

      // 2. Check profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          setError(`Profile Error: ${profileError.message}`);
        } else {
          setProfileData(profile);
        }
      }

      // 3. Check banners
      const { data: banners, error: bannersError } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (bannersError) {
        setError(`Banners Error: ${bannersError.message}`);
      } else {
        setBannerData(banners || []);
      }
    } catch (err: any) {
      setError(`Unexpected Error: ${err.message}`);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[#0B1426] min-h-screen">
      <h1 className="text-3xl font-bold text-[#D4AF37]">🔍 Debug Page</h1>
      
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <CardHeader>
            <h2 className="text-xl font-bold text-red-500">❌ Error</h2>
          </CardHeader>
          <CardContent>
            <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
          </CardContent>
        </Card>
      )}

      {/* Auth Status */}
      <Card className="bg-[#1A2332] border-[#2A3342]">
        <CardHeader>
          <h2 className="text-xl font-bold text-[#E8EAED]">1. Authentication Status</h2>
        </CardHeader>
        <CardContent>
          {authUser ? (
            <div className="space-y-2 text-[#E8EAED]">
              <p className="text-green-400">✅ User is logged in</p>
              <p><strong>User ID:</strong> {authUser.id}</p>
              <p><strong>Email:</strong> {authUser.email}</p>
              <p><strong>Created:</strong> {new Date(authUser.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-400">❌ No user logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Profile Data */}
      <Card className="bg-[#1A2332] border-[#2A3342]">
        <CardHeader>
          <h2 className="text-xl font-bold text-[#E8EAED]">2. Profile Data</h2>
        </CardHeader>
        <CardContent>
          {profileData ? (
            <div className="space-y-2 text-[#E8EAED]">
              <p className="text-green-400">✅ Profile exists</p>
              <p><strong>Display Name:</strong> {profileData.display_name}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Role:</strong> <span className={profileData.role === 'admin' ? 'text-[#D4AF37] font-bold' : 'text-white'}>{profileData.role}</span></p>
              {profileData.role === 'admin' && (
                <p className="text-green-400 font-bold">🛡️ This user IS an admin!</p>
              )}
              {profileData.role !== 'admin' && (
                <p className="text-yellow-400">⚠️ This user is NOT an admin (role = {profileData.role})</p>
              )}
            </div>
          ) : (
            <p className="text-red-400">❌ No profile found</p>
          )}
        </CardContent>
      </Card>

      {/* useRole Hook */}
      <Card className="bg-[#1A2332] border-[#2A3342]">
        <CardHeader>
          <h2 className="text-xl font-bold text-[#E8EAED]">3. useRole Hook Status</h2>
        </CardHeader>
        <CardContent>
          {roleLoading ? (
            <p className="text-yellow-400">⏳ Loading...</p>
          ) : (
            <div className="space-y-2 text-[#E8EAED]">
              <p><strong>Role from hook:</strong> {role}</p>
              <p><strong>isAdmin:</strong> {isAdmin ? '✅ TRUE' : '❌ FALSE'}</p>
              <p><strong>isEditor:</strong> {isEditor ? '✅ TRUE' : '❌ FALSE'}</p>
              {isAdmin && (
                <p className="text-green-400 font-bold">🛡️ Admin Panel SHOULD be visible in sidebar</p>
              )}
              {!isAdmin && (
                <p className="text-yellow-400">⚠️ Admin Panel will NOT be visible (need admin or editor role)</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner Data */}
      <Card className="bg-[#1A2332] border-[#2A3342]">
        <CardHeader>
          <h2 className="text-xl font-bold text-[#E8EAED]">4. Banner Data</h2>
        </CardHeader>
        <CardContent>
          {bannerData.length > 0 ? (
            <div className="space-y-3">
              <p className="text-green-400">✅ Found {bannerData.length} active banners</p>
              {bannerData.map((banner, idx) => (
                <div key={banner.id} className="p-3 bg-[#0B1426] rounded border border-[#2A3342]">
                  <p className="text-[#D4AF37]">Banner {idx + 1}</p>
                  <p className="text-[#E8EAED]"><strong>Title:</strong> {banner.title}</p>
                  <p className="text-[#E8EAED]"><strong>Subtitle:</strong> {banner.subtitle}</p>
                  <p className="text-[#E8EAED]"><strong>Active:</strong> {banner.active ? '✅ Yes' : '❌ No'}</p>
                  <p className="text-[#E8EAED]"><strong>Order:</strong> {banner.order_index}</p>
                </div>
              ))}
              <p className="text-green-400 font-bold">🎨 BannerSlider SHOULD show these on home page</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-400">❌ No active banners found in database</p>
              <p className="text-yellow-400">⚠️ This is why banner slider is empty</p>
              <p className="text-white">Run this SQL to add banners:</p>
              <pre className="p-3 bg-[#0B1426] rounded text-xs text-green-400 overflow-x-auto">
{`INSERT INTO banners (title, subtitle, cta_label, cta_link, image_url, is_active, order_index)
VALUES 
  ('Welcome!', 'Join our community', 'Explore', '/marketplace', 
   'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200', true, 1);`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-[#1A2332] border-[#2A3342]">
        <CardHeader>
          <h2 className="text-xl font-bold text-[#E8EAED]">5. Quick Actions</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={checkEverything}
            className="px-4 py-2 bg-[#D4AF37] text-[#0B1426] rounded font-bold hover:bg-[#C49F2F]"
          >
            🔄 Refresh All Data
          </button>
          
          {profileData && profileData.role !== 'admin' && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded">
              <p className="text-yellow-400 font-bold mb-2">⚠️ Your role is: {profileData.role}</p>
              <p className="text-white mb-2">To become admin, run this SQL in Supabase:</p>
              <pre className="p-3 bg-[#0B1426] rounded text-xs text-green-400 overflow-x-auto">
{`UPDATE profiles 
SET role = 'admin' 
WHERE id = '${profileData.id}';`}
              </pre>
              <p className="text-white mt-2 text-sm">Then refresh this page</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
