import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    { icon: 'car-outline', label: 'My Listings', route: '/screens/profile/my-listings', badge: '3' },
    { icon: 'bookmark-outline', label: 'Saved', route: '/screens/profile/saved', badge: null },
    { icon: 'receipt-outline', label: 'My Orders', route: '/screens/profile/my-orders', badge: null },
    { icon: 'cube-outline', label: 'My Packages', route: '/screens/profile/my-packages', badge: null },
    { icon: 'flash-outline', label: 'My Boosts', route: '/screens/profile/my-boosts', badge: null },
    { icon: 'wallet-outline', label: 'Wallet', route: '/screens/profile/wallet', badge: null },
    { icon: 'settings-outline', label: 'Settings', route: '/screens/profile/settings', badge: null },
  ];

  const quickStats = [
    { label: 'Listings', value: '3', icon: 'car-outline' },
    { label: 'Followers', value: '124', icon: 'people-outline' },
    { label: 'Following', value: '89', icon: 'person-add-outline' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[textStyles.h3, { color: palette.lightText }]}>Profile</Text>
          <Pressable style={s.iconBtn} onPress={() => router.push('/screens/notifications')}>
            <Ionicons name="notifications-outline" size={20} color={palette.lightText} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={[s.profileCard, applyShadow('card')]}>
          <View style={s.profileHeader}>
            <View style={s.avatarLarge}>
              <Ionicons name="person" size={40} color={palette.darkBg} />
            </View>
            <Pressable style={s.editBtn} onPress={() => router.push('/screens/profile/edit-profile')}>
              <Ionicons name="create-outline" size={16} color={palette.darkBg} />
            </Pressable>
          </View>

          <Text style={[textStyles.h3, { color: palette.lightText, textAlign: 'center', marginTop: spacing.md }]}>
            John Doe
          </Text>
          <Text style={[textStyles.bodySmall, { color: palette.textSecondary, textAlign: 'center', marginTop: 2 }]}>
            @johndoe
          </Text>

          {/* XP & Tier */}
          <View style={s.tierContainer}>
            <View style={s.tierBadge}>
              <Ionicons name="trophy" size={16} color={palette.darkBg} />
              <Text style={[textStyles.bodySmall, { color: palette.darkBg, fontWeight: '700', marginLeft: 4 }]}>
                Gold Tier
              </Text>
            </View>
            <View style={s.xpContainer}>
              <Ionicons name="star" size={14} color={palette.gold} />
              <Text style={[textStyles.bodySmall, { color: palette.lightText, marginLeft: 4 }]}>2,450 XP</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={s.statsRow}>
            {quickStats.map((stat, idx) => (
              <View key={idx} style={s.statItem}>
                <Ionicons name={stat.icon as any} size={20} color={palette.gold} />
                <Text style={[textStyles.h4, { color: palette.lightText, marginTop: 4 }]}>{stat.value}</Text>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={s.menuSection}>
          {menuItems.map((item, idx) => (
            <Pressable
              key={idx}
              style={[s.menuItem, applyShadow('sm')]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={s.menuIconContainer}>
                <Ionicons name={item.icon as any} size={22} color={palette.gold} />
              </View>
              <Text style={[textStyles.body, { color: palette.lightText, flex: 1 }]}>{item.label}</Text>
              {item.badge && (
                <View style={s.menuBadge}>
                  <Text style={[textStyles.caption, { color: palette.darkBg, fontWeight: '700' }]}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Additional Links */}
        <View style={s.linksSection}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>More</Text>
          
          <Pressable style={[s.linkItem, applyShadow('sm')]} onPress={() => router.push('/screens/leaderboard')}>
            <Ionicons name="trophy-outline" size={20} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.lightText, flex: 1, marginLeft: spacing.md }]}>
              Leaderboard
            </Text>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>

          <Pressable style={[s.linkItem, applyShadow('sm')]} onPress={() => router.push('/screens/legal/legal-hub')}>
            <Ionicons name="document-text-outline" size={20} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.lightText, flex: 1, marginLeft: spacing.md }]}>
              Legal Hub
            </Text>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>

          <Pressable style={[s.linkItem, applyShadow('sm')]} onPress={() => router.push('/screens/chat/ai-assistant')}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.lightText, flex: 1, marginLeft: spacing.md }]}>
              AI Assistant
            </Text>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable style={[s.logoutBtn, applyShadow('sm')]}>
          <Ionicons name="log-out-outline" size={20} color={palette.error} />
          <Text style={[textStyles.body, { color: palette.error, marginLeft: spacing.sm, fontWeight: '600' }]}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  container: { padding: spacing.lg, paddingBottom: spacing['6xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  profileCard: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.xl, marginBottom: spacing.xl },
  profileHeader: { alignItems: 'center' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  editBtn: { position: 'absolute', bottom: 0, right: '38%', width: 28, height: 28, borderRadius: 14, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: palette.cardBg },
  tierContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginTop: spacing.md },
  tierBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.gold, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  xpContainer: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: palette.border },
  statItem: { alignItems: 'center' },
  menuSection: { marginBottom: spacing.xl },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.sm },
  menuIconContainer: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  menuBadge: { backgroundColor: palette.gold, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  linksSection: { marginBottom: spacing.xl },
  linkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.sm },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: palette.error },
});
