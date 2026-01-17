import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii, layout } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function HomeScreen() {
  const router = useRouter();

  const quickActions = [
    { id: 1, icon: 'car-outline', label: 'Buy Car', route: '/marketplace' },
    { id: 2, icon: 'add-circle-outline', label: 'Sell Car', route: '/screens/listings/create-listing' },
    { id: 3, icon: 'construct-outline', label: 'Find Garage', route: '/garage' },
    { id: 4, icon: 'chatbubble-outline', label: 'AI Assistant', route: '/screens/chat/ai-assistant' },
  ];

  const trendingTopics = [
    { id: 1, name: 'Porsche911', count: '2.4k' },
    { id: 2, name: 'DubaiCars', count: '1.8k' },
    { id: 3, name: 'ModifiedCars', count: '1.2k' },
    { id: 4, name: 'CarMeet', count: '980' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[textStyles.h3, { color: palette.lightText }]}>Sublimes Drive</Text>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Welcome back!</Text>
          </View>
          <View style={s.headerIcons}>
            <Pressable style={s.iconBtn} onPress={() => router.push('/screens/search')}>
              <Ionicons name="search-outline" size={20} color={palette.lightText} />
            </Pressable>
            <Pressable style={s.iconBtn} onPress={() => router.push('/screens/notifications')}>
              <Ionicons name="notifications-outline" size={20} color={palette.lightText} />
              <View style={s.badge} />
            </Pressable>
          </View>
        </View>

        {/* User Stats Card */}
        <View style={[s.card, applyShadow('card')]}>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={[textStyles.h2, { color: palette.gold }]}>2,450</Text>
              <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>XP Points</Text>
            </View>
            <View style={s.divider} />
            <View style={s.stat}>
              <Text style={[textStyles.h2, { color: palette.lightText }]}>Gold</Text>
              <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>Tier</Text>
            </View>
            <View style={s.divider} />
            <View style={s.stat}>
              <Text style={[textStyles.h2, { color: palette.lightText }]}>12</Text>
              <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Quick Actions
          </Text>
          <View style={s.actionsGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={[s.actionCard, applyShadow('sm')]}
                onPress={() => router.push(action.route as any)}
              >
                <Ionicons name={action.icon as any} size={28} color={palette.gold} />
                <Text style={[textStyles.bodySmall, { color: palette.lightText, marginTop: spacing.xs, textAlign: 'center' }]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Trending Topics */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[textStyles.h4, { color: palette.lightText }]}>Trending Topics</Text>
            <Pressable>
              <Text style={[textStyles.bodySmall, { color: palette.gold }]}>See all</Text>
            </Pressable>
          </View>
          <View style={s.topicsContainer}>
            {trendingTopics.map((topic) => (
              <Pressable key={topic.id} style={s.topicChip}>
                <Text style={[textStyles.bodySmall, { color: palette.gold }]}>#{topic.name}</Text>
                <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>
                  {topic.count}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Recent Activity
          </Text>
          {[1, 2, 3].map((item) => (
            <View key={item} style={[s.postCard, applyShadow('sm')]}>
              <View style={s.postHeader}>
                <View style={s.avatar}>
                  <Ionicons name="person" size={20} color={palette.darkBg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600' }]}>
                    User Name
                  </Text>
                  <Text style={[textStyles.caption, { color: palette.textSecondary }]}>2 hours ago</Text>
                </View>
                <Pressable>
                  <Ionicons name="ellipsis-horizontal" size={20} color={palette.textSecondary} />
                </Pressable>
              </View>
              <Text style={[textStyles.body, { color: palette.lightText, marginTop: spacing.sm }]}>
                Just picked up my dream car! Check it out 🚗
              </Text>
              <View style={s.postActions}>
                <Pressable style={s.postAction}>
                  <Ionicons name="heart-outline" size={18} color={palette.textSecondary} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 4 }]}>24</Text>
                </Pressable>
                <Pressable style={s.postAction}>
                  <Ionicons name="chatbubble-outline" size={18} color={palette.textSecondary} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: 4 }]}>5</Text>
                </Pressable>
                <Pressable style={s.postAction}>
                  <Ionicons name="share-social-outline" size={18} color={palette.textSecondary} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* FAB for Create Post */}
        <Pressable style={s.fab}>
          <Ionicons name="add" size={28} color={palette.darkBg} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  container: { padding: spacing.lg, paddingBottom: spacing['6xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerIcons: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.error },
  card: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  divider: { width: 1, height: 40, backgroundColor: palette.border },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionCard: { width: '47%', backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' },
  topicsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topicChip: { flexDirection: 'row', backgroundColor: palette.cardBg, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: palette.gold },
  postCard: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  postActions: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  postAction: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', bottom: spacing['4xl'], right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', ...applyShadow('lg') },
});
